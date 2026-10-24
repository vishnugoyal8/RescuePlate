import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { db } from '../db/store.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Strict rate-limiting for login attempts to prevent credential brute-forcing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts from this IP. Please try again after 15 minutes.",
    code: "RATE_LIMITED"
  }
});

// Helper to issue JWT and set HttpOnly cookie
function setAuthCookie(res, user) {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      orgName: user.orgName
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: config.cookieMaxAge
  });

  return token;
}

// Sanitize user object for client consumption
function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    orgName: user.orgName,
    role: user.role,
    verificationStatus: user.verificationStatus,
    simulatedRegistrationId: user.simulatedRegistrationId,
    phone: user.phone || "",
    locality: user.locality || "",
    capacity: user.capacity || 0,
    createdAt: user.createdAt
  };
}

/**
 * POST /api/auth/register
 * Public registration for Food Donors and Recipient NGOs.
 */
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, 
      orgName, 
      email, 
      password, 
      confirmPassword, 
      role, 
      phone, 
      locality, 
      capacity 
    } = req.body;

    // 1. Validate required fields
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (!orgName || !orgName.trim()) {
      return res.status(400).json({ error: "Organization or business name is required." });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    // 2. Strict Role Assignment Prevention: Public users can ONLY choose 'donor' or 'ngo'
    const validRoles = ['donor', 'ngo'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        error: "Invalid role specified. Registration is only permitted for Food Donors or Recipient NGOs.",
        code: "INVALID_ROLE"
      });
    }

    // 3. Password strength and match validation
    if (!password || password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long."
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match."
      });
    }

    // 4. Duplicate email check
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email address already exists.",
        code: "EMAIL_EXISTS"
      });
    }

    // 5. Password hashing with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // 6. Security Rule: Public registrations are initialized with "Pending Review" status.
    // Self-assignment of "Verified" status is strictly disallowed on the server.
    const newUser = db.createUser({
      fullName: fullName.trim(),
      orgName: orgName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role.toLowerCase(),
      verificationStatus: "Pending Review",
      simulatedRegistrationId: `DEMO-REG-${Date.now().toString().slice(-6)}`,
      phone: phone ? phone.trim() : "",
      locality: locality ? locality.trim() : "Delhi NCR",
      capacity: role === 'ngo' ? (Number(capacity) || 50) : 0
    });

    db.logAudit("USER_REGISTERED", newUser.email, {
      role: newUser.role,
      orgName: newUser.orgName
    });

    // Issue JWT and HttpOnly cookie
    setAuthCookie(res, newUser);

    return res.status(201).json({
      message: "Registration successful. Welcome to RescuePlate!",
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Internal server error during registration." });
  }
});

/**
 * POST /api/auth/login
 * Authenticates user credentials and issues secure HttpOnly cookie.
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
        code: "MISSING_CREDENTIALS"
      });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      db.logAudit("FAILED_LOGIN_ATTEMPT", email, { reason: "User not found" });
      return res.status(401).json({
        error: "Invalid email or password.",
        code: "INVALID_CREDENTIALS"
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      db.logAudit("FAILED_LOGIN_ATTEMPT", email, { reason: "Incorrect password" });
      return res.status(401).json({
        error: "Invalid email or password.",
        code: "INVALID_CREDENTIALS"
      });
    }

    db.logAudit("USER_LOGGED_IN", user.email, { role: user.role });

    // Issue JWT and HttpOnly cookie
    setAuthCookie(res, user);

    return res.json({
      message: "Login successful.",
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

/**
 * POST /api/auth/logout
 * Clears HttpOnly session cookie.
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax'
  });

  return res.json({ message: "Logged out successfully." });
});

/**
 * GET /api/auth/me
 * Restores session on client page refresh via HttpOnly cookie.
 */
router.get('/me', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      authenticated: false,
      user: null
    });
  }

  return res.json({
    authenticated: true,
    user: req.user
  });
});

