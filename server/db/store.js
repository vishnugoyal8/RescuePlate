import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Pre-hashed demo passwords (salt rounds = 10)
// 'DemoDonor@2026', 'DemoNgo@2026', 'DemoAdmin@2026'
const DONOR_PASSWORD_HASH = bcrypt.hashSync('DemoDonor@2026', 10);
const NGO_PASSWORD_HASH = bcrypt.hashSync('DemoNgo@2026', 10);
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('DemoAdmin@2026', 10);

const SEED_USERS = [
  {
    id: "usr_admin_001",
    email: "admin@rescueplate.org",
    passwordHash: ADMIN_PASSWORD_HASH,
    fullName: "Kavita Singhal",
    orgName: "RescuePlate Trust & Verification Authority",
    role: "admin",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-ADMIN-VERIFIER-001",
    phone: "+91 11 2345 6789",
    locality: "Central Delhi",
    createdAt: "2026-06-01T08:00:00.000Z"
  },
  {
    id: "usr_donor_001",
    email: "donor@grandpearl.com",
    passwordHash: DONOR_PASSWORD_HASH,
    fullName: "Chef Vikram Sethi",
    orgName: "Grand Pearl Banquet & Hotel",
    role: "donor",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-FSSAI-REG-4412B",
    phone: "+91 98112 88990",
    locality: "Indirapuram, Ghaziabad",
    createdAt: "2026-09-01T12:00:00.000Z"
  },
  {
    id: "usr_donor_002",
    email: "donor@royalspoon.com",
    passwordHash: DONOR_PASSWORD_HASH,
    fullName: "Rajesh Sharma",
    orgName: "Royal Spoon Banquets",
    role: "donor",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-FSSAI-REG-9821A",
    phone: "+91 98101 23456",
    locality: "Sector 18, Noida",
    createdAt: "2026-08-15T10:00:00.000Z"
  },
  {
    id: "usr_donor_003",
    email: "pending@saffron.com",
    passwordHash: DONOR_PASSWORD_HASH,
    fullName: "Virender Chawla",
    orgName: "Saffron Heritage Banquets",
    role: "donor",
    verificationStatus: "Pending Review",
    simulatedRegistrationId: "DEMO-FSSAI-REG-7721D",
    phone: "+91 98100 55443",
    locality: "Saket, South Delhi",
    createdAt: "2026-10-01T11:00:00.000Z"
  },
  {
    id: "usr_ngo_001",
    email: "ngo@asha.org",
    passwordHash: NGO_PASSWORD_HASH,
    fullName: "Dr. Sunita Rao",
    orgName: "Asha Ek Kadam",
    role: "ngo",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-NGO-DARPAN-4401X",
    phone: "+91 98200 11223",
    locality: "Mayur Vihar, East Delhi",
    capacity: 60,
    createdAt: "2026-08-20T09:00:00.000Z"
  },
  {
    id: "usr_ngo_002",
    email: "ngo@pratham.org",
    passwordHash: NGO_PASSWORD_HASH,
    fullName: "Amit Trivedi",
    orgName: "Pratham Food Relief",
    role: "ngo",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-NGO-DARPAN-9912Y",
    phone: "+91 98199 44332",
    locality: "Laxmi Nagar, Delhi",
    capacity: 100,
    createdAt: "2026-08-25T14:00:00.000Z"
  },
  {
    id: "usr_ngo_003",
    email: "pending@hopeshelter.org",
    passwordHash: NGO_PASSWORD_HASH,
    fullName: "Sister Mary",
    orgName: "Hope Shelter Home",
    role: "ngo",
    verificationStatus: "Pending Review",
    simulatedRegistrationId: "DEMO-NGO-DARPAN-1102Z",
    phone: "+91 98111 22334",
    locality: "Rohini, North Delhi",
    capacity: 25,
    createdAt: "2026-10-05T08:30:00.000Z"
  }
];

