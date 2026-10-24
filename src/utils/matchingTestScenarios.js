/**
 * Test Scenarios for RescuePlate Matching Engine (PS-43)
 * 
 * Verifies the 5 mandatory hackathon conditions:
 * 1. Successful high-score match
 * 2. Insufficient capacity rejection
 * 3. Expired food exclusion
 * 4. Missed deadline / transit window failure
 * 5. Category & storage mismatch rejection
 */

import { evaluateDonationMatch } from './matchingEngine.js';
import { DEMO_NGO_PROFILES } from '../data/ngoProfiles.js';

export const MATCH_TEST_SCENARIOS = [
  {
    id: "TC-01",
    name: "Successful High-Priority Match",
    description: "Urgent 45-portion cooked meal near South Delhi matched with a shelter having 75-meal open capacity and insulated hot containers.",
    expectedResult: "Eligible (High Score ~85-95%)",
    donation: {
      id: "TEST-001",
      foodName: "Hot Veg Pulao & Dal (45 meals)",
      category: "Cooked Meals",
      quantity: 45,
      unit: "meals",
      storageCondition: "Hot & Insulated",
      pickupAddress: "Sector 18, Noida",
      coordinates: { lat: 28.5708, lng: 77.3271 },
      collectionDeadline: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hrs future
      status: "Available",
      urgency: "High"
    },
    ngo: DEMO_NGO_PROFILES[0] // Asha Ek Kadam (Cap: 75 meals, Accepts Cooked, Has Insulated)
  },
  {
    id: "TC-02",
    name: "Insufficient NGO Capacity Rejection",
    description: "Same 45-portion cooked meal evaluated against a small daycare center with only 20 meals intake capacity.",
    expectedResult: "Ineligible (Exceeds Capacity)",
    donation: {
      id: "TEST-002",
      foodName: "Hot Veg Pulao & Dal (45 meals)",
      category: "Cooked Meals",
      quantity: 45,
      unit: "meals",
      storageCondition: "Hot & Insulated",
      pickupAddress: "Sector 18, Noida",
      coordinates: { lat: 28.5708, lng: 77.3271 },
      collectionDeadline: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
      status: "Available",
      urgency: "High"
    },
    ngo: DEMO_NGO_PROFILES[1] // Pratham Foundation (Cap: 20 meals < 45 meals)
  },
  {
    id: "TC-03",
    name: "Expired Food Spoilage Exclusion",
    description: "Donation whose collection deadline passed 30 minutes ago is strictly blocked to protect public health.",
    expectedResult: "Ineligible (Expired Window)",
    donation: {
      id: "TEST-003",
      foodName: "Artisan Breads (Expired 30m ago)",
      category: "Bakery & Bread",
      quantity: 20,
      unit: "boxes",
      storageCondition: "Room Temp",
      pickupAddress: "Connaught Place, New Delhi",
      coordinates: { lat: 28.6315, lng: 77.2167 },
      collectionDeadline: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins PAST
      status: "Available",
      urgency: "High"
    },
    ngo: DEMO_NGO_PROFILES[2] // Robin Hood Army
  },
  {
    id: "TC-04",
    name: "Unreachable Deadline / Transit Failure",
    description: "Urgent donation with only 20 minutes remaining, located 25 km away (needs ~60m transit + 15m prep).",
    expectedResult: "Ineligible (Transit Time > Time Remaining)",
    donation: {
      id: "TEST-004",
      foodName: "Buffet Surplus (Expires in 20 mins)",
      category: "Cooked Meals",
      quantity: 30,
      unit: "meals",
      storageCondition: "Room Temp",
      pickupAddress: "Manesar Industrial Hub (25km away)",
      coordinates: { lat: 28.3540, lng: 76.9380 }, // Distant coordinate
      collectionDeadline: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 mins remaining
      status: "Available",
      urgency: "High"
    },
    ngo: DEMO_NGO_PROFILES[0] // Asha Ek Kadam
  },
  {
    id: "TC-05",
    name: "Category Incompatibility Rejection",
    description: "Cooked meal surplus evaluated against a dry grains/staples pantry that strictly rejects prepared cooked food.",
    expectedResult: "Ineligible (Category Mismatch)",
    donation: {
      id: "TEST-005",
      foodName: "Fried Rice & Manchurian Gravy",
      category: "Cooked Meals",
      quantity: 40,
      unit: "meals",
      storageCondition: "Hot & Insulated",
      pickupAddress: "Connaught Place, New Delhi",
      coordinates: { lat: 28.6315, lng: 77.2167 },
      collectionDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      status: "Available",
      urgency: "Moderate"
    },
    ngo: DEMO_NGO_PROFILES[3] // Annapurna Dry Staples (Only accepts Bakery, Grains, Produce)
  },
  {
    id: "TC-06",
    name: "Cold Chain Storage Mismatch",
    description: "Perishable dairy batch requiring Refrigerated (4°C) evaluated against a volunteer team without cold chain facilities.",
    expectedResult: "Ineligible (Storage Mismatch)",
    donation: {
      id: "TEST-006",
      foodName: "Pasteurized Milk & Cottage Cheese (25 kg)",
      category: "Dairy & Cold Items",
      quantity: 25,
      unit: "kg",
      storageCondition: "Refrigerated (4°C)",
      pickupAddress: "Indirapuram Depot",
      coordinates: { lat: 28.6415, lng: 77.3714 },
      collectionDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      status: "Available",
      urgency: "Moderate"
    },
    ngo: DEMO_NGO_PROFILES[2] // Robin Hood Army (Lacks Refrigeration)
  }
];

/**
 * Runs all test scenarios and returns execution results
 */
export function runMatchingTestSuite() {
  return MATCH_TEST_SCENARIOS.map((scenario) => {
    const evaluation = evaluateDonationMatch(scenario.donation, scenario.ngo);
    const passed =
      (scenario.id === "TC-01" && evaluation.isEligible && evaluation.score >= 80) ||
      (scenario.id !== "TC-01" && !evaluation.isEligible && evaluation.exclusionReasons.length > 0);

    return {
      ...scenario,
      evaluation,
      passed
    };
  });
}
