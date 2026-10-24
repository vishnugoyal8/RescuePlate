/**
 * RescuePlate Explainable Smart Food Donation Matching Engine
 * Problem Statement PS-43: Community Food Donation Matcher (Tech Yuva 2026)
 * 
 * CORE PRINCIPLES:
 * 1. Fully Explainable: Every score breakdown and exclusion rule produces clear human-readable explanations.
 * 2. Deterministic & Transparent: Uses verified demo coordinates only. Never fabricates live GPS or real-time traffic.
 * 3. Strict Safety & Logistics: Automatically eliminates expired food, unreachable deadlines, capacity overflows,
 *    and storage equipment mismatches.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great-circle distance between two coordinate pairs using Haversine formula.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers (rounded to 1 decimal place)
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return null;
  }

  const toRad = (angle) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = EARTH_RADIUS_KM * c;
  return Math.round(d * 10) / 10;
}

/**
 * Evaluates compatibility and scores a single donation against an NGO profile.
 * 
 * @param {Object} donation - The food donation record
 * @param {Object} ngo - The NGO profile
 * @param {Date} [currentTime=new Date()] - Reference timestamp for testing
 * @returns {Object} Complete evaluation with eligibility flag, score, and explanations
 */
export function evaluateDonationMatch(donation, ngo, currentTime = new Date()) {
  // Safety checks on input data
  if (!donation || !ngo) {
    return {
      isEligible: false,
      score: 0,
      reasons: [],
      exclusionReasons: ["Missing profile or donation parameters."],
      details: null
    };
  }

  const exclusionReasons = [];
  const positiveReasons = [];

  // 1. HARD FILTER: Availability Status
  if (donation.status !== 'Available') {
    exclusionReasons.push(`Donation is currently "${donation.status}" and no longer open for claiming.`);
  }

  // 2. HARD FILTER: Expiration Window
  const deadlineDate = new Date(donation.collectionDeadline);
  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);
  const timeRemainingMinutes = Math.round((deadlineDate - now) / (1000 * 60));

  if (timeRemainingMinutes <= 0) {
    const expiredMinutesAgo = Math.abs(timeRemainingMinutes);
    exclusionReasons.push(
      `Collection deadline expired ${expiredMinutesAgo > 60 ? `${Math.round(expiredMinutesAgo / 60)}h` : `${expiredMinutesAgo}m`} ago (spoilage cutoff passed).`
    );
  }

  // 3. HARD FILTER: Distance & Reachability
  const donorCoords = donation.coordinates || { lat: 28.5708, lng: 77.3271 }; // Fallback to verified demo NCR coords
  const ngoCoords = ngo.coordinates || { lat: 28.5670, lng: 77.2430 };

  const distanceKm = calculateHaversineDistanceKm(
    donorCoords.lat,
    donorCoords.lng,
    ngoCoords.lat,
    ngoCoords.lng
  );

  const speedKmh = ngo.transitSpeedKmh || 25; // Standard urban transit speed
  const dispatchPrepMinutes = ngo.avgCourierDispatchTimeMin || 15;
  const transitMinutes = distanceKm !== null ? Math.round((distanceKm / speedKmh) * 60) : 30;
  const totalRequiredWindowMinutes = transitMinutes + dispatchPrepMinutes;

  if (distanceKm !== null && ngo.maxRadiusKm && distanceKm > ngo.maxRadiusKm) {
    exclusionReasons.push(
      `Distance (${distanceKm} km) exceeds NGO operational service radius (${ngo.maxRadiusKm} km).`
    );
  }

  if (timeRemainingMinutes > 0 && timeRemainingMinutes < totalRequiredWindowMinutes) {
    exclusionReasons.push(
      `Courier cannot arrive before deadline: requires ~${totalRequiredWindowMinutes} min (~${transitMinutes}m transit + ${dispatchPrepMinutes}m prep), but only ${timeRemainingMinutes} min remain.`
    );
  }

  // 4. HARD FILTER: NGO Capacity
  const isWeightBased = donation.unit === 'kg';
  const requiredAmount = Number(donation.quantity) || 1;
  const availableCapacity = isWeightBased 
    ? (ngo.currentAvailableCapacityKg ?? ngo.currentAvailableCapacityMeals ?? 50)
    : (ngo.currentAvailableCapacityMeals ?? 50);

  if (requiredAmount > availableCapacity) {
    exclusionReasons.push(
      `Batch size (${requiredAmount} ${donation.unit}) exceeds NGO available intake capacity (${availableCapacity} ${donation.unit}).`
    );
  }

  // 5. HARD FILTER: Category Acceptance
  const acceptedCategories = ngo.acceptedCategories || [];
  if (acceptedCategories.length > 0 && !acceptedCategories.includes(donation.category)) {
    exclusionReasons.push(
      `Category mismatch: NGO accepts [${acceptedCategories.join(', ')}], but this donation is "${donation.category}".`
    );
  }

  // 6. HARD FILTER: Storage Equipment Match
  const storageRequirement = donation.storageCondition || 'Room Temp';
  const ngoEquipment = ngo.storageEquipment || ['Room Temp'];
  const requiresCold = storageRequirement.includes('Cold') || storageRequirement.includes('Refrigerated');
  const hasCold = ngoEquipment.some(eq => eq.includes('Cold') || eq.includes('Refrigerated'));

  if (requiresCold && !hasCold) {
    exclusionReasons.push(
      `Storage mismatch: Donation requires "${storageRequirement}", but NGO lacks cold chain / refrigeration equipment.`
    );
  }

  // If any hard filter failed, the donation is INELIGIBLE for this NGO
  const isEligible = exclusionReasons.length === 0;

  if (!isEligible) {
    return {
      donation,
      ngo,
      isEligible: false,
      score: 0,
      reasons: [],
      exclusionReasons,
      details: {
        distanceKm,
        transitMinutes,
        dispatchPrepMinutes,
        totalRequiredWindowMinutes,
        timeRemainingMinutes,
        requiredAmount,
        availableCapacity,
        unit: donation.unit,
        storageRequirement
      }
    };
  }

  // -------------------------------------------------------------
  // EXPLAINABLE SCORING FORMULA (0 - 100 Points for Eligible Items)
  // -------------------------------------------------------------
  let proximityScore = 0;
  let urgencyScore = 0;
  let capacityScore = 0;
  let conditionScore = 0;

  // Factor A: Proximity (Max 35 points)
  const maxRadius = ngo.maxRadiusKm || 20;
  if (distanceKm <= 2.0) {
    proximityScore = 35;
    positiveReasons.push(`Immediate neighborhood (~${distanceKm} km away)`);
  } else {
    proximityScore = Math.max(5, Math.round(35 * (1 - (distanceKm / maxRadius))));
    positiveReasons.push(`Within collection range (~${distanceKm} km, ~${transitMinutes} min transit)`);
  }

  // Factor B: Urgency Alignment (Max 25 points)
  if (donation.urgency === 'High' || timeRemainingMinutes <= 180) {
    urgencyScore = 25;
    positiveReasons.push(`High spoilage urgency (<3h window) &bull; Priority distribution`);
  } else if (donation.urgency === 'Moderate' || timeRemainingMinutes <= 360) {
    urgencyScore = 18;
    positiveReasons.push(`Moderate collection window (~${Math.round(timeRemainingMinutes / 60)}h remaining)`);
  } else {
    urgencyScore = 10;
    positiveReasons.push(`Standard collection window (~${Math.round(timeRemainingMinutes / 60)}h remaining)`);
  }

  // Factor C: Capacity Fit (Max 20 points)
  const capacityUtilization = requiredAmount / availableCapacity;
  if (capacityUtilization >= 0.5 && capacityUtilization <= 1.0) {
    capacityScore = 20;
    positiveReasons.push(`Optimal capacity utilization (${Math.round(capacityUtilization * 100)}% of open capacity)`);
  } else if (capacityUtilization >= 0.2) {
    capacityScore = 15;
    positiveReasons.push(`Fits capacity smoothly (${requiredAmount} of ${availableCapacity} ${donation.unit})`);
  } else {
    capacityScore = 10;
    positiveReasons.push(`Small batch relative to intake capacity (${requiredAmount} ${donation.unit})`);
  }

  // Factor D: Category & Storage Alignment (Max 20 points)
  let conditionPoints = 10; // Category is accepted
  positiveReasons.push(`Directly accepted category (${donation.category})`);

  if (ngoEquipment.includes(storageRequirement)) {
    conditionPoints += 10;
    positiveReasons.push(`Direct storage equipment match (${storageRequirement})`);
  } else {
    conditionPoints += 5;
    positiveReasons.push(`Compatible ambient handling`);
  }
  conditionScore = conditionPoints;

  const totalScore = Math.min(100, proximityScore + urgencyScore + capacityScore + conditionScore);

  return {
    donation,
    ngo,
    isEligible: true,
    score: totalScore,
    reasons: positiveReasons,
    exclusionReasons: [],
    details: {
      distanceKm,
      transitMinutes,
      dispatchPrepMinutes,
      totalRequiredWindowMinutes,
      timeRemainingMinutes,
      requiredAmount,
      availableCapacity,
      unit: donation.unit,
      storageRequirement,
      breakdown: {
        proximity: proximityScore,
        urgency: urgencyScore,
        capacity: capacityScore,
        condition: conditionScore
      }
    }
  };
}