const INITIAL_KYC_RECORDS = [
  {
    id: "ORG-DON-001",
    name: "Royal Spoon Banquets",
    type: "Commercial Kitchen & Catering",
    category: "Donor",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-FSSAI-REG-9821A",
    verifiedAt: "2026-08-15T10:00:00.000Z",
    hygieneRating: "4.8 / 5.0 (Simulated)",
    contactPerson: "Rajesh Sharma (Catering Lead)",
    phone: "+91 98101 23456",
    locality: "Sector 18, Noida",
    complianceNotes: "Simulated hygiene inspection passed. Commercial food-handling certificate verified.",
    totalMealsRescued: 2450,
    completedDispatches: 48,
    activeSince: "2025"
  },
  {
    id: "ORG-DON-002",
    name: "Grand Pearl Banquet & Hotel",
    type: "Hotel & Banquet Operations",
    category: "Donor",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-FSSAI-REG-4412B",
    verifiedAt: "2026-09-01T12:00:00.000Z",
    hygieneRating: "4.9 / 5.0 (Simulated)",
    contactPerson: "Chef Vikram Sethi",
    phone: "+91 98112 88990",
    locality: "Indirapuram, Ghaziabad",
    complianceNotes: "Simulated commercial hotel license verified. Temperature-controlled prep facility.",
    totalMealsRescued: 3100,
    completedDispatches: 62,
    activeSince: "2024"
  },
  {
    id: "ORG-DON-003",
    name: "Crust & Crumb Bakery",
    type: "Artisan Bakery & Cafe",
    category: "Donor",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-FSSAI-REG-3190C",
    verifiedAt: "2026-09-10T14:30:00.000Z",
    hygieneRating: "4.7 / 5.0 (Simulated)",
    contactPerson: "Ananya Deshmukh",
    phone: "+91 98712 34567",
    locality: "Connaught Place, New Delhi",
    complianceNotes: "Simulated daily bake health check verified.",
    totalMealsRescued: 1200,
    completedDispatches: 29,
    activeSince: "2025"
  },
  {
    id: "ORG-DON-004",
    name: "Saffron Heritage Banquets",
    type: "Banquets & Event Hospitality",
    category: "Donor",
    verificationStatus: "Pending Review",
    simulatedRegistrationId: "DEMO-FSSAI-REG-7721D",
    verifiedAt: null,
    hygieneRating: "Under Audit",
    contactPerson: "Virender Chawla",
    phone: "+91 98100 55443",
    locality: "Saket, South Delhi",
    complianceNotes: "Documents submitted for demo audit. Awaiting simulated kitchen hygiene sign-off.",
    totalMealsRescued: 0,
    completedDispatches: 0,
    activeSince: "2026"
  },
  {
    id: "ORG-DON-005",
    name: "Midnight Express Quick Bites",
    type: "Takeaway Cloud Kitchen",
    category: "Donor",
    verificationStatus: "Rejected",
    simulatedRegistrationId: "DEMO-FSSAI-REG-0089E",
    verifiedAt: null,
    hygieneRating: "Failed (Simulated)",
    contactPerson: "Kunal Mehra",
    phone: "+91 98990 11223",
    locality: "Karol Bagh, New Delhi",
    complianceNotes: "Simulated rejection: Lacks certified insulated hot storage equipment for cooked buffet food.",
    totalMealsRescued: 0,
    completedDispatches: 0,
    activeSince: "2026"
  },
  {
    id: "ORG-NGO-001",
    name: "Asha Ek Kadam",
    type: "Community Shelter & Night Home",
    category: "NGO",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-NGO-DARPAN-4401X",
    verifiedAt: "2026-07-20T11:00:00.000Z",
    hygieneRating: "5.0 / 5.0 (Simulated)",
    contactPerson: "Dr. Sunita Rao",
    phone: "+91 98200 11223",
    locality: "Mayur Vihar, East Delhi",
    complianceNotes: "NGO Darpan verified (simulated). Equipped with walk-in refrigeration units.",
    totalMealsRescued: 4100,
    completedDispatches: 80,
    activeSince: "2023"
  },
  {
    id: "ORG-NGO-002",
    name: "Pratham Food Relief",
    type: "Child Welfare & Daily Feeding",
    category: "NGO",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-NGO-DARPAN-9912Y",
    verifiedAt: "2026-08-01T09:30:00.000Z",
    hygieneRating: "4.8 / 5.0 (Simulated)",
    contactPerson: "Amit Trivedi",
    phone: "+91 98199 44332",
    locality: "Laxmi Nagar, Delhi",
    complianceNotes: "Simulated childcare feeding license verified. Insulated delivery vans operational.",
    totalMealsRescued: 2800,
    completedDispatches: 55,
    activeSince: "2024"
  },
  {
    id: "ORG-NGO-003",
    name: "Hope Shelter Home",
    type: "Community Youth Home",
    category: "NGO",
    verificationStatus: "Pending Review",
    simulatedRegistrationId: "DEMO-NGO-DARPAN-1102Z",
    verifiedAt: null,
    hygieneRating: "Under Audit",
    contactPerson: "Sister Mary",
    phone: "+91 98111 22334",
    locality: "Rohini, North Delhi",
    complianceNotes: "Simulated registration audit pending. Cold chain inspection scheduled.",
    totalMealsRescued: 0,
    completedDispatches: 0,
    activeSince: "2026"
  }
];

