import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../db/store.js';

/**
 * Extracts and verifies JWT from HttpOnly cookie or Authorization header.
 * Attaches sanitized user to req.user if valid.
 */
export function authenticateToken(req, res, next) {
  let token = null;

  // 1. Prefer HttpOnly secure cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. Fallback to Authorization: Bearer <token> for API test scripts
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.findUserById(decoded.id);

    if (!user) {
      req.user = null;
      return next();
    }

    // Attach sanitized user (never include passwordHash)
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      orgName: user.orgName,
      role: user.role,
      verificationStatus: user.verificationStatus,
      simulatedRegistrationId: user.simulatedRegistrationId,
      phone: user.phone,
      locality: user.locality,
      capacity: user.capacity
    };
    next();
  } catch (err) {
    // Expired or invalid token
    req.user = null;
    next();
  }
}

/**
 * Route guard requiring authenticated user.
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required. Please log in to continue.",
      code: "UNAUTHENTICATED"
    });
  }
  next();
}

/**
 * Route guard requiring specific role(s) (e.g. ['donor'] or ['ngo']).
 */
export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
        code: "UNAUTHENTICATED"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. This action is restricted to ${roles.join(' or ')} accounts. Your current role is "${req.user.role}".`,
        code: "FORBIDDEN",
        currentRole: req.user.role,
        requiredRoles: roles
      });
    }

    next();
  };
}

/**
 * Route guard requiring Verified organization KYC status.
 * Prevents Pending Review or Rejected organizations from performing restricted actions.
 */
export function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required.",
      code: "UNAUTHENTICATED"
    });
  }

  if (req.user.verificationStatus !== 'Verified') {
    return res.status(403).json({
      error: `Organization KYC status is "${req.user.verificationStatus}". Only verified organizations can broadcast or claim food batches.`,
      code: "VERIFICATION_REQUIRED",
      verificationStatus: req.user.verificationStatus
    });
  }

  next();
}

/**
 * Route guard requiring administrator / compliance verifier account.
 * Strictly blocks donors and NGOs from accessing sensitive verification records.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required. Please log in with a verifier or administrator account.",
      code: "UNAUTHENTICATED"
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: "Access denied. Only authorized compliance verifiers and administrators can access private organization KYC records and audit logs.",
      code: "ADMIN_REQUIRED",
      currentRole: req.user.role
    });
  }

  next();
}
