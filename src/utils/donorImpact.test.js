/**
 * Test Suite for RescuePlate Donor Impact & State Transitions (Task 3 - PS-43)
 * 
 * Verifies:
 * 1. Strict verified impact calculation from completed ("Delivered") donations.
 * 2. Incomplete donations exclusion from verified rescue totals.
 * 3. Configurable commercial waste disposal cost avoided formula.
 * 4. Transparent RescuePlate Community Partner badge qualification.
 * 5. Lifecycle state machine transitions and invalid transition prevention.
 */

import { calculateDonorImpact, generateShareableImpactSummary } from './donorImpact.js';
import { validateStateTransition, DONATION_STATUSES } from './stateTransitions.js';

export const DONOR_TEST_SCENARIOS = [
  {
    id: "TC-IMP-01",
    name: "Verified Impact Calculation from Completed (Delivered) Donations",
    description: "Ensures only Delivered items are counted as verified meals and diverted weight.",
    run: () => {
      const mockDonations = [
        {
          id: "DON-01",
          status: "Delivered",
          quantity: 50,
          unit: "meals",
          estimatedWeightKg: 20
        },
        {
          id: "DON-02",
          status: "Delivered",
          quantity: 30,
          unit: "kg", // 30 kg ~ 75 meals (2.5 factor)
          estimatedWeightKg: 30
        }
      ];

      const impact = calculateDonorImpact(mockDonations, { disposalCostPerKg: 12.0 });

      // 50 meals + (30 kg * 2.5) = 50 + 75 = 125 meals
      const expectedMeals = 125;
      const expectedWeight = 50.0;
      const expectedCost = 50 * 12; // 600

      const passed = 
        impact.completedCount === 2 &&
        impact.verifiedMealsRescued === expectedMeals &&
        impact.verifiedWeightDivertedKg === expectedWeight &&
        impact.estimatedDisposalCostAvoided === expectedCost;

      return {
        passed,
        details: `Verified: ${impact.verifiedMealsRescued} meals, ${impact.verifiedWeightDivertedKg} kg, ₹${impact.estimatedDisposalCostAvoided} avoided cost.`
      };
    }
  },
  {
    id: "TC-IMP-02",
    name: "Strict Exclusion of Incomplete Donations from Rescued Totals",
    description: "Verifies Available, Claimed, and Picked Up donations are NOT counted as verified rescue.",
    run: () => {
      const mockDonations = [
        {
          id: "DON-AVAILABLE",
          status: "Available",
          quantity: 100,
          unit: "meals",
          estimatedWeightKg: 40
        },
        {
          id: "DON-CLAIMED",
          status: "Claimed",
          quantity: 80,
          unit: "meals",
          estimatedWeightKg: 32
        },
        {
          id: "DON-IN-TRANSIT",
          status: "Picked Up",
          quantity: 40,
          unit: "meals",
          estimatedWeightKg: 16
        },
        {
          id: "DON-DELIVERED",
          status: "Delivered",
          quantity: 25,
          unit: "meals",
          estimatedWeightKg: 10
        }
      ];

      const impact = calculateDonorImpact(mockDonations);

      // Only the 1 Delivered item should count toward verified:
      // Verified meals: 25 (NOT 100 + 80 + 40 + 25 = 245)
      // Pipeline meals: 80 + 40 = 120
      const passed =
        impact.completedCount === 1 &&
        impact.verifiedMealsRescued === 25 &&
        impact.verifiedWeightDivertedKg === 10 &&
        impact.pipelinePendingMeals === 120;

      return {
        passed,
        details: `Verified meals = ${impact.verifiedMealsRescued} (expected 25). Pipeline pending = ${impact.pipelinePendingMeals} (expected 120).`
      };
    }
  },
  {
    id: "TC-IMP-03",
    name: "Configurable Disposal Cost Avoided Scaling",
    description: "Tests that municipal hauling cost avoided dynamically scales with configured rate.",
    run: () => {
      const mockDonations = [
        { id: "DON-01", status: "Delivered", quantity: 100, unit: "kg", estimatedWeightKg: 100 }
      ];

      const impactAt12 = calculateDonorImpact(mockDonations, { disposalCostPerKg: 12.0 });
      const impactAt20 = calculateDonorImpact(mockDonations, { disposalCostPerKg: 20.0 });

      const passed = 
        impactAt12.estimatedDisposalCostAvoided === 1200 &&
        impactAt20.estimatedDisposalCostAvoided === 2000;

      return {
        passed,
        details: `Rate ₹12/kg => ₹${impactAt12.estimatedDisposalCostAvoided}; Rate ₹20/kg => ₹${impactAt20.estimatedDisposalCostAvoided}.`
      };
    }
  },
  {
    id: "TC-IMP-04",
    name: "RescuePlate Community Partner Badge Threshold Logic",
    description: "Checks transparent qualification rule: at least 3 completed deliveries required.",
    run: () => {
      const twoDeliveries = [
        { id: "1", status: "Delivered", quantity: 20, unit: "meals" },
        { id: "2", status: "Delivered", quantity: 20, unit: "meals" }
      ];

      const threeDeliveries = [
        ...twoDeliveries,
        { id: "3", status: "Delivered", quantity: 20, unit: "meals" }
      ];

      const impactUnder = calculateDonorImpact(twoDeliveries);
      const impactMet = calculateDonorImpact(threeDeliveries);

      const passed = 
        impactUnder.partnerBadge.isQualified === false &&
        impactUnder.partnerBadge.remainingForBadge === 1 &&
        impactMet.partnerBadge.isQualified === true &&
        impactMet.partnerBadge.tierName === "RescuePlate Verified Community Partner";

      return {
        passed,
        details: `2 deliveries: Qualified=${impactUnder.partnerBadge.isQualified} (Needs ${impactUnder.partnerBadge.remainingForBadge} more). 3 deliveries: Qualified=${impactMet.partnerBadge.isQualified}.`
      };
    }
  },
  {
    id: "TC-TR-01",
    name: "Valid Lifecycle Progression (Available -> Claimed -> Picked Up -> Delivered)",
    description: "Verifies standard ordered sequential custody progression is permitted.",
    run: () => {
      const t1 = validateStateTransition(DONATION_STATUSES.AVAILABLE, DONATION_STATUSES.CLAIMED);
      const t2 = validateStateTransition(DONATION_STATUSES.CLAIMED, DONATION_STATUSES.PICKED_UP);
      const t3 = validateStateTransition(DONATION_STATUSES.PICKED_UP, DONATION_STATUSES.DELIVERED);

      const passed = t1.isValid && t2.isValid && t3.isValid;

      return {
        passed,
        details: `All 3 standard sequential transitions evaluated as valid: ${passed}`
      };
    }
  },
  {
    id: "TC-TR-02",
    name: "Invalid Transition Prevention: Available directly to Delivered",
    description: "Strictly blocks skipping NGO claiming and courier pickup custody handoffs.",
    run: () => {
      const result = validateStateTransition(DONATION_STATUSES.AVAILABLE, DONATION_STATUSES.DELIVERED);

      const passed = result.isValid === false && Boolean(result.error);

      return {
        passed,
        details: `Blocked invalid transition: "${result.error}"`
      };
    }
  },
  {
    id: "TC-TR-03",
    name: "Invalid Transition Prevention: Available directly to Picked Up",
    description: "Blocks courier pickup without prior NGO reservation claim.",
    run: () => {
      const result = validateStateTransition(DONATION_STATUSES.AVAILABLE, DONATION_STATUSES.PICKED_UP);

      const passed = result.isValid === false && Boolean(result.error);

      return {
        passed,
        details: `Blocked invalid transition: "${result.error}"`
      };
    }
  },
  {
    id: "TC-TR-04",
    name: "Terminal State Protection for Delivered Dispatches",
    description: "Guarantees completed delivered dispatches cannot be accidentally converted into in-transit.",
    run: () => {
      const result = validateStateTransition(DONATION_STATUSES.DELIVERED, DONATION_STATUSES.CLAIMED);

      const passed = result.isValid === false && Boolean(result.error);

      return {
        passed,
        details: `Delivered terminal protection: "${result.error}"`
      };
    }
  }
];

/**
 * Runs all donor impact and state transition test scenarios
 */
export function runDonorImpactTestSuite() {
  return DONOR_TEST_SCENARIOS.map((scenario) => {
    try {
      const outcome = scenario.run();
      return {
        ...scenario,
        passed: outcome.passed,
        details: outcome.details
      };
    } catch (err) {
      return {
        ...scenario,
        passed: false,
        details: `Exception: ${err.message}`
      };
    }
  });
}
