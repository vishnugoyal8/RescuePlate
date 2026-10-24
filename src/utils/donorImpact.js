/**
 * RescuePlate Donor Impact, Verification & Retention Engine
 * Problem Statement PS-43: Community Food Donation Matcher
 * 
 * CORE PRINCIPLES:
 * 1. Strict Impact Integrity: ONLY completed ("Delivered") donations contribute to verified
 *    meals rescued and food waste diverted. Incomplete donations are strictly tracked as pipeline.
 * 2. Realistic & Transparent: Disposal costs avoided use an explicitly labelled configurable demo
 *    assumption (standard municipal commercial food waste hauling fee).
 * 3. Honest Recognition: RescuePlate Community Partner badge is awarded on clear criteria (>= 3 completed deliveries),
 *    with explicit demo verification labelling and copyable plain-text sharing.
 */

// Configurable default municipal commercial food waste hauling & disposal fee assumption (₹/kg)
export const DEFAULT_DISPOSAL_COST_PER_KG = 12.0;

/**
 * Calculates verified donor metrics, strictly separating delivered items from pipeline items.
 * 
 * @param {Array} donations - List of all donation records
 * @param {Object} [options] - Configuration options
 * @param {number} [options.disposalCostPerKg=12.0] - Waste disposal cost assumption per kg
 * @param {string} [options.donorOrg] - Optional filter for specific donor organization
 * @returns {Object} Comprehensive donor impact metrics
 */
export function calculateDonorImpact(donations = [], options = {}) {
  const disposalCostPerKg = typeof options.disposalCostPerKg === 'number' 
    ? options.disposalCostPerKg 
    : DEFAULT_DISPOSAL_COST_PER_KG;

  // Filter by donor organization if provided
  const relevantDonations = options.donorOrg 
    ? donations.filter(d => (d.donorOrg || "").toLowerCase() === options.donorOrg.toLowerCase())
    : donations;

  const totalPosted = relevantDonations.length;

  // Partition donations by completion status
  const completedDonations = relevantDonations.filter(d => d.status === 'Delivered');
  const inProgressDonations = relevantDonations.filter(d => d.status === 'Claimed' || d.status === 'Picked Up');
  const availableDonations = relevantDonations.filter(d => d.status === 'Available');
  const cancelledDonations = relevantDonations.filter(d => d.status === 'Cancelled');

  // Helper to extract or estimate weight in kg
  const getWeightKg = (item) => {
    if (typeof item.estimatedWeightKg === 'number' && item.estimatedWeightKg > 0) {
      return item.estimatedWeightKg;
    }
    if (item.unit === 'kg') {
      return Number(item.quantity) || 0;
    }
    // Standard kitchen estimate: ~400g per meal/serving/box
    return (Number(item.quantity) || 0) * 0.4;
  };

  // Helper to calculate meals: direct meal/serving count or 2.5 meals per kg
  const getMeals = (item) => {
    if (item.unit === 'meals' || item.unit === 'servings') {
      return Number(item.quantity) || 0;
    }
    const weight = getWeightKg(item);
    return Math.round(weight * 2.5);
  };

  // -------------------------------------------------------------
  // VERIFIED IMPACT TOTALS (STRICTLY DELIVERED ONLY)
  // -------------------------------------------------------------
  const completedCount = completedDonations.length;
  
  const verifiedMealsRescued = completedDonations.reduce((sum, item) => sum + getMeals(item), 0);
  const verifiedWeightDivertedKg = Math.round(
    completedDonations.reduce((sum, item) => sum + getWeightKg(item), 0) * 10
  ) / 10;

  // Commercial disposal hauling cost avoided (Demo assumption)
  const estimatedDisposalCostAvoided = Math.round(verifiedWeightDivertedKg * disposalCostPerKg);

  // -------------------------------------------------------------
  // PIPELINE / IN-PROGRESS ESTIMATES (EXCLUDED FROM VERIFIED RESCUE)
  // -------------------------------------------------------------
  const pipelinePendingMeals = inProgressDonations.reduce((sum, item) => sum + getMeals(item), 0);
  const pipelinePendingKg = Math.round(
    inProgressDonations.reduce((sum, item) => sum + getWeightKg(item), 0) * 10
  ) / 10;

  // Partner NGOs supported by completed dispatches
  const partnerNgosSupported = Array.from(
    new Set(completedDonations.map(d => d.claimedBy).filter(Boolean))
  );

  // -------------------------------------------------------------
  // COMMUNITY PARTNER RECOGNITION (TRANSPARENT QUALIFICATION)
  // Rule: At least 3 verified completed ("Delivered") donations.
  // -------------------------------------------------------------
  const QUALIFICATION_THRESHOLD = 3;
  const isPartnerQualified = completedCount >= QUALIFICATION_THRESHOLD;
  const progressToBadge = Math.min(100, Math.round((completedCount / QUALIFICATION_THRESHOLD) * 100));

  let tierName = "Community Contributor";
  if (completedCount >= 5) {
    tierName = "RescuePlate Sustained Champion";
  } else if (completedCount >= 3) {
    tierName = "RescuePlate Verified Community Partner";
  } else if (completedCount >= 1) {
    tierName = "Active Rescue Contributor";
  }

  return {
    totalPosted,
    completedCount,
    inProgressCount: inProgressDonations.length,
    availableCount: availableDonations.length,
    cancelledCount: cancelledDonations.length,
    
    // Strict Verified Metrics
    verifiedMealsRescued,
    verifiedWeightDivertedKg,
    estimatedDisposalCostAvoided,
    disposalCostPerKg,

    // Pipeline (Explicitly Separated)
    pipelinePendingMeals,
    pipelinePendingKg,

    // Recognition & Progress
    partnerBadge: {
      isQualified: isPartnerQualified,
      tierName,
      completedCount,
      targetCount: QUALIFICATION_THRESHOLD,
      progressPercentage: progressToBadge,
      remainingForBadge: Math.max(0, QUALIFICATION_THRESHOLD - completedCount),
      ruleText: "Qualification Standard: Minimum 3 verified completed deliveries to verified local charities (Demo Verification Status)."
    },

    partnerNgosSupported
  };
}

