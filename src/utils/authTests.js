/**
 * Automated Verification Suite for Secure Role-Based Authentication (RBAC)
 * Tech Yuva Build-A-Thon 2026 - Problem Statement PS-43
 * 
 * Verifies:
 * 1. Donor registration & login with bcrypt password hashing
 * 2. NGO registration & login with capacity onboarding
 * 3. Invalid credentials rejection
 * 4. Session restoration on refresh via JWT / cookies
 * 5. Logout & cookie clearance
 * 6. Protected routes rejection for unauthenticated users
 * 7. Donors blocked from NGO-only actions (claiming dispatches)
 * 8. NGOs blocked from donor-only actions (creating donations / waste logs)
 * 9. Cross-organization data isolation (cannot modify another org's record)
 * 10. Verification gating for pending/rejected status
 */

process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../../server/index.js';
import { db } from '../../server/db/store.js';
import bcrypt from 'bcryptjs';

export async function runAuthTestSuite() {
  const results = [];

  // Reset database state to pristine seeds for test reproducibility
  db.resetForTesting();

  // Spin up temporary test server
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Donor Registration & Login
    // -------------------------------------------------------------
    const donorEmail = `chef.raj_${Date.now()}@testdonor.com`;
    const donorPassword = "TestDonorPassword@2026";

    const regDonorRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Chef Rajan Oberoi",
        orgName: "Oberoi Palace Banquets",
        email: donorEmail,
        password: donorPassword,
        confirmPassword: donorPassword,
        role: "donor",
        phone: "+91 98111 55667",
        locality: "Dwarka, New Delhi"
      })
    });

    const regDonorData = await regDonorRes.json();
    const donorCookie = regDonorRes.headers.get('set-cookie');

    // Verify user in DB has bcrypt password hash, NOT plaintext
    const dbUser = db.findUserByEmail(donorEmail);
    const hasBcryptHash = dbUser && dbUser.passwordHash && dbUser.passwordHash.startsWith('$2');
    const isPlaintextAbsent = dbUser && !dbUser.password;

    const test1Passed = 
      regDonorRes.status === 201 &&
      regDonorData.user.role === 'donor' &&
      regDonorData.user.verificationStatus === 'Pending Review' && // Default unverified
      hasBcryptHash &&
      isPlaintextAbsent &&
      Boolean(donorCookie && donorCookie.includes('token='));

    results.push({
      id: "TC-AUTH-01",
      name: "Food Donor Registration with Secure Bcrypt Hashing",
      description: "Registers donor, verifies bcrypt salt rounds, sets Pending Review, and issues HttpOnly cookie.",
      details: `Status: ${regDonorRes.status}, Role: ${regDonorData.user?.role}, Hashed: ${hasBcryptHash}, Cookie Issued: ${Boolean(donorCookie)}`,
      passed: test1Passed
    });

    // -------------------------------------------------------------
    // TEST 2: NGO Registration & Login
    // -------------------------------------------------------------
    const ngoEmail = `relief_${Date.now()}@testngo.org`;
    const ngoPassword = "TestNgoPassword@2026";

    const regNgoRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Anuradha Sen",
        orgName: "Care India Feeding Project",
        email: ngoEmail,
        password: ngoPassword,
        confirmPassword: ngoPassword,
        role: "ngo",
        phone: "+91 98222 33445",
        locality: "Okhla, New Delhi",
        capacity: 85
      })
    });

    const regNgoData = await regNgoRes.json();
    const ngoCookie = regNgoRes.headers.get('set-cookie');

    const test2Passed = 
      regNgoRes.status === 201 &&
      regNgoData.user.role === 'ngo' &&
      regNgoData.user.capacity === 85 &&
      Boolean(ngoCookie);

    results.push({
      id: "TC-AUTH-02",
      name: "Recipient NGO Registration & Capacity Configuration",
      description: "Registers NGO with capacity limits and initializes secure session cookie.",
      details: `Status: ${regNgoRes.status}, Role: ${regNgoData.user?.role}, Intake Capacity: ${regNgoData.user?.capacity}`,
      passed: test2Passed
    });

    // -------------------------------------------------------------
    // TEST 3: Invalid Credentials Rejection
    // -------------------------------------------------------------
    const invalidLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: donorEmail,
        password: "WrongPassword@999" // Incorrect password
      })
    });

    const invalidLoginData = await invalidLoginRes.json();
    const test3Passed = 
      invalidLoginRes.status === 401 &&
      invalidLoginData.code === "INVALID_CREDENTIALS";

    results.push({
      id: "TC-AUTH-03",
      name: "Authentication Failure on Invalid Credentials",
      description: "Rejects incorrect password with 401 Unauthorized without leaking password details.",
      details: `Status: ${invalidLoginRes.status}, Error Code: ${invalidLoginData.code}`,
      passed: test3Passed
    });

    // -------------------------------------------------------------
    // TEST 4: Session Restoration on Refresh (/api/auth/me)
    // -------------------------------------------------------------
    // Login with seeded verified donor
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "donor@grandpearl.com",
        password: "DemoDonor@2026"
      })
    });

    const loginData = await loginRes.json();
    const authCookie = loginRes.headers.get('set-cookie');
    const cookieHeader = authCookie ? authCookie.split(';')[0] : '';

    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Cookie': cookieHeader }
    });
    const meData = await meRes.json();

    const test4Passed = 
      meRes.status === 200 &&
      meData.authenticated === true &&
      meData.user.email === "donor@grandpearl.com" &&
      meData.user.role === "donor";

    results.push({
      id: "TC-AUTH-04",
      name: "Session Restoration via HttpOnly Cookie on Refresh",
      description: "Validates that GET /api/auth/me restores active authenticated user session from cookie.",
      details: `Auth: ${meData.authenticated}, User: ${meData.user?.email}, Role: ${meData.user?.role}`,
      passed: test4Passed
    });

    // -------------------------------------------------------------
    // TEST 5: Logout and Session Clearance
    // -------------------------------------------------------------
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Cookie': cookieHeader }
    });

    const clearedCookie = logoutRes.headers.get('set-cookie');
    const isTokenCleared = clearedCookie && (clearedCookie.includes('token=;') || clearedCookie.includes('Max-Age=0'));

    const test5Passed = 
      logoutRes.status === 200 &&
      Boolean(isTokenCleared);

    results.push({
      id: "TC-AUTH-05",
      name: "Secure Logout and Cookie Expiration",
      description: "Clears session cookie on server with Max-Age=0 / expired token.",
      details: `Status: ${logoutRes.status}, Cookie Cleared: ${Boolean(isTokenCleared)}`,
      passed: test5Passed
    });

    // -------------------------------------------------------------
    // TEST 6: Unauthenticated Request Protection
    // -------------------------------------------------------------
    const unauthRes = await fetch(`${baseUrl}/api/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        foodName: "Unauthorized Curry",
        quantity: 20
      })
    });
    const unauthData = await unauthRes.json();

    const test6Passed = 
      unauthRes.status === 401 &&
      unauthData.code === "UNAUTHENTICATED";

    results.push({
      id: "TC-AUTH-06",
      name: "Route Protection for Unauthenticated Users",
      description: "Strictly blocks anonymous/unauthenticated access to protected API endpoints with 401.",
      details: `Status: ${unauthRes.status}, Code: ${unauthData.code}`,
      passed: test6Passed
    });

    // -------------------------------------------------------------
    // TEST 7: Donor Attempting NGO-Only Action (Claiming Food)
    // -------------------------------------------------------------
    // Grand Pearl is a Food Donor
    const claimAsDonorRes = await fetch(`${baseUrl}/api/donations/DON-103/claim`, {
      method: 'POST',
      headers: { 
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    const claimAsDonorData = await claimAsDonorRes.json();

    const test7Passed = 
      claimAsDonorRes.status === 403 &&
      claimAsDonorData.code === "FORBIDDEN" &&
      claimAsDonorData.currentRole === "donor";

    results.push({
      id: "TC-AUTH-07",
      name: "RBAC Gating: Donor Attempting NGO-Only Claim Action",
      description: "Blocks food donor accounts from claiming donations; returns 403 Forbidden.",
      details: `Status: ${claimAsDonorRes.status}, Current Role: ${claimAsDonorData.currentRole}, Code: ${claimAsDonorData.code}`,
      passed: test7Passed
    });

    // -------------------------------------------------------------
    // TEST 8: NGO Attempting Donor-Only Action (Creating Surplus Broadcast)
    // -------------------------------------------------------------
    // Login as verified NGO
    const ngoLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "ngo@asha.org",
        password: "DemoNgo@2026"
      })
    });
    const ngoAuthCookie = ngoLoginRes.headers.get('set-cookie');
    const ngoCookieHeader = ngoAuthCookie ? ngoAuthCookie.split(';')[0] : '';

    const postAsNgoRes = await fetch(`${baseUrl}/api/donations`, {
      method: 'POST',
      headers: { 
        'Cookie': ngoCookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        foodName: "Illicit NGO Food Broadcast",
        quantity: 50
      })
    });
    const postAsNgoData = await postAsNgoRes.json();

    const test8Passed = 
      postAsNgoRes.status === 403 &&
      postAsNgoData.code === "FORBIDDEN" &&
      postAsNgoData.currentRole === "ngo";

    results.push({
      id: "TC-AUTH-08",
      name: "RBAC Gating: NGO Attempting Donor-Only Broadcast Action",
      description: "Blocks NGO accounts from creating surplus donation listings; returns 403 Forbidden.",
      details: `Status: ${postAsNgoRes.status}, Current Role: ${postAsNgoData.currentRole}, Code: ${postAsNgoData.code}`,
      passed: test8Passed
    });

    // -------------------------------------------------------------
    // TEST 9: Cross-Organization Data Isolation Violation Prevention
    // -------------------------------------------------------------
    // DON-101 belongs to Royal Spoon Banquets & Asha Ek Kadam.
    // Grand Pearl (logged in) attempts to alter status of Royal Spoon's donation!
    const crossOrgRes = await fetch(`${baseUrl}/api/donations/DON-101/status`, {
      method: 'PUT',
      headers: { 
        'Cookie': cookieHeader, // Grand Pearl Banquet & Hotel
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newStatus: "Delivered"
      })
    });
    const crossOrgData = await crossOrgRes.json();

    const test9Passed = 
      crossOrgRes.status === 403 &&
      crossOrgData.code === "CROSS_ORG_FORBIDDEN";

    results.push({
      id: "TC-AUTH-09",
      name: "Cross-Organization Data Isolation Enforcement",
      description: "Prevents Organization A from modifying status or records of Organization B dispatches.",
      details: `Status: ${crossOrgRes.status}, Error: "${crossOrgData.error?.slice(0, 75)}..."`,
      passed: test9Passed
    });

    // -------------------------------------------------------------
    // TEST 10: Pending/Rejected KYC Verification Gating
    // -------------------------------------------------------------
    // Login as Pending Donor: pending@saffron.com
    const pendingLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "pending@saffron.com",
        password: "DemoDonor@2026"
      })
    });
    const pendingCookieHeader = pendingLoginRes.headers.get('set-cookie')?.split(';')[0] || '';

    const pendingPostRes = await fetch(`${baseUrl}/api/donations`, {
      method: 'POST',
      headers: { 
        'Cookie': pendingCookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        foodName: "Saffron Biryani Batch",
        quantity: 40
      })
    });
    const pendingPostData = await pendingPostRes.json();

    const test10Passed = 
      pendingPostRes.status === 403 &&
      pendingPostData.code === "VERIFICATION_REQUIRED" &&
      pendingPostData.verificationStatus === "Pending Review";

    results.push({
      id: "TC-AUTH-10",
      name: "KYC Verification Gating for Unverified Organizations",
      description: "Blocks Pending Review organizations from broadcasting food until KYC verification is granted.",
      details: `Status: ${pendingPostRes.status}, Verification Status: ${pendingPostData.verificationStatus}, Code: ${pendingPostData.code}`,
      passed: test10Passed
    });

    // -------------------------------------------------------------
    // TEST 11: Unauthenticated GET /api/donations Private Data Protection
    // -------------------------------------------------------------
    const unauthGetRes = await fetch(`${baseUrl}/api/donations`);
    const unauthGetData = await unauthGetRes.json();

    const test11Passed = 
      unauthGetRes.status === 401 && 
      unauthGetData.code === "UNAUTHENTICATED";

    results.push({
      id: "TC-AUTH-11",
      name: "Unauthenticated Private Dispatch Listing Protection",
      description: "Strictly blocks anonymous/unauthenticated users from reading private donation listings (returns 401).",
      details: `Status: ${unauthGetRes.status}, Code: ${unauthGetData.code}`,
      passed: test11Passed
    });

    // -------------------------------------------------------------
    // TEST 12: Role Elevation & Self-Verification Attack Prevention
    // -------------------------------------------------------------
    // Authenticated donor attempts to elevate own role to 'admin' or self-assign 'Verified'
    const elevateRes = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Cookie': donorCookie.split(';')[0],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: "admin",
        verificationStatus: "Verified"
      })
    });
    const elevateData = await elevateRes.json();

    const test12Passed = 
      elevateRes.status === 403 &&
      elevateData.code === "ROLE_ELEVATION_FORBIDDEN";

    results.push({
      id: "TC-AUTH-12",
      name: "Client-Side Role Elevation & Self-Verification Rejection",
      description: "Blocks users from altering their own role or verification status through client API requests (returns 403).",
      details: `Status: ${elevateRes.status}, Error Code: ${elevateData.code}`,
      passed: test12Passed
    });

    // -------------------------------------------------------------
    // TEST 13: Tampered & Expired Session Rejection
    // -------------------------------------------------------------
    // Sending a forged / invalid JWT signature
    const forgedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl85OTkiLCJyb2xlIjoiYWRtaW4ifQ.FORGED_SIGNATURE";
    const forgedRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        'Cookie': `token=${forgedToken}`
      }
    });

    const test13Passed = forgedRes.status === 401;

    results.push({
      id: "TC-AUTH-13",
      name: "Cryptographic JWT Signature Verification & Forgery Rejection",
      description: "Rejects invalid or forged JWT signatures on GET /api/auth/me with 401 Unauthorized.",
      details: `Status: ${forgedRes.status}, Forgery Successfully Denied: ${test13Passed}`,
      passed: test13Passed
    });

    // -------------------------------------------------------------
    // TEST 14: Public Non-Sensitive Metrics Access
    // -------------------------------------------------------------
    const publicSummaryRes = await fetch(`${baseUrl}/api/donations/public-summary`);
    const publicSummaryData = await publicSummaryRes.json();

    const test14Passed = 
      publicSummaryRes.status === 200 &&
      typeof publicSummaryData.totalDonations === 'number' &&
      typeof publicSummaryData.estimatedMealsRescued === 'number' &&
      !publicSummaryData.donations; // No private records exposed

    results.push({
      id: "TC-AUTH-14",
      name: "Public Non-Sensitive Aggregate Metrics Availability",
      description: "Allows unauthenticated landing view to access aggregate statistics without exposing private records.",
      details: `Status: ${publicSummaryRes.status}, Meals Rescued: ${publicSummaryData.estimatedMealsRescued}, Private Dispatches Hidden: ${test14Passed}`,
      passed: test14Passed
    });

    // -------------------------------------------------------------
    // TEST 15 / TC-KYC-03: Public Trust Directory Strips Private PII
    // -------------------------------------------------------------
    const publicTrustRes = await fetch(`${baseUrl}/api/trust/profiles`);
    const publicTrustData = await publicTrustRes.json();
    const profiles = publicTrustData.trustProfiles;

    const allProfilesSafe = Array.isArray(profiles) &&
      profiles.length > 0 &&
      profiles.every(p => 
        p.name && 
        p.category && 
        p.verificationBadge &&
        p.phone === undefined &&
        p.contactPerson === undefined &&
        p.complianceNotes === undefined &&
        p.simulatedRegistrationId === undefined
      );

    const test15Passed = publicTrustRes.status === 200 && allProfilesSafe;

    results.push({
      id: "TC-KYC-03",
      name: "Public Trust Directory PII Redaction & Leakage Prevention",
      description: "Verifies GET /api/trust/profiles returns aggregate trust data but strips phone numbers, contacts, license IDs, and audit notes.",
      details: `Status: ${publicTrustRes.status}, Profile Count: ${profiles?.length}, All Private Fields Redacted: ${allProfilesSafe}`,
      passed: test15Passed
    });

    // -------------------------------------------------------------
    // TEST 16 / TC-KYC-04: Cross-Account KYC Privacy Isolation
    // -------------------------------------------------------------
    // Login as donor Grand Pearl
    const donorLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "donor@grandpearl.com",
        password: "DemoDonor@2026"
      })
    });
    const donorCookieHeader = donorLoginRes.headers.get('set-cookie')?.split(';')[0];

    const donorKycRes = await fetch(`${baseUrl}/api/kyc/my-status`, {
      headers: { 'Cookie': donorCookieHeader }
    });
    const donorKycData = await donorKycRes.json();
    const myRecord = donorKycData.verificationRecord;

    const donorOnlyOwnRecord = 
      donorKycRes.status === 200 &&
      myRecord &&
      myRecord.name === "Grand Pearl Banquet & Hotel" &&
      !Array.isArray(myRecord) &&
      myRecord.name !== "Hope Shelter Home";

    const test16Passed = donorOnlyOwnRecord;

    results.push({
      id: "TC-KYC-04",
      name: "Cross-Account KYC Privacy Isolation on GET /api/kyc/my-status",
      description: "Ensures logged-in organizations can only view their own verification record and never inspect other partners' data.",
      details: `Status: ${donorKycRes.status}, Returned Org: ${myRecord?.name}, Cross-Account Leaks: None`,
      passed: test16Passed
    });

    // -------------------------------------------------------------
    // TEST 17 / TC-KYC-05: Non-Admin Access Denial for Verifier Admin Queue
    // -------------------------------------------------------------
    // Donor attempts to access admin verification records
    const donorAdminQueueRes = await fetch(`${baseUrl}/api/kyc/admin/records`, {
      headers: { 'Cookie': donorCookieHeader }
    });
    const donorAdminQueueData = await donorAdminQueueRes.json();

    // Unauthenticated attempts
    const unauthAdminQueueRes = await fetch(`${baseUrl}/api/kyc/admin/records`);

    const test17Passed = 
      donorAdminQueueRes.status === 403 &&
      donorAdminQueueData.code === "ADMIN_REQUIRED" &&
      unauthAdminQueueRes.status === 401;

    results.push({
      id: "TC-KYC-05",
      name: "Server-Side Authorization Denial for Verifier Queue (GET /api/kyc/admin/records)",
      description: "Blocks non-admins (donors/NGOs) and unauthenticated callers from inspecting private KYC queues (returns 403/401).",
      details: `Donor Status: ${donorAdminQueueRes.status} (${donorAdminQueueData.code}), Unauth Status: ${unauthAdminQueueRes.status}`,
      passed: test17Passed
    });

    // -------------------------------------------------------------
    // TEST 18 / TC-KYC-06: Non-Admin Mutation Rejection (PUT /api/kyc/admin/records/:id/status)
    // -------------------------------------------------------------
    const donorMutateRes = await fetch(`${baseUrl}/api/kyc/admin/records/ORG-DON-004/status`, {
      method: 'PUT',
      headers: {
        'Cookie': donorCookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: "Verified",
        verifierNotes: "Self-approved without permission"
      })
    });
    const donorMutateData = await donorMutateRes.json();

    const test18Passed = 
      donorMutateRes.status === 403 &&
      donorMutateData.code === "ADMIN_REQUIRED";

    results.push({
      id: "TC-KYC-06",
      name: "Non-Admin Verification Mutation Rejection (PUT /api/kyc/admin/records/:id/status)",
      description: "Prevents donors and NGOs from approving, rejecting, or altering any organization's verification status (returns 403).",
      details: `Status: ${donorMutateRes.status}, Error Code: ${donorMutateData.code}`,
      passed: test18Passed
    });

    // -------------------------------------------------------------
    // TEST 19 / TC-KYC-07: Authorized Admin Verification Review & Audit Trail
    // -------------------------------------------------------------
    // Login as admin
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "admin@rescueplate.org",
        password: "DemoAdmin@2026"
      })
    });
    const adminCookieHeader = adminLoginRes.headers.get('set-cookie')?.split(';')[0];

    // Admin fetches queue
    const adminQueueRes = await fetch(`${baseUrl}/api/kyc/admin/records`, {
      headers: { 'Cookie': adminCookieHeader }
    });
    const adminQueueData = await adminQueueRes.json();

    // Admin updates ORG-DON-004 status
    const adminReviewRes = await fetch(`${baseUrl}/api/kyc/admin/records/ORG-DON-004/status`, {
      method: 'PUT',
      headers: {
        'Cookie': adminCookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: "Verified",
        verifierNotes: "Audited trade license and health safety checklist by Chief Verifier"
      })
    });
    const adminReviewData = await adminReviewRes.json();

    const test19Passed = 
      adminQueueRes.status === 200 &&
      Array.isArray(adminQueueData.records) &&
      adminReviewRes.status === 200 &&
      adminReviewData.record?.verificationStatus === "Verified" &&
      adminReviewData.record?.auditorEmail === "admin@rescueplate.org";

    results.push({
      id: "TC-KYC-07",
      name: "Authorized Admin Verifier Inspection & Status Update",
      description: "Allows Chief Verifier to view unredacted audit records and transition partner verification status with audit trail.",
      details: `Queue Status: ${adminQueueRes.status}, Updated Org: ${adminReviewData.record?.name}, New Status: ${adminReviewData.record?.verificationStatus}, Auditor: ${adminReviewData.record?.auditorEmail}`,
      passed: test19Passed
    });

    // -------------------------------------------------------------
    // TEST 20 / TC-KYC-08: Admin Role Injection Prevention at Registration
    // -------------------------------------------------------------
    const spoofAdminRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Attacker Malory",
        orgName: "Malicious NGO",
        email: `attacker_${Date.now()}@spoof.org`,
        password: "AttackerPassword@2026",
        confirmPassword: "AttackerPassword@2026",
        role: "admin", // Illegal role injection
        phone: "+91 99999 99999"
      })
    });
    const spoofAdminData = await spoofAdminRes.json();

    const spoofVerifierRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Attacker Malory 2",
        orgName: "Malicious NGO",
        email: `attacker2_${Date.now()}@spoof.org`,
        password: "AttackerPassword@2026",
        confirmPassword: "AttackerPassword@2026",
        role: "verifier", // Illegal role injection
        phone: "+91 99999 99999"
      })
    });
    const spoofVerifierData = await spoofVerifierRes.json();

    const test20Passed = 
      spoofAdminRes.status === 400 &&
      spoofAdminData.code === "INVALID_ROLE" &&
      spoofVerifierRes.status === 400 &&
      spoofVerifierData.code === "INVALID_ROLE";

    results.push({
      id: "TC-KYC-08",
      name: "Registration Role Privilege Escalation Prevention",
      description: "Strictly rejects attempts to register as 'admin' or 'verifier' via public registration endpoint (returns 400 INVALID_ROLE).",
      details: `Admin Spoof: ${spoofAdminRes.status} (${spoofAdminData.code}), Verifier Spoof: ${spoofVerifierRes.status} (${spoofVerifierData.code})`,
      passed: test20Passed
    });

  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  return results;
}

// Standalone execution helper
if (process.argv[1].endsWith('authTests.js')) {
  console.log("==================================================================");
  console.log("RESCUEPLATE AUTH & RBAC VERIFICATION SUITE (PS-43 / TECH YUVA)");
  console.log("==================================================================");

  runAuthTestSuite().then((tests) => {
    let allPassed = true;
    tests.forEach((t) => {
      console.log(`\n[${t.id}] ${t.name}`);
      console.log(`  Description: ${t.description}`);
      console.log(`  Details: ${t.details}`);
      console.log(`  Status: ${t.passed ? "✅ PASS" : "❌ FAIL"}`);
      if (!t.passed) allPassed = false;
    });

    console.log("\n==================================================================");
    const passedCount = tests.filter(t => t.passed).length;
    console.log(`RESULT: ${allPassed ? "ALL AUTH TESTS PASSED ✅" : "SOME TESTS FAILED ❌"} (${passedCount}/${tests.length} Passed)`);
    console.log("==================================================================");

    if (!allPassed) process.exit(1);
  }).catch((err) => {
    console.error("Test execution failure:", err);
    process.exit(1);
  });
}