class FileDatabase {
  constructor() {
    this.data = {
      users: [],
      password_resets: [],
      audit_logs: [],
      verification_records: []
    };
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure all collections exist
        if (!this.data.users) this.data.users = [];
        if (!this.data.password_resets) this.data.password_resets = [];
        if (!this.data.audit_logs) this.data.audit_logs = [];
        if (!this.data.verification_records || this.data.verification_records.length === 0) {
          this.data.verification_records = [...INITIAL_KYC_RECORDS];
        }

        // Check if demo users need to be seeded or updated
        for (const seedUser of SEED_USERS) {
          const existing = this.data.users.find(u => u.email.toLowerCase() === seedUser.email.toLowerCase());
          if (!existing) {
            this.data.users.push(seedUser);
          }
        }
        this.save();
      } catch (err) {
        console.error("Failed to read database file, reinitializing:", err);
        this.data.users = [...SEED_USERS];
        this.data.verification_records = [...INITIAL_KYC_RECORDS];
        this.save();
      }
    } else {
      this.data.users = [...SEED_USERS];
      this.data.verification_records = [...INITIAL_KYC_RECORDS];
      this.save();
    }
  }

  save() {
    try {
      // Atomic write: write to temp file then rename
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error("Failed to persist database file:", err);
    }
  }

  resetForTesting() {
    this.data.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.data.verification_records = JSON.parse(JSON.stringify(INITIAL_KYC_RECORDS));
    this.save();
  }

  // Users collection queries
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  findUserById(id) {
    if (!id) return null;
    return this.data.users.find(u => u.id === id) || null;
  }

  createUser(userData) {
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.users[idx];
  }

  // Password resets collection
  createPasswordReset(email, tokenHash, expiresAt) {
    // Invalidate existing resets for this email
    this.data.password_resets = this.data.password_resets.filter(
      r => r.email.toLowerCase() !== email.toLowerCase()
    );
    const resetRecord = {
      email: email.toLowerCase(),
      tokenHash,
      expiresAt,
      createdAt: new Date().toISOString()
    };
    this.data.password_resets.push(resetRecord);
    this.save();
    return resetRecord;
  }

  findPasswordReset(email) {
    return this.data.password_resets.find(
      r => r.email.toLowerCase() === email.toLowerCase()
    ) || null;
  }

  removePasswordReset(email) {
    this.data.password_resets = this.data.password_resets.filter(
      r => r.email.toLowerCase() !== email.toLowerCase()
    );
    this.save();
  }

  // Audit logging
  logAudit(event, actor, details = {}) {
    this.data.audit_logs.push({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      event,
      actor,
      details
    });
    // Keep last 500 audit logs
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs.shift();
    }
    this.save();
  }

  // -------------------------------------------------------------
  // KYC & Trust Collection Methods
  // -------------------------------------------------------------

  /**
   * Retrieves public-safe Community Trust Profiles.
   * Strips all private KYC fields: phone, contactPerson, demo reg IDs, and audit notes.
   */
  getPublicTrustProfiles() {
    return this.data.verification_records
      .filter(r => r.verificationStatus === 'Verified')
      .map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        category: r.category,
        locality: r.locality,
        verificationBadge: "Verified Community Partner",
        trustTier: "Tier-1 Validated",
        hygieneRating: r.hygieneRating || "4.8 / 5.0 (Simulated)",
        activeSince: r.activeSince || "2025",
        completedDispatches: r.completedDispatches || 0,
        totalMealsRescued: r.totalMealsRescued || 0
      }));
  }

  /**
   * Retrieves an organization's own KYC profile.
   * Only accessible to members of the specific organization.
   */
  getMyKycRecord(orgName) {
    if (!orgName) return null;
    const match = this.data.verification_records.find(
      r => r.name.toLowerCase() === orgName.trim().toLowerCase()
    );

    if (!match) {
      return {
        name: orgName,
        verificationStatus: "Pending Review",
        simulatedRegistrationId: "DEMO-REG-PENDING",
        complianceNotes: "Registration submitted for compliance audit.",
        isVerified: false
      };
    }

    return {
      id: match.id,
      name: match.name,
      category: match.category,
      type: match.type,
      locality: match.locality,
      verificationStatus: match.verificationStatus,
      simulatedRegistrationId: match.simulatedRegistrationId,
      verifiedAt: match.verifiedAt,
      complianceNotes: match.complianceNotes,
      hygieneRating: match.hygieneRating,
      isVerified: match.verificationStatus === 'Verified'
    };
  }

  /**
   * Retrieves unredacted verification queue for administrators and verifiers only.
   */
  getAdminKycRecords() {
    return this.data.verification_records.map(r => ({
      ...r,
      isVerified: r.verificationStatus === 'Verified'
    }));
  }

  /**
   * Administrative update of an organization's verification status.
   */
  updateKycStatus(id, newStatus, verifierNotes, auditorEmail = "system@rescueplate.org") {
    const idx = this.data.verification_records.findIndex(r => r.id === id);
    if (idx === -1) return null;

    const current = this.data.verification_records[idx];
    const previousStatus = current.verificationStatus;

    this.data.verification_records[idx] = {
      ...current,
      verificationStatus: newStatus,
      verifiedAt: newStatus === 'Verified' ? new Date().toISOString() : null,
      complianceNotes: verifierNotes || current.complianceNotes,
      auditorEmail,
      updatedAt: new Date().toISOString()
    };

    // Update corresponding user accounts in database if any match orgName
    const matchingUsers = this.data.users.filter(
      u => u.orgName && u.orgName.toLowerCase() === current.name.toLowerCase()
    );
    matchingUsers.forEach(u => {
      u.verificationStatus = newStatus;
    });

    this.logAudit("KYC_STATUS_UPDATED", auditorEmail, {
      orgId: id,
      orgName: current.name,
      previousStatus,
      newStatus,
      verifierNotes
    });

    this.save();
    return this.data.verification_records[idx];
  }
}

export const db = new FileDatabase();