/**
 * Evaluates and sorts all donations for a given NGO profile.
 * Returns both ranked eligible donations (highest score first) and excluded donations with explanations.
 * 
 * @param {Array} donations - All donation records
 * @param {Object} ngo - Active NGO profile
 * @returns {Object} { rankedEligible: Array, excluded: Array, totalEvaluated: number }
 */
export function rankDonationsForNgo(donations, ngo) {
  if (!Array.isArray(donations) || !ngo) {
    return { rankedEligible: [], excluded: [], totalEvaluated: 0 };
  }

  const results = donations.map((donation) => evaluateDonationMatch(donation, ngo));

  const rankedEligible = results
    .filter((r) => r.isEligible)
    .sort((a, b) => b.score - a.score);

  const excluded = results
    .filter((r) => !r.isEligible);

  return {
    rankedEligible,
    excluded,
    totalEvaluated: donations.length
  };
}

/**
 * Evaluates and ranks all NGOs for a specific donation.
 * Useful for the Donor Hub to show which NGOs are eligible to receive the donation.
 * 
 * @param {Object} donation - The donation record
 * @param {Array} ngos - List of NGO profiles
 * @returns {Array} List of eligible NGO matches sorted by match score
 */
export function rankNgosForDonation(donation, ngos) {
  if (!donation || !Array.isArray(ngos)) return [];

  return ngos
    .map((ngo) => evaluateDonationMatch(donation, ngo))
    .filter((r) => r.isEligible)
    .sort((a, b) => b.score - a.score);
}
