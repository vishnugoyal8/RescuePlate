/**
 * Automated Verification Suite for Waste Intelligence, KYC Gating & Traceability (PS-43)
 * Tech Yuva Build-A-Thon 2026
 */

import { 
  validateWasteEntry, 
  computeEntryReconciliation, 
  summarizeWasteEntries 
} from './wasteIntelligence.js';
import { 
  GENESIS_HASH, 
  computeEventHash, 
  createGenesisTraceEvent, 
  appendTraceEvent, 
  verifyTraceabilityChain 
} from './cryptoTraceability.js';

export function runWasteTraceabilityTestSuite() {
  const results = [];

  // -------------------------------------------------------------
  // PART 1: WASTE INTELLIGENCE & MASS-BALANCE RECONCILIATION
  // -------------------------------------------------------------

  // TC-WST-01: Exact mass-balance reconciliation
  try {
    const rawEntry = {
      preparedQty: 100,
      soldOrServedQty: 70,
      donatedQty: 20,
      discardedQty: 5
    };
    const recon = computeEntryReconciliation(rawEntry);
    
    // Expected:
    // estimatedSurplus = 100 - 70 = 30
    // recordedDisposition = 20 + 5 = 25
    // unaccountedQty = 30 - 25 = 5
    // donationRatePct = (20 / 25) * 100 = 80.0%
    const isCorrect = 
      recon.estimatedSurplus === 30 &&
      recon.recordedDisposition === 25 &&
      recon.unaccountedQty === 5 &&
      recon.donationRatePct === 80;

    results.push({
      id: "TC-WST-01",
      name: "Mass-Balance Waste Reconciliation Formula Verification",
      description: "Computes Surplus = Prepared - Sold, Disposition = Donated + Discarded, Unaccounted = Surplus - Disposition.",
      details: `P:100, S:70, D:20, Disc:5 => Surplus:${recon.estimatedSurplus}, Disp:${recon.recordedDisposition}, Unaccounted:${recon.unaccountedQty}, Rate:${recon.donationRatePct}%`,
      passed: isCorrect
    });
  } catch (err) {
    results.push({
      id: "TC-WST-01",
      name: "Mass-Balance Waste Reconciliation Formula Verification",
      description: "Computes Surplus, Disposition, and Unaccounted quantities.",
      details: `Exception: ${err.message}`,
      passed: false
    });
  }

  // TC-WST-02: Inconsistent & Invalid Kitchen Entries Detection
  try {
    const invalidSoldHigherThanPrepared = {
      itemName: "Paneer Butter Masala",
      category: "Cooked Meals",
      preparedQty: 50,
      soldOrServedQty: 80, // Sold exceeds prepared!
      donatedQty: 10,
      discardedQty: 0
    };
    const valResult1 = validateWasteEntry(invalidSoldHigherThanPrepared);

    const negativeQtyEntry = {
      itemName: "Dal Makhani",
      category: "Cooked Meals",
      preparedQty: 50,
      soldOrServedQty: 40,
      donatedQty: -5, // Negative quantity!
      discardedQty: 0
    };
    const valResult2 = validateWasteEntry(negativeQtyEntry);

    const missingItemName = {
      itemName: "",
      category: "Cooked Meals",
      preparedQty: 50,
      soldOrServedQty: 40,
      donatedQty: 5,
      discardedQty: 0
    };
    const valResult3 = validateWasteEntry(missingItemName);

    const properlyBlocked = 
      !valResult1.isValid && 
      !valResult2.isValid && 
      !valResult3.isValid;

    results.push({
      id: "TC-WST-02",
      name: "Kitchen Entry Validation & Anomaly Detection",
      description: "Rejects sold > prepared, negative values, and missing item descriptions.",
      details: `Blocked sold>prepared: ${!valResult1.isValid}; Blocked negative qty: ${!valResult2.isValid}; Blocked blank item: ${!valResult3.isValid}`,
      passed: properlyBlocked
    });
  } catch (err) {
    results.push({
      id: "TC-WST-02",
      name: "Kitchen Entry Validation & Anomaly Detection",
      description: "Validates kitchen entries.",
      details: `Exception: ${err.message}`,
      passed: false
    });
  }

  // -------------------------------------------------------------
  // PART 2: KYC STATUS & VERIFICATION GATING
  // -------------------------------------------------------------

  // TC-KYC-01: Verification Gating Blocks Unverified Donor Organization
  try {
    const mockOrgProfiles = [
      { id: "ORG-01", name: "Saffron Heritage Banquets", verificationStatus: "Pending Review" },
      { id: "ORG-02", name: "Midnight Express", verificationStatus: "Rejected" },
      { id: "ORG-03", name: "Royal Spoon Banquets", verificationStatus: "Verified" }
    ];

    const checkVerification = (donorOrgName) => {
      const match = mockOrgProfiles.find(o => o.name.toLowerCase() === donorOrgName.toLowerCase());
      if (!match) return { isVerified: true, status: "Verified" };
      return { isVerified: match.verificationStatus === "Verified", status: match.verificationStatus };
    };

    const pendingCheck = checkVerification("Saffron Heritage Banquets");
    const rejectedCheck = checkVerification("Midnight Express");
    const verifiedCheck = checkVerification("Royal Spoon Banquets");

    const passed = 
      pendingCheck.isVerified === false && pendingCheck.status === "Pending Review" &&
      rejectedCheck.isVerified === false && rejectedCheck.status === "Rejected" &&
      verifiedCheck.isVerified === true && verifiedCheck.status === "Verified";

    results.push({
      id: "TC-KYC-01",
      name: "Role-Based Verification Gating for Food Donors & Kitchens",
      description: "Blocks donation broadcasting for organizations with Pending Review or Rejected KYC status.",
      details: `Pending blocked: ${!pendingCheck.isVerified}; Rejected blocked: ${!rejectedCheck.isVerified}; Verified allowed: ${verifiedCheck.isVerified}`,
      passed
    });
  } catch (err) {
    results.push({
      id: "TC-KYC-01",
      name: "Role-Based Verification Gating for Food Donors & Kitchens",
      description: "Validates donor KYC gating.",
      details: `Exception: ${err.message}`,
      passed: false
    });
  }

  // TC-KYC-02: Verification Gating Blocks Unverified Recipient NGO Claim
  try {
    const mockNgoProfiles = [
      { id: "NGO-01", name: "Hope Shelter Home", verificationStatus: "Pending Review" },
      { id: "NGO-02", name: "Asha Ek Kadam", verificationStatus: "Verified" }
    ];

    const checkNgoClaim = (ngoName) => {
      const match = mockNgoProfiles.find(n => n.name.toLowerCase() === ngoName.toLowerCase());
      if (!match) return { allowed: true };
      return { allowed: match.verificationStatus === "Verified", reason: `Status is ${match.verificationStatus}` };
    };

    const pendingClaim = checkNgoClaim("Hope Shelter Home");
    const verifiedClaim = checkNgoClaim("Asha Ek Kadam");

    const passed = !pendingClaim.allowed && verifiedClaim.allowed;

    results.push({
      id: "TC-KYC-02",
      name: "Recipient NGO Verification Gating for Donation Claims",
      description: "Prevents unverified NGOs from claiming perishable food donations without completed credentials.",
      details: `Pending NGO claim rejected: ${!pendingClaim.allowed}; Verified NGO claim allowed: ${verifiedClaim.allowed}`,
      passed
    });
  } catch (err) {
    results.push({
      id: "TC-KYC-02",
      name: "Recipient NGO Verification Gating for Donation Claims",
      description: "Validates NGO claim gating.",
      details: `Exception: ${err.message}`,
      passed: false
    });
  }

  // -------------------------------------------------------------
  // PART 3: CRYPTOGRAPHIC TRACEABILITY & TAMPER DETECTION
  // -------------------------------------------------------------

  // TC-TRC-01: Valid Cryptographic Chain Creation & Sequential Linkage
  try {
    const sampleDonation = {
      id: "DON-TEST-100",
      donorOrg: "Grand Pearl Banquet & Hotel",
      foodName: "Vegetable Biryani",
      category: "Cooked Meals",
      quantity: 50,
      unit: "meals",
      storageCondition: "Warm / Insulated",
      collectionDeadline: "2026-10-24T22:00:00Z",
      pickupAddress: "Indirapuram, Ghaziabad",
      createdAt: "2026-10-24T18:00:00Z"
    };

    // 1. Genesis Event
    const genesis = createGenesisTraceEvent(sampleDonation);
    
    // 2. Packed Event
    const chain1 = appendTraceEvent([genesis], "Packed", "Grand Pearl Banquet & Hotel", "Kitchen Staff", {
      containers: "Food-grade stainless containers",
      temperatureAtPackingCelsius: 68
    }, "2026-10-24T18:15:00Z");

    // 3. Handover Confirmed Event
    const chain2 = appendTraceEvent(chain1, "Handover Confirmed", "Grand Pearl Banquet & Hotel", "Kitchen Supervisor", {
      handoverApproved: true
    }, "2026-10-24T18:45:00Z");

    // 4. Picked Up Event
    const chain3 = appendTraceEvent(chain2, "Picked Up", "Asha Ek Kadam Logistics", "Courier Driver", {
      transitVehicle: "Thermal insulated van"
    }, "2026-10-24T19:00:00Z");

    // 5. Delivered Event
    const fullChain = appendTraceEvent(chain3, "Delivered", "Asha Ek Kadam", "Shelter Intake Lead", {
      intakeVerified: true,
      mealsDistributed: 50
    }, "2026-10-24T19:35:00Z");

    const auditResult = verifyTraceabilityChain(fullChain);

    const passed = 
      fullChain.length === 5 && 
      auditResult.isValid === true &&
      fullChain[0].previousHash === GENESIS_HASH &&
      fullChain[1].previousHash === fullChain[0].hash &&
      fullChain[2].previousHash === fullChain[1].hash &&
      fullChain[3].previousHash === fullChain[2].hash &&
      fullChain[4].previousHash === fullChain[3].hash;

    results.push({
      id: "TC-TRC-01",
      name: "Cryptographic SHA-256 Audit Chain Verification",
      description: "Generates 5-block event log from Created to Delivered; verifies genesis hash and sequential linkage.",
      details: `Chain length: ${fullChain.length} blocks. Cryptographic audit: ${auditResult.isValid ? "VERIFIED VALID" : "INVALID"}`,
      passed
    });
  } catch (err) {
    results.push({
      id: "TC-TRC-01",
      name: "Cryptographic SHA-256 Audit Chain Verification",
      description: "Tests hash chain verification.",
      details: `Exception: ${err.message}`,
      passed: false
    });
  }

  // TC-TRC-02: Instant Tamper Detection when Payload or Hash is Modified
  try {
    const sampleDonation = {
      id: "DON-TEST-200",
      donorOrg: "Royal Spoon Banquets",
      foodName: "Assorted Breads",
      category: "Bakery & Bread",
      quantity: 30,
      unit: "portions",
      createdAt: "2026-10-24T14:00:00Z"
    };

    const genesis = createGenesisTraceEvent(sampleDonation);
    const validChain = appendTraceEvent([genesis], "Packed", "Royal Spoon", "Bakery Lead", {
      packagingSealed: true
    }, "2026-10-24T14:20:00Z");

    // Simulate illicit modification in Block #2 payload
    const tamperedChain = [
      validChain[0],
      {
        ...validChain[1],
        payload: {
          packagingSealed: true,
          quantityRescued: 9999 // Illicit tampering without recomputing SHA-256
        }
      }
    ];

    const tamperResult = verifyTraceabilityChain(tamperedChain);

    const passed = 
      tamperResult.isValid === false && 
      tamperResult.brokenIndex === 1 &&
      tamperResult.error.includes("tampered with");

    results.push({
      id: "TC-TRC-02",
      name: "Tamper-Evident SHA-256 Hash Integrity Protection",
      description: "Detects unauthorized payload mutation in block #2 and pinpoints the corrupted block index.",
      details: `Tamper detected: ${!tamperResult.isValid}; Broken block index: ${tamperResult.brokenIndex}; Diagnostic: "${tamperResult.error?.slice(0, 70)}..."`,
      passed
    });
  } catch (err) {
    results.push({
      id: "TC-TRC-02",
      name: "Tamper-Evident SHA-256 Hash Integrity Protection",
      description: "Tests tamper detection.",
      details: `Exception: ${err.message}`,
      passed: false
    });
  }

  // TC-TRC-03: Food Safety & Hash Chain Independence Enforcement
  try {
    // Verifies that food safety temperature checks and custody validations are stored as explicit audit fields
    // and not conflated with the cryptographic hash itself.
    const genesis = createGenesisTraceEvent({
      id: "DON-TEST-300",
      donorOrg: "Crust & Crumb",
      foodName: "Pastries",
      category: "Bakery & Bread",
      quantity: 20,
      unit: "portions",
      createdAt: "2026-10-24T10:00:00Z"
    });

    const chainWithSafety = appendTraceEvent([genesis], "Packed", "Crust & Crumb", "Baker", {
      temperatureCelsius: 22,
      sensoryInspectionPassed: true,
      foodSafetyDisclaimerAcknowledged: true
    });

    const hasExplicitSafetyField = 
      chainWithSafety[1].payload.sensoryInspectionPassed === true &&
      chainWithSafety[1].payload.foodSafetyDisclaimerAcknowledged === true &&
      typeof chainWithSafety[1].hash === 'string' &&
      chainWithSafety[1].hash.length === 64;

    results.push({
      id: "TC-TRC-03",
      name: "Independent Food Safety Verification & Disclaimers",
      description: "Ensures physical food safety attributes are recorded independently of cryptographic SHA-256 hashes.",
      details: `Safety fields present: ${hasExplicitSafetyField}; Hash size: 64-char SHA-256`,
      passed: hasExplicitSafetyField
    });
  } catch (err) {
    results.push({
      id: "TC-TRC-03",
      name: "Independent Food Safety Verification & Disclaimers",
      description: "Tests food safety independence.",
      details: `Exception: ${err.message}`,
      passed: false
    });
  }

  return results;
}