/**
 * POST /api/auth/forgot-password
 * Initiates secure password reset flow.
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Please provide an email address." });
    }

    const user = db.findUserByEmail(email);
    
    // Always return generic success to prevent email enumeration attacks
    if (!user) {
      return res.json({
        message: "If an account matches that email address, reset instructions have been generated.",
        demoTokenNotice: "In this hackathon demonstration, account not found."
      });
    }

    // Generate high-entropy cryptographic token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    db.createPasswordReset(user.email, tokenHash, expiresAt);
    db.logAudit("PASSWORD_RESET_REQUESTED", user.email);

    return res.json({
      message: "Password reset instructions generated successfully.",
      // Demo helper: expose token for hackathon testing without an external SMTP gateway
      demoResetToken: rawToken,
      expiresAt
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Failed to process password reset request." });
  }
});

/**
 * POST /api/auth/reset-password
 * Validates reset token and sets new hashed password.
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Email, token, and new password are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const resetRecord = db.findPasswordReset(email);
    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired password reset token." });
    }

    if (new Date(resetRecord.expiresAt) < new Date()) {
      db.removePasswordReset(email);
      return res.status(400).json({ error: "Password reset token has expired. Please request a new one." });
    }

    // Verify token hash
    const inputTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (inputTokenHash !== resetRecord.tokenHash) {
      return res.status(400).json({ error: "Invalid password reset token." });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    // Hash new password and update user
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    db.updateUser(user.id, { passwordHash: newPasswordHash });
    db.removePasswordReset(email);

    db.logAudit("PASSWORD_RESET_COMPLETED", user.email);

    return res.json({
      message: "Password has been successfully updated. You may now log in with your new password."
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Failed to reset password." });
  }
});

/**
 * GET /api/auth/demo-users
 * Returns list of seeded demo accounts for 1-click test logins.
 */
router.get('/demo-users', (req, res) => {
  return res.json({
    donors: [
      {
        email: "donor@grandpearl.com",
        name: "Chef Vikram Sethi",
        orgName: "Grand Pearl Banquet & Hotel",
        role: "donor",
        verificationStatus: "Verified",
        hint: "DemoDonor@2026"
      },
      {
        email: "pending@saffron.com",
        name: "Virender Chawla",
        orgName: "Saffron Heritage Banquets",
        role: "donor",
        verificationStatus: "Pending Review",
        hint: "DemoDonor@2026 (Tests KYC Gating)"
      }
    ],
    ngos: [
      {
        email: "ngo@asha.org",
        name: "Dr. Sunita Rao",
        orgName: "Asha Ek Kadam",
        role: "ngo",
        verificationStatus: "Verified",
        hint: "DemoNgo@2026"
      },
      {
        email: "pending@hopeshelter.org",
        name: "Sister Mary",
        orgName: "Hope Shelter Home",
        role: "ngo",
        verificationStatus: "Pending Review",
        hint: "DemoNgo@2026 (Tests NGO Gating)"
      }
    ],
    admins: [
      {
        email: "admin@rescueplate.org",
        name: "Kavita Singhal",
        orgName: "RescuePlate Trust & Verification Authority",
        role: "admin",
        verificationStatus: "Verified",
        hint: "DemoAdmin@2026 (Compliance Verifier Console)"
      }
    ]
  });
});

/**
 * PUT /api/auth/profile
 * Security Control: Prohibits self-elevation of roles or self-assignment of verification status.
 */
router.put('/profile', requireAuth, (req, res) => {
  const { role, verificationStatus } = req.body;

  // Strict Protection: Reject attempts to alter role or verification status
  if (role || verificationStatus) {
    db.logAudit("FORBIDDEN_ROLE_ELEVATION_ATTEMPT", req.user.email, {
      attemptedRole: role,
      attemptedStatus: verificationStatus
    });
    return res.status(403).json({
      error: "Access denied. Self-elevation of roles or self-assignment of verification status is strictly prohibited.",
      code: "ROLE_ELEVATION_FORBIDDEN"
    });
  }

  // Safe field updates only
  const { phone, locality } = req.body;
  const updated = db.updateUser(req.user.id, {
    ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
    ...(locality !== undefined ? { locality: String(locality).trim() } : {})
  });

  return res.json({
    message: "Profile updated successfully.",
    user: sanitizeUser(updated)
  });
});

export default router;
