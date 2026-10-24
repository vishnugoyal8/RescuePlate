import { runMatchingTestSuite } from './matchingTestScenarios.js';
import { runDonorImpactTestSuite } from './donorImpact.test.js';
import { runWasteTraceabilityTestSuite } from './wasteTraceability.test.js';
import { runAuthTestSuite } from './authTests.js';

async function main() {
  console.log("==================================================================");
  console.log("RESCUEPLATE AUTOMATED VERIFICATION SUITE (PS-43 / TECH YUVA 2026)");
  console.log("==================================================================");

  let allPassed = true;

  // 1. Task 2: Matching Engine Tests
  console.log("\n--- PART 1: EXPLAINABLE SMART MATCHING ENGINE (6 SCENARIOS) ---");
  const matchResults = runMatchingTestSuite();

  matchResults.forEach((r) => {
    console.log(`\n[${r.id}] ${r.name}`);
    console.log(`  Expected: ${r.expectedResult}`);
    console.log(`  Outcome: ${r.evaluation.isEligible ? `Eligible (Score: ${r.evaluation.score}/100)` : "Disqualified"}`);
    if (r.evaluation.isEligible) {
      console.log(`  Reason: ${r.evaluation.reasons[0]}`);
    } else {
      console.log(`  Exclusion: ${r.evaluation.exclusionReasons[0]}`);
    }
    console.log(`  Status: ${r.passed ? "✅ PASS" : "❌ FAIL"}`);
    if (!r.passed) allPassed = false;
  });

  // 2. Task 3: Donor Impact & State Transitions Tests
  console.log("\n--- PART 2: DONOR IMPACT & LIFECYCLE TRANSITIONS (8 SCENARIOS) ---");
  const donorResults = runDonorImpactTestSuite();

  donorResults.forEach((r) => {
    console.log(`\n[${r.id}] ${r.name}`);
    console.log(`  Description: ${r.description}`);
    console.log(`  Details: ${r.details}`);
    console.log(`  Status: ${r.passed ? "✅ PASS" : "❌ FAIL"}`);
    if (!r.passed) allPassed = false;
  });

  // 3. Task 3: Waste Intelligence, KYC Gating & Cryptographic Traceability Tests
  console.log("\n--- PART 3: WASTE RECONCILIATION, KYC GATING & CRYPTO TRACEABILITY (7 SCENARIOS) ---");
  const wasteResults = runWasteTraceabilityTestSuite();

  wasteResults.forEach((r) => {
    console.log(`\n[${r.id}] ${r.name}`);
    console.log(`  Description: ${r.description}`);
    console.log(`  Details: ${r.details}`);
    console.log(`  Status: ${r.passed ? "✅ PASS" : "❌ FAIL"}`);
    if (!r.passed) allPassed = false;
  });

  // 4. Role-Based Authentication, Authorization (RBAC) & KYC Visibility Tests
  console.log("\n--- PART 4: SECURE AUTHENTICATION, RBAC & KYC VISIBILITY (20 SCENARIOS) ---");
  let authResults = [];
  try {
    authResults = await runAuthTestSuite();
    authResults.forEach((r) => {
      console.log(`\n[${r.id}] ${r.name}`);
      console.log(`  Description: ${r.description}`);
      console.log(`  Details: ${r.details}`);
      console.log(`  Status: ${r.passed ? "✅ PASS" : "❌ FAIL"}`);
      if (!r.passed) allPassed = false;
    });
  } catch (err) {
    console.error("Auth test execution error:", err);
    allPassed = false;
  }

  console.log("\n==================================================================");
  const totalTests = matchResults.length + donorResults.length + wasteResults.length + authResults.length;
  const totalPasses = 
    matchResults.filter(r => r.passed).length + 
    donorResults.filter(r => r.passed).length + 
    wasteResults.filter(r => r.passed).length +
    authResults.filter(r => r.passed).length;

  console.log(`FINAL RESULT: ${allPassed ? "ALL TESTS PASSED ✅" : "SOME TESTS FAILED ❌"} (${totalPasses}/${totalTests} Passed)`);
  console.log("==================================================================");

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