/**
 * Determines the honest, contextual next recommended action for a donor restaurant.
 * 
 * @param {Array} donations - All donation records
 * @returns {Object} { actionTitle, actionDescription, buttonText, actionType, relatedDonationId }
 */
export function getDonorRecommendedNextAction(donations = []) {
  // Check for donations awaiting pickup by courier
  const claimedItem = donations.find(d => d.status === 'Claimed');
  if (claimedItem) {
    return {
      actionType: 'pickup_pending',
      actionTitle: `Prepare Courier Handoff for #${claimedItem.id}`,
      actionDescription: `${claimedItem.claimedBy || "A verified NGO courier"} has claimed "${claimedItem.foodName}". Please prepare insulated containers and confirm handoff when courier arrives.`,
      buttonText: 'View Traceability Timeline',
      targetTab: 'traceability',
      relatedDonationId: claimedItem.id,
      urgency: 'high'
    };
  }

  // Check for donations in transit
  const inTransitItem = donations.find(d => d.status === 'Picked Up');
  if (inTransitItem) {
    return {
      actionType: 'in_transit',
      actionTitle: `In Transit: #${inTransitItem.id}`,
      actionDescription: `"${inTransitItem.foodName}" is currently en route with ${inTransitItem.claimedBy || "the courier"}. Awaiting final delivery confirmation at the shelter.`,
      buttonText: 'Track Custody Timeline',
      targetTab: 'traceability',
      relatedDonationId: inTransitItem.id,
      urgency: 'medium'
    };
  }

  // Check for open available donations
  const availableItem = donations.find(d => d.status === 'Available');
  if (availableItem) {
    return {
      actionType: 'available_broadcast',
      actionTitle: `Active Broadcast: #${availableItem.id}`,
      actionDescription: `"${availableItem.foodName}" is visible to local shelters on the community radar. Review eligible NGO match rankings.`,
      buttonText: 'Inspect Matched NGOs',
      targetTab: 'donor',
      relatedDonationId: availableItem.id,
      urgency: 'normal'
    };
  }

  // If no active dispatches, recommend posting
  return {
    actionType: 'post_surplus',
    actionTitle: 'Ready to Rescue Today’s Surplus?',
    actionDescription: 'Log catering, banquet, or bakery surplus in under 60 seconds to match with nearby shelters before closing time.',
    buttonText: 'Post Food Donation',
    targetTab: 'modal',
    relatedDonationId: null,
    urgency: 'normal'
  };
}

/**
 * Generates an honest, copyable plain-text impact summary for manual sharing.
 * 
 * @param {string} donorOrgName - Name of the restaurant/business
 * @param {Object} metrics - Calculated donor metrics
 * @returns {string} Plain text formatted summary
 */
export function generateShareableImpactSummary(donorOrgName = "Our Commercial Kitchen", metrics) {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const partnerList = (metrics.partnerNgosSupported && metrics.partnerNgosSupported.length > 0)
    ? metrics.partnerNgosSupported.join(', ')
    : "Local community shelters & night homes";

  return `🌿 RescuePlate Community Impact Update
Donor Partner: ${donorOrgName}
Date: ${dateStr}
Recognition: ${metrics.partnerBadge?.tierName || "Community Contributor"} (Demo Verification)

------------------------------------------------
🍲 Verified Meals Rescued: ${metrics.verifiedMealsRescued} meals
📦 Surplus Food Diverted: ${metrics.verifiedWeightDivertedKg} kg kept from municipal landfill
💰 Avoided Disposal Costs: ₹${metrics.estimatedDisposalCostAvoided} (est. commercial hauling @ ₹${metrics.disposalCostPerKg}/kg)
🤝 Verified Community Beneficiaries: ${partnerList}
------------------------------------------------

"Good food. Better futures."
Tracked transparently via RescuePlate Community Food Matcher (Tech Yuva Build-A-Thon 2026 - PS-43)
Note: Values are calculated estimates based on 400g adult serving standards. Demo verification status.`;
}
