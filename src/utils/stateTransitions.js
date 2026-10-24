/**
 * RescuePlate Donation Lifecycle State Machine
 * Problem Statement PS-43: Community Food Donation Matcher
 * 
 * Valid Transitions:
 * Available  ──► Claimed (by verified NGO)
 * Available  ──► Cancelled (by donor)
 * Claimed    ──► Picked Up (in transit with courier)
 * Claimed    ──► Available (released / cancelled claim)
 * Picked Up  ──► Delivered (completed verification)
 * 
 * Invalid:
 * Available  ──► Delivered (Cannot bypass claim and pickup custody)
 * Available  ──► Picked Up (Cannot pickup without claiming first)
 * Delivered  ──► Claimed / Picked Up (Terminal verified state)
 */

export const DONATION_STATUSES = {
  AVAILABLE: 'Available',
  CLAIMED: 'Claimed',
  PICKED_UP: 'Picked Up',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

const ALLOWED_TRANSITIONS = {
  [DONATION_STATUSES.AVAILABLE]: [
    DONATION_STATUSES.CLAIMED,
    DONATION_STATUSES.CANCELLED
  ],
  [DONATION_STATUSES.CLAIMED]: [
    DONATION_STATUSES.PICKED_UP,
    DONATION_STATUSES.AVAILABLE // Allows releasing back to pool
  ],
  [DONATION_STATUSES.PICKED_UP]: [
    DONATION_STATUSES.DELIVERED
  ],
  [DONATION_STATUSES.DELIVERED]: [
    // For demo/testing reset only, otherwise terminal
    DONATION_STATUSES.AVAILABLE
  ],
  [DONATION_STATUSES.CANCELLED]: [
    DONATION_STATUSES.AVAILABLE
  ]
};

/**
 * Validates whether a state transition is legal.
 * 
 * @param {string} currentStatus - Current status of the donation
 * @param {string} targetStatus - Desired new status
 * @param {boolean} [isDemoReset=false] - Allows reset for hackathon evaluation testing
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateStateTransition(currentStatus, targetStatus, isDemoReset = false) {
  if (!currentStatus || !targetStatus) {
    return { isValid: false, error: "Both current and target statuses are required." };
  }

  if (currentStatus === targetStatus) {
    return { isValid: true };
  }

  if (isDemoReset && targetStatus === DONATION_STATUSES.AVAILABLE) {
    return { isValid: true };
  }

  // Prevent illegal jumps
  if (currentStatus === DONATION_STATUSES.AVAILABLE && targetStatus === DONATION_STATUSES.DELIVERED) {
    return {
      isValid: false,
      error: 'Invalid transition: A donation cannot jump directly from "Available" to "Delivered". It must first be claimed by an NGO and picked up by a courier.'
    };
  }

  if (currentStatus === DONATION_STATUSES.AVAILABLE && targetStatus === DONATION_STATUSES.PICKED_UP) {
    return {
      isValid: false,
      error: 'Invalid transition: A donation cannot be picked up before being claimed by an NGO.'
    };
  }

  if (currentStatus === DONATION_STATUSES.DELIVERED && targetStatus !== DONATION_STATUSES.AVAILABLE) {
    return {
      isValid: false,
      error: 'Invalid transition: Delivered donations are in a verified closed-loop terminal state and cannot be reverted.'
    };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return {
      isValid: false,
      error: `Invalid transition: Cannot change status from "${currentStatus}" to "${targetStatus}".`
    };
  }

  return { isValid: true };
}
