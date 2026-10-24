import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { db } from '../db/store.js';

const router = express.Router();

/**
 * GET /api/trust/profiles
 * Public-Safe Community Trust Profile Directory.
 * Accessible to any authenticated or public user.
 * 
 * Strict Privacy Protections (PS-43 Compliance):
 * - Returns ONLY approved public information: name, type, category, locality, verified badge, and aggregate impact.
 * - EXCLUDES: phone numbers, contact person names, internal compliance evaluations, rejection reasons,
 *   and simulated government registration IDs.
 */
router.get('/trust/profiles', (req, res) => {
  const profiles = db.getPublicTrustProfiles();
  return res.json({
    status: "ok",
    totalVerifiedPartners: profiles.length,
    trustProfiles: profiles
  });
});

/**
 * GET /api/kyc/my-status
 * Returns ONLY the authenticated user's own organization verification status.
 * Cross-account data isolation: A user cannot inspect another organization's verification data.
 */
router.get('/kyc/my-status', requireAuth, (req, res) => {
  if (!req.user.orgName) {
    return res.status(400).json({ error: "No organization associated with this account." });
  }

  const myRecord = db.getMyKycRecord(req.user.orgName);
  
  return res.json({
    status: "ok",
    organization: req.user.orgName,
    verificationRecord: myRecord
  });
});

/**
 * GET /api/kyc/admin/records
 * Administrative verification queue.
 * Server-Side Security: Strictly restricted to authorized compliance verifier / administrator accounts.
 * Donors and NGOs receive 403 Forbidden.
 */
router.get('/kyc/admin/records', requireAuth, requireAdmin, (req, res) => {
  const records = db.getAdminKycRecords();
  return res.json({
    status: "ok",
    verifier: req.user.email,
    count: records.length,
    records
  });
});

/**
 * PUT /api/kyc/admin/records/:id/status
 * Administrative action to review and update organization verification status.
 * Server-Side Security: Strictly restricted to authorized verifiers/admins.
 */
router.put('/kyc/admin/records/:id/status', requireAuth, requireAdmin, (req, res) => {
  const statusToSet = req.body.newStatus || req.body.status;
  const { verifierNotes } = req.body;
  const validStatuses = ['Verified', 'Pending Review', 'Rejected'];

  if (!statusToSet || !validStatuses.includes(statusToSet)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      code: "INVALID_STATUS"
    });
  }

  const updated = db.updateKycStatus(
    req.params.id, 
    statusToSet, 
    verifierNotes, 
    req.user.email
  );

  if (!updated) {
    return res.status(404).json({ error: "Verification record not found." });
  }

  return res.json({
    message: `Organization "${updated.name}" verification status updated to "${statusToSet}".`,
    record: updated
  });
});

export default router;
