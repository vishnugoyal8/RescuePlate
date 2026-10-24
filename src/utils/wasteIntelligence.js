/**
 * RescuePlate Hotel & Restaurant Food Waste Intelligence Engine (PS-43)
 * 
 * CORE FORMULAS:
 * 1. Estimated Surplus = Prepared - Sold/Served
 * 2. Recorded Disposition = Donated + Discarded
 * 3. Unaccounted Quantity = Estimated Surplus - Recorded Disposition
 *    (Represents plate scrapings, kitchen shrinkage, unrecorded spoilage, or measurement variance)
 * 4. Donation Capture Rate = (Donated / Recorded Disposition) * 100
 * 
 * All metrics are transparently labeled as kitchen operational estimates.
 */

/**
 * Validates a single waste intelligence log entry.
 */
export function validateWasteEntry(entry) {
  const errors = {};

  if (!entry.date) {
    errors.date = "Entry date is required.";
  }

  if (!entry.itemName || !entry.itemName.trim()) {
    errors.itemName = "Food item or buffet spread name is required.";
  }

  const prep = Number(entry.preparedQty);
  if (isNaN(prep) || prep < 0) {
    errors.preparedQty = "Prepared quantity must be a non-negative number.";
  }

  const sold = Number(entry.soldOrServedQty);
  if (isNaN(sold) || sold < 0) {
    errors.soldOrServedQty = "Sold/served quantity must be a non-negative number.";
  } else if (prep >= 0 && sold > prep) {
    errors.soldOrServedQty = `Sold/served (${sold}) cannot exceed prepared quantity (${prep}).`;
  }

  const donated = Number(entry.donatedQty);
  if (isNaN(donated) || donated < 0) {
    errors.donatedQty = "Donated quantity must be a non-negative number.";
  }

  const discarded = Number(entry.discardedQty);
  if (isNaN(discarded) || discarded < 0) {
    errors.discardedQty = "Discarded quantity must be a non-negative number.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Computes reconciliation calculations for a single food waste log entry.
 */
export function computeEntryReconciliation(entry) {
  const prepared = Number(entry.preparedQty) || 0;
  const sold = Number(entry.soldOrServedQty) || 0;
  const donated = Number(entry.donatedQty) || 0;
  const discarded = Number(entry.discardedQty) || 0;

  const estimatedSurplus = Math.max(0, Math.round((prepared - sold) * 10) / 10);
  const recordedDisposition = Math.round((donated + discarded) * 10) / 10;
  const unaccountedQty = Math.round((estimatedSurplus - recordedDisposition) * 10) / 10;

  const donationRate = recordedDisposition > 0 
    ? Math.round((donated / recordedDisposition) * 100) 
    : 0;

  const discardRate = prepared > 0 
    ? Math.round((discarded / prepared) * 100) 
    : 0;

  return {
    prepared,
    sold,
    donated,
    discarded,
    estimatedSurplus,
    recordedDisposition,
    unaccountedQty,
    donationRate,
    donationRatePct: donationRate,
    discardRate,
    isReconciled: Math.abs(unaccountedQty) < 0.01,
    hasDispositionSurplusMismatch: unaccountedQty < 0
  };
}

/**
 * Aggregates summary statistics across multiple waste log entries.
 */
export function summarizeWasteEntries(entries = []) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      totalEntries: 0,
      totalPrepared: 0,
      totalSold: 0,
      totalDonated: 0,
      totalDiscarded: 0,
      totalEstimatedSurplus: 0,
      totalRecordedDisposition: 0,
      totalUnaccounted: 0,
      avgDonationRate: 0,
      overallDiscardRate: 0,
      frequentlyWasted: [],
      categoryBreakdown: {}
    };
  }

  let totalPrepared = 0;
  let totalSold = 0;
  let totalDonated = 0;
  let totalDiscarded = 0;

  const itemAggregates = {};
  const categoryAggregates = {};

  entries.forEach((item) => {
    const recon = computeEntryReconciliation(item);
    totalPrepared += recon.prepared;
    totalSold += recon.sold;
    totalDonated += recon.donated;
    totalDiscarded += recon.discarded;

    // Track by item name for frequently wasted ranking
    const nameKey = item.itemName.trim();
    if (!itemAggregates[nameKey]) {
      itemAggregates[nameKey] = {
        name: nameKey,
        category: item.category || "General",
        unit: item.unit || "meals",
        totalDiscarded: 0,
        totalDonated: 0,
        totalPrepared: 0,
        entryCount: 0
      };
    }
    itemAggregates[nameKey].totalDiscarded += recon.discarded;
    itemAggregates[nameKey].totalDonated += recon.donated;
    itemAggregates[nameKey].totalPrepared += recon.prepared;
    itemAggregates[nameKey].entryCount += 1;

    // Track by category
    const catKey = item.category || "Uncategorized";
    if (!categoryAggregates[catKey]) {
      categoryAggregates[catKey] = {
        category: catKey,
        prepared: 0,
        donated: 0,
        discarded: 0,
        entries: 0
      };
    }
    categoryAggregates[catKey].prepared += recon.prepared;
    categoryAggregates[catKey].donated += recon.donated;
    categoryAggregates[catKey].discarded += recon.discarded;
    categoryAggregates[catKey].entries += 1;
  });

  const totalEstimatedSurplus = Math.max(0, Math.round((totalPrepared - totalSold) * 10) / 10);
  const totalRecordedDisposition = Math.round((totalDonated + totalDiscarded) * 10) / 10;
  const totalUnaccounted = Math.round((totalEstimatedSurplus - totalRecordedDisposition) * 10) / 10;

  const avgDonationRate = totalRecordedDisposition > 0
    ? Math.round((totalDonated / totalRecordedDisposition) * 100)
    : 0;

  const overallDiscardRate = totalPrepared > 0
    ? Math.round((totalDiscarded / totalPrepared) * 100)
    : 0;

  // Frequently wasted items sorted descending by total discarded quantity
  const frequentlyWasted = Object.values(itemAggregates)
    .sort((a, b) => b.totalDiscarded - a.totalDiscarded)
    .slice(0, 5);

  return {
    totalEntries: entries.length,
    totalPrepared: Math.round(totalPrepared * 10) / 10,
    totalSold: Math.round(totalSold * 10) / 10,
    totalDonated: Math.round(totalDonated * 10) / 10,
    totalDiscarded: Math.round(totalDiscarded * 10) / 10,
    totalEstimatedSurplus,
    totalRecordedDisposition,
    totalUnaccounted,
    avgDonationRate,
    overallDiscardRate,
    frequentlyWasted,
    categoryBreakdown: categoryAggregates
  };
}
