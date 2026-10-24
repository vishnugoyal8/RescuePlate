/**
 * Demo Hotel Waste Intelligence Data for RescuePlate (Tech Yuva Build-A-Thon 2026 - PS-43)
 * 
 * Note: All figures are explicitly labeled as demonstration kitchen logs.
 * Demonstrates preparation, sales, donations, discards, and unaccounted shrinkage.
 */

export const INITIAL_HOTEL_WASTE_ENTRIES = [
  {
    id: "HWE-2026-001",
    isDemo: true,
    date: "2026-10-24", // Today
    hotelOrg: "Grand Pearl Banquet & Hotel",
    itemName: "Executive Lunch Buffet (Paneer Butter & Rice)",
    category: "Cooked Meals",
    preparedQty: 120,
    soldOrServedQty: 85,
    donatedQty: 25,
    discardedQty: 6,
    unit: "meals",
    notes: "Corporate conference lunch. 25 meals dispatched to Asha Ek Kadam shelter. 4 meals unaccounted (kitchen tasting & plating loss)."
  },
  {
    id: "HWE-2026-002",
    isDemo: true,
    date: "2026-10-24",
    hotelOrg: "Grand Pearl Banquet & Hotel",
    itemName: "Artisan Croissants & Danish Pastries",
    category: "Bakery & Bread",
    preparedQty: 50,
    soldOrServedQty: 32,
    donatedQty: 15,
    discardedQty: 3,
    unit: "boxes",
    notes: "Breakfast buffet surplus. Reconciled exactly: 18 surplus = 15 donated + 3 damaged."
  },
  {
    id: "HWE-2026-003",
    isDemo: true,
    date: "2026-10-23",
    hotelOrg: "Grand Pearl Banquet & Hotel",
    itemName: "Evening Reception Veg Dum Biryani & Raita",
    category: "Cooked Meals",
    preparedQty: 150,
    soldOrServedQty: 100,
    donatedQty: 40,
    discardedQty: 8,
    unit: "meals",
    notes: "Wedding seminar reception. 50 surplus = 40 rescued + 8 spoiled + 2 plate scrapings."
  },
  {
    id: "HWE-2026-004",
    isDemo: true,
    date: "2026-10-22",
    hotelOrg: "Grand Pearl Banquet & Hotel",
    itemName: "Fresh Cut Salad & Melon Wedges Platter",
    category: "Fresh Produce",
    preparedQty: 45,
    soldOrServedQty: 25,
    donatedQty: 10,
    discardedQty: 8,
    unit: "kg",
    notes: "High perishability raw cut salad. 20 surplus = 10 donated + 8 wilted/discarded + 2 shrinkage."
  },
  {
    id: "HWE-2026-005",
    isDemo: true,
    date: "2026-10-21",
    hotelOrg: "Grand Pearl Banquet & Hotel",
    itemName: "Breakfast Steamed Idli & Sambar Batch",
    category: "Cooked Meals",
    preparedQty: 80,
    soldOrServedQty: 60,
    donatedQty: 15,
    discardedQty: 5,
    unit: "servings",
    notes: "Morning breakfast spread. 20 surplus cleanly reconciled: 15 donated, 5 discarded."
  },
  {
    id: "HWE-2026-006",
    isDemo: true,
    date: "2026-10-20",
    hotelOrg: "Grand Pearl Banquet & Hotel",
    itemName: "Multigrain Sandwich Loaves & Rolls",
    category: "Bakery & Bread",
    preparedQty: 60,
    soldOrServedQty: 40,
    donatedQty: 18,
    discardedQty: 2,
    unit: "boxes",
    notes: "Daily bake unsold. High 90% donation capture rate."
  },
  {
    id: "HWE-2026-007",
    isDemo: true,
    date: "2026-10-19",
    hotelOrg: "Grand Pearl Banquet & Hotel",
    itemName: "Dal Makhani & Butter Naan Dinners",
    category: "Cooked Meals",
    preparedQty: 110,
    soldOrServedQty: 80,
    donatedQty: 22,
    discardedQty: 5,
    unit: "meals",
    notes: "Banquet dinner surplus. 30 surplus = 22 donated + 5 discarded + 3 plating scrapings."
  }
];
