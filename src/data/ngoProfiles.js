/**
 * Demo NGO Profiles for RescuePlate (Tech Yuva Build-A-Thon 2026 - PS-43)
 * 
 * Note: Coordinates and transit figures are explicitly marked as verified demo coordinates
 * to ensure no simulated GPS or fake real-time tracking is implied.
 */

export const DEMO_NGO_PROFILES = [
  {
    id: "NGO-001",
    name: "Asha Ek Kadam Shelter Home",
    type: "Community Shelter & Night Home",
    isDemo: true,
    address: "Lajpat Nagar IV, South Delhi",
    coordinates: {
      lat: 28.5670,
      lng: 77.2430,
      label: "Verified Demo Coordinate (South Delhi)"
    },
    maxCapacityMeals: 100,
    currentAvailableCapacityMeals: 75,
    maxCapacityKg: 40,
    currentAvailableCapacityKg: 30,
    acceptedCategories: [
      "Cooked Meals",
      "Bakery & Bread",
      "Fresh Produce",
      "Dairy & Cold Items"
    ],
    storageEquipment: [
      "Refrigerated (4°C)",
      "Room Temp",
      "Hot & Insulated"
    ],
    maxRadiusKm: 18,
    transitSpeedKmh: 25, // Standard urban delivery speed
    avgCourierDispatchTimeMin: 15,
    description: "Operates 2 local shelters with walk-in refrigeration units. Ideal for urgent hot meals and dairy."
  },
  {
    id: "NGO-002",
    name: "Pratham Children Nutrition Foundation",
    type: "Child Welfare & Daily Feeding",
    isDemo: true,
    address: "Nyay Khand 1, Indirapuram, Ghaziabad",
    coordinates: {
      lat: 28.6380,
      lng: 77.3650,
      label: "Verified Demo Coordinate (Indirapuram, East NCR)"
    },
    maxCapacityMeals: 35,
    currentAvailableCapacityMeals: 20, // Limited intake capacity! Excellent for capacity test
    maxCapacityKg: 15,
    currentAvailableCapacityKg: 8,
    acceptedCategories: [
      "Dairy & Cold Items",
      "Bakery & Bread",
      "Cooked Meals"
    ],
    storageEquipment: [
      "Refrigerated (4°C)",
      "Room Temp"
    ],
    maxRadiusKm: 12,
    transitSpeedKmh: 25,
    avgCourierDispatchTimeMin: 10,
    description: "Compact community childcare center. Cannot accommodate large bulk batches (>20 meals)."
  },
  {
    id: "NGO-003",
    name: "Robin Hood Army - Central Delhi Chapter",
    type: "Volunteer Distribution Network",
    isDemo: true,
    address: "Barakhamba Road, Connaught Place, New Delhi",
    coordinates: {
      lat: 28.6300,
      lng: 77.2250,
      label: "Verified Demo Coordinate (Central Delhi)"
    },
    maxCapacityMeals: 250,
    currentAvailableCapacityMeals: 200, // High capacity volunteer team
    maxCapacityKg: 100,
    currentAvailableCapacityKg: 80,
    acceptedCategories: [
      "Cooked Meals",
      "Bakery & Bread",
      "Packaged Goods",
      "Groceries & Staples"
    ],
    // IMPORTANT: Lacks Cold Storage / Refrigeration
    storageEquipment: [
      "Room Temp",
      "Hot & Insulated",
      "Dry Storage"
    ],
    maxRadiusKm: 25,
    transitSpeedKmh: 25,
    avgCourierDispatchTimeMin: 20,
    description: "Large student and volunteer corps. Distributes immediately; does NOT possess cold storage facilities."
  },
  {
    id: "NGO-004",
    name: "Annapurna Dry Staples & Grain Bank",
    type: "Food Bank & Dry Rations Pantry",
    isDemo: true,
    address: "Sector 14, Rohini, North-West Delhi",
    coordinates: {
      lat: 28.7180,
      lng: 77.1320,
      label: "Verified Demo Coordinate (North-West Delhi)"
    },
    maxCapacityMeals: 300,
    currentAvailableCapacityMeals: 300,
    maxCapacityKg: 150,
    currentAvailableCapacityKg: 150,
    // IMPORTANT: Strictly does NOT accept Cooked Meals (dry foods only)
    acceptedCategories: [
      "Bakery & Bread",
      "Packaged Goods",
      "Groceries & Staples",
      "Fresh Produce"
    ],
    storageEquipment: [
      "Room Temp",
      "Dry Storage"
    ],
    maxRadiusKm: 15,
    transitSpeedKmh: 25,
    avgCourierDispatchTimeMin: 25,
    description: "Food bank pantry for long shelf-life items. Strictly rejects cooked catering food."
  }
];

export const DEMO_LOCALITIES = [
  { name: "Sector 18, Noida", lat: 28.5708, lng: 77.3271 },
  { name: "Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167 },
  { name: "Okhla Phase 2, New Delhi", lat: 28.5355, lng: 77.2728 },
  { name: "Indirapuram, Ghaziabad", lat: 28.6415, lng: 77.3714 },
  { name: "Saket, South Delhi", lat: 28.5244, lng: 77.2066 },
  { name: "Rohini Sector 14, Delhi", lat: 28.7180, lng: 77.1320 },
  { name: "Manesar Industrial Belt, Gurugram (45km away)", lat: 28.3540, lng: 76.9380 }
];
