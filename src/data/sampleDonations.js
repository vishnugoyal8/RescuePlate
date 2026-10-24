/**
 * Sample food donation data for RescuePlate (Tech Yuva Build-A-Thon 2026 - PS-43)
 * All entries are explicitly tagged with isSample: true to fulfill the hackathon requirement
 * of clear sample-data labeling.
 * Coordinates are verified demo coordinates (Delhi NCR) to evaluate matching accurately.
 */

export const INITIAL_DONATIONS = [
  {
    id: "DON-2026-001",
    isSample: true,
    foodName: "Fresh Veg Pulao & Dal Tadka (Catering Surplus)",
    category: "Cooked Meals",
    quantity: 45,
    unit: "meals",
    estimatedWeightKg: 18,
    storageCondition: "Hot & Insulated",
    pickupAddress: "Grand Pearl Banquet, Sector 18, Noida",
    coordinates: {
      lat: 28.5708,
      lng: 77.3271,
      label: "Verified Demo (Sector 18, Noida)"
    },
    collectionDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    contactName: "Rajesh Sharma (Catering Lead)",
    contactPhone: "+91 98101 23456",
    notes: "Prepared fresh at 1:00 PM for a corporate seminar. Packed in food-grade thermocol foil boxes.",
    status: "Available",
    urgency: "High",
    claimedBy: null,
    claimedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    donorOrg: "Royal Spoon Banquets"
  },
  {
    id: "DON-2026-002",
    isSample: true,
    foodName: "Assorted Sourdough, Multigrain Loaves & Buns",
    category: "Bakery & Bread",
    quantity: 35,
    unit: "boxes",
    estimatedWeightKg: 20,
    storageCondition: "Room Temp",
    pickupAddress: "Crust & Crumb Artisan Bakery, Connaught Place, Block C, New Delhi",
    coordinates: {
      lat: 28.6315,
      lng: 77.2167,
      label: "Verified Demo (Connaught Place, Central Delhi)"
    },
    collectionDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    contactName: "Ananya Deshmukh (Head Baker)",
    contactPhone: "+91 98712 34567",
    notes: "Fresh daily bake unsold at day-end. Cleanly wrapped in paper bags.",
    status: "Available",
    urgency: "Moderate",
    claimedBy: null,
    claimedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    donorOrg: "Crust & Crumb Bakery"
  },
  {
    id: "DON-2026-006",
    isSample: true,
    foodName: "Nutritious Multigrain Buns & Fruit Muffins (15 Boxes)",
    category: "Bakery & Bread",
    quantity: 15,
    unit: "boxes",
    estimatedWeightKg: 8,
    storageCondition: "Room Temp",
    pickupAddress: "The Oven Treat Bakery, Central Market, Lajpat Nagar II, New Delhi",
    coordinates: {
      lat: 28.5690,
      lng: 77.2420,
      label: "Verified Demo (Lajpat Nagar, South Delhi)"
    },
    collectionDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    contactName: "Sunil Batra",
    contactPhone: "+91 98188 44332",
    notes: "Baked this morning. Packaged in sanitized cardboard packs. Fits small capacity shelters.",
    status: "Available",
    urgency: "Moderate",
    claimedBy: null,
    claimedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    donorOrg: "The Oven Treat"
  },
  {
    id: "DON-2026-007",
    isSample: true,
    foodName: "Highway Resort Dinner Buffet Surplus (Distant Hub)",
    category: "Cooked Meals",
    quantity: 90,
    unit: "meals",
    estimatedWeightKg: 36,
    storageCondition: "Hot & Insulated",
    pickupAddress: "Golden Gate Resort, NH-48 Manesar Hub, Gurugram",
    coordinates: {
      lat: 28.3540,
      lng: 76.9380,
      label: "Verified Demo (Manesar, 38km Outskirts)"
    },
    collectionDeadline: new Date(Date.now() + 1.2 * 60 * 60 * 1000).toISOString(), // 1.2 hours from now
    contactName: "Gaurav Malhotra (Banquet Dir)",
    contactPhone: "+91 98100 77665",
    notes: "Large corporate event surplus. Requires heavy vehicle transport.",
    status: "Available",
    urgency: "High",
    claimedBy: null,
    claimedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    donorOrg: "Golden Gate Resort"
  },
  {
    id: "DON-2026-003",
    isSample: true,
    foodName: "Organic Apples, Bananas & Seasonal Melons",
    category: "Fresh Produce",
    quantity: 60,
    unit: "kg",
    estimatedWeightKg: 60,
    storageCondition: "Cold Storage",
    pickupAddress: "Kisan Fresh Mandi Outlet #14, Okhla Phase 2, New Delhi",
    coordinates: {
      lat: 28.5355,
      lng: 77.2728,
      label: "Verified Demo (Okhla Phase 2, South Delhi)"
    },
    collectionDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    contactName: "Harpreet Singh (Store Manager)",
    contactPhone: "+91 99580 98765",
    notes: "Ripe cosmetic blemishes, 100% safe, edible, and high nutrition quality.",
    status: "Claimed",
    urgency: "Normal",
    claimedBy: "Asha Ek Kadam NGO (Shelter Home)",
    claimedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    pickedUpAt: null,
    deliveredAt: null,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    donorOrg: "Kisan Fresh Mart"
  },
  {
    id: "DON-2026-004",
    isSample: true,
    foodName: "Steamed Rice, Paneer Butter Masala & Roti",
    category: "Cooked Meals",
    quantity: 80,
    unit: "servings",
    estimatedWeightKg: 32,
    storageCondition: "Hot & Insulated",
    pickupAddress: "Corporate Cafeteria, Saket District Centre, New Delhi",
    coordinates: {
      lat: 28.5244,
      lng: 77.2066,
      label: "Verified Demo (Saket District Centre, South Delhi)"
    },
    collectionDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    contactName: "Karthik Subramanian",
    contactPhone: "+91 94480 11223",
    notes: "Lunch batch surplus. Transported via climate insulated carrier boxes.",
    status: "Picked Up",
    urgency: "Moderate",
    claimedBy: "Robin Hood Army - Central Delhi Chapter",
    claimedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    deliveredAt: null,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    donorOrg: "Café Flavors Corp"
  },
  {
    id: "DON-2026-005",
    isSample: true,
    foodName: "Fortified Whole Milk Pouches & Paneer Blocks",
    category: "Dairy & Cold Items",
    quantity: 25,
    unit: "kg",
    estimatedWeightKg: 25,
    storageCondition: "Refrigerated (4°C)",
    pickupAddress: "Mother Dairy Distribution Depot, Indirapuram, Ghaziabad",
    coordinates: {
      lat: 28.6415,
      lng: 77.3714,
      label: "Verified Demo (Indirapuram, Ghaziabad)"
    },
    collectionDeadline: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    contactName: "Vipin Mehra",
    contactPhone: "+91 98110 55667",
    notes: "Batch nearing 48-hr best-before marker. Unopened cold chain integrity maintained.",
    status: "Delivered",
    urgency: "Normal",
    claimedBy: "Pratham Children Nutrition Foundation",
    claimedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    donorOrg: "Metro Dairy Distributors"
  }
];

export const FOOD_CATEGORIES = [
  "Cooked Meals",
  "Fresh Produce",
  "Bakery & Bread",
  "Dairy & Cold Items",
  "Packaged Goods",
  "Groceries & Staples"
];

export const QUANTITY_UNITS = [
  "meals",
  "servings",
  "kg",
  "boxes",
  "packets"
];

export const STORAGE_CONDITIONS = [
  "Hot & Insulated",
  "Room Temp",
  "Refrigerated (4°C)",
  "Cold Storage",
  "Dry Storage"
];
