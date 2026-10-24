import express from 'express';
import { 
  requireAuth, 
  requireRole, 
  requireVerified 
} from '../middleware/auth.js';
import { validateStateTransition } from '../../src/utils/stateTransitions.js';

const router = express.Router();

// In-memory/local server cache for demonstration and test isolation
// Initialized with standard demo dispatches
let serverDonations = [
  {
    id: "DON-101",
    donorOrg: "Royal Spoon Banquets",
    donorUserId: "usr_donor_002",
    foodName: "North Indian Dinner Buffet Surplus",
    category: "Cooked Meals",
    quantity: 45,
    unit: "meals",
    status: "Delivered",
    claimedBy: "Asha Ek Kadam",
    claimedByUserId: "usr_ngo_001",
    collectionDeadline: "2026-10-24T23:30:00Z"
  },
  {
    id: "DON-102",
    donorOrg: "Grand Pearl Banquet & Hotel",
    donorUserId: "usr_donor_001",
    foodName: "Assorted Breads & Roti Baskets",
    category: "Bakery & Bread",
    quantity: 60,
    unit: "portions",
    status: "Claimed",
    claimedBy: "Asha Ek Kadam",
    claimedByUserId: "usr_ngo_001",
    collectionDeadline: "2026-10-25T01:00:00Z"
  },
  {
    id: "DON-103",
    donorOrg: "Grand Pearl Banquet & Hotel",
    donorUserId: "usr_donor_001",
    foodName: "Vegetable Pulao & Dal Makhani",
    category: "Cooked Meals",
    quantity: 35,
    unit: "meals",
    status: "Available",
    claimedBy: null,
    claimedByUserId: null,
    collectionDeadline: "2026-10-25T02:00:00Z"
  }
];

/**
 * GET /api/donations/public-summary
 * Public non-sensitive aggregate statistics for the unauthenticated landing page.
 */
router.get('/public-summary', (req, res) => {
  const total = serverDonations.length;
  const delivered = serverDonations.filter(d => d.status === 'Delivered').length;
  const available = serverDonations.filter(d => d.status === 'Available').length;
  return res.json({
    totalDonations: total,
    deliveredCount: delivered,
    availableCount: available,
    estimatedMealsRescued: serverDonations.reduce((sum, d) => sum + (d.quantity || 0), 0)
  });
});

/**
 * GET /api/donations
 * Retrieves donations with role-based scoping and authentication protection.
 * Unauthenticated requests receive 401 UNAUTHENTICATED.
 */
router.get('/', requireAuth, (req, res) => {
  if (req.user.role === 'donor') {
    // Food Donors see their own listings and public available listings
    const scoped = serverDonations.filter(d => 
      d.donorOrg.toLowerCase() === req.user.orgName.toLowerCase() ||
      d.status === 'Available'
    );
    return res.json({ donations: scoped });
  } else if (req.user.role === 'ngo') {
    // Recipient NGOs see available broadcasts to claim and items claimed by their NGO
    const scoped = serverDonations.filter(d => 
      d.status === 'Available' ||
      (d.claimedBy && d.claimedBy.toLowerCase() === req.user.orgName.toLowerCase())
    );
    return res.json({ donations: scoped });
  }

  return res.json({
    donations: serverDonations
  });
});

/**
 * POST /api/donations
 * Donor creates a surplus food broadcast.
 * Server Security Controls:
 * 1. requireAuth: Must be logged in.
 * 2. requireRole('donor'): NGO cannot post donations.
 * 3. requireVerified: Pending or Rejected donor cannot broadcast food.
 * 4. Data Integrity: donorOrg is locked to req.user.orgName. Cannot spoof other donors.
 */
router.post('/', requireAuth, requireRole('donor'), requireVerified, (req, res) => {
  const { foodName, category, quantity, unit, storageCondition, collectionDeadline } = req.body;

  if (!foodName || !quantity) {
    return res.status(400).json({ error: "Food item name and quantity are required." });
  }

  const newDonation = {
    id: `DON-${Date.now().toString().slice(-4)}`,
    donorOrg: req.user.orgName, // LOCKED to authenticated donor's organization
    donorUserId: req.user.id,
    foodName: foodName.trim(),
    category: category || "Cooked Meals",
    quantity: Number(quantity),
    unit: unit || "meals",
    storageCondition: storageCondition || "Room Temperature",
    status: "Available",
    claimedBy: null,
    claimedByUserId: null,
    collectionDeadline: collectionDeadline || new Date(Date.now() + 4 * 3600000).toISOString(),
    createdAt: new Date().toISOString()
  };

  serverDonations.unshift(newDonation);

  return res.status(201).json({
    message: "Donation broadcast successfully created.",
    donation: newDonation
  });
});

/**
 * POST /api/donations/:id/claim
 * NGO claims an available surplus donation.
 * Server Security Controls:
 * 1. requireAuth: Must be logged in.
 * 2. requireRole('ngo'): Donors cannot claim donations.
 * 3. requireVerified: Pending or Rejected NGOs cannot claim donations.
 * 4. Double-Claim Protection: Cannot claim if already claimed or delivered.
 */
router.post('/:id/claim', requireAuth, requireRole('ngo'), requireVerified, (req, res) => {
  const donation = serverDonations.find(d => d.id === req.params.id);

  if (!donation) {
    return res.status(404).json({ error: "Donation not found." });
  }

  if (donation.status !== 'Available') {
    return res.status(409).json({
      error: `Double-claim prevented. Donation is already in "${donation.status}" state by ${donation.claimedBy || 'another party'}.`,
      code: "ALREADY_CLAIMED"
    });
  }

  donation.status = 'Claimed';
  donation.claimedBy = req.user.orgName; // LOCKED to authenticated NGO's organization
  donation.claimedByUserId = req.user.id;
  donation.claimedAt = new Date().toISOString();

  return res.json({
    message: `Successfully claimed donation #${donation.id}.`,
    donation
  });
});

/**
 * PUT /api/donations/:id/status
 * Updates delivery status.
 * Server Security Controls:
 * 1. requireAuth
 * 2. Cross-Organization Isolation:
 *    User must belong either to the donor organization or the claiming NGO.
 *    Third-party organizations cannot alter status!
 * 3. State transition validation via validateStateTransition.
 */
router.put('/:id/status', requireAuth, (req, res) => {
  const donation = serverDonations.find(d => d.id === req.params.id);

  if (!donation) {
    return res.status(404).json({ error: "Donation not found." });
  }

  // Cross-Organization Data Isolation Check:
  const isDonorOwner = donation.donorOrg.toLowerCase() === req.user.orgName.toLowerCase();
  const isClaimingNgo = donation.claimedBy && donation.claimedBy.toLowerCase() === req.user.orgName.toLowerCase();

  if (!isDonorOwner && !isClaimingNgo) {
    return res.status(403).json({
      error: "Access denied. Cross-organization isolation violation: You do not have permission to modify dispatches for another organization.",
      code: "CROSS_ORG_FORBIDDEN"
    });
  }

  const { newStatus } = req.body;
  const transitionCheck = validateStateTransition(donation.status, newStatus);

  if (!transitionCheck.isValid) {
    return res.status(400).json({
      error: transitionCheck.error,
      code: "INVALID_TRANSITION"
    });
  }

  donation.status = newStatus;
  donation.updatedAt = new Date().toISOString();

  return res.json({
    message: `Status updated to ${newStatus}.`,
    donation
  });
});

export default router;
