/**
 * Organization Profiles and Simulated Verification (KYC) Data (PS-43)
 * 
 * IMPORTANT HACKATHON COMPLIANCE:
 * - All verification records, licenses, and inspection scores are simulated demo data.
 * - RescuePlate does not collect or store actual government identity cards, Aadhaar, PAN, or confidential documents.
 * - Real KYC in production requires an authorized verification provider and secure backend infrastructure.
 */

export const INITIAL_ORG_PROFILES = [
  // 1. Hotel / Commercial Donor Organizations
  {
    id: "ORG-DON-001",
    name: "Royal Spoon Banquets",
    type: "Commercial Kitchen & Catering",
    category: "Donor",
    verificationStatus: "Verified", // Verified | Pending Review | Rejected
    simulatedRegistrationId: "DEMO-FSSAI-REG-9821A",
    verifiedAt: "2026-08-15T10:00:00.000Z",
    hygieneRating: "4.8 / 5.0 (Simulated)",
    contactPerson: "Rajesh Sharma (Catering Lead)",
    phone: "+91 98101 23456",
    locality: "Sector 18, Noida",
    complianceNotes: "Simulated hygiene inspection passed. Commercial food-handling certificate verified."
  },
  {
    id: "ORG-DON-002",
    name: "Grand Pearl Banquet & Hotel",
    type: "Hotel & Banquet Operations",
    category: "Donor",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-FSSAI-REG-4412B",
    verifiedAt: "2026-09-01T12:00:00.000Z",
    hygieneRating: "4.9 / 5.0 (Simulated)",
    contactPerson: "Chef Vikram Sethi",
    phone: "+91 98112 88990",
    locality: "Indirapuram, Ghaziabad",
    complianceNotes: "Simulated commercial hotel license verified. Temperature-controlled prep facility."
  },
  {
    id: "ORG-DON-003",
    name: "Crust & Crumb Bakery",
    type: "Artisan Bakery & Cafe",
    category: "Donor",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-FSSAI-REG-3190C",
    verifiedAt: "2026-09-10T14:30:00.000Z",
    hygieneRating: "4.7 / 5.0 (Simulated)",
    contactPerson: "Ananya Deshmukh",
    phone: "+91 98712 34567",
    locality: "Connaught Place, New Delhi",
    complianceNotes: "Simulated daily bake health check verified."
  },
  {
    id: "ORG-DON-004",
    name: "Saffron Heritage Banquets",
    type: "Banquets & Event Hospitality",
    category: "Donor",
    verificationStatus: "Pending Review",
    simulatedRegistrationId: "DEMO-FSSAI-REG-7721D",
    verifiedAt: null,
    hygieneRating: "Under Audit",
    contactPerson: "Virender Chawla",
    phone: "+91 98100 55443",
    locality: "Saket, South Delhi",
    complianceNotes: "Documents submitted for demo audit. Awaiting simulated kitchen hygiene sign-off."
  },
  {
    id: "ORG-DON-005",
    name: "Midnight Express Quick Bites",
    type: "Takeaway Cloud Kitchen",
    category: "Donor",
    verificationStatus: "Rejected",
    simulatedRegistrationId: "DEMO-FSSAI-REG-0089E",
    verifiedAt: null,
    hygieneRating: "Failed (Simulated)",
    contactPerson: "Kunal Mehra",
    phone: "+91 98990 11223",
    locality: "Karol Bagh, New Delhi",
    complianceNotes: "Simulated rejection: Lacks certified insulated hot storage equipment for cooked buffet food."
  },

  // 2. Recipient Community NGO Organizations
  {
    id: "ORG-NGO-001",
    name: "Asha Ek Kadam Shelter Home",
    type: "Community Shelter & Night Home",
    category: "NGO",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-DARPAN-NGO-5512",
    verifiedAt: "2026-07-20T11:00:00.000Z",
    hygieneRating: "5.0 / 5.0 (Simulated)",
    contactPerson: "Sister Mary & Volunteers",
    phone: "+91 98110 44332",
    locality: "Lajpat Nagar IV, South Delhi",
    complianceNotes: "NGO Darpan verified (simulated). Equipped with walk-in refrigeration units."
  },
  {
    id: "ORG-NGO-002",
    name: "Pratham Children Nutrition Foundation",
    type: "Child Welfare & Daily Feeding",
    category: "NGO",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-DARPAN-NGO-3398",
    verifiedAt: "2026-08-01T09:30:00.000Z",
    hygieneRating: "4.8 / 5.0 (Simulated)",
    contactPerson: "Dr. Alok Verma",
    phone: "+91 98110 55667",
    locality: "Indirapuram, Ghaziabad",
    complianceNotes: "Simulated childcare feeding license verified. Insulated delivery vans operational."
  },
  {
    id: "ORG-NGO-003",
    name: "Robin Hood Army - Central Delhi Chapter",
    type: "Volunteer Distribution Network",
    category: "NGO",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-DARPAN-NGO-8821",
    verifiedAt: "2026-06-15T15:00:00.000Z",
    hygieneRating: "4.9 / 5.0 (Simulated)",
    contactPerson: "Student Logistics Lead",
    phone: "+91 94480 11223",
    locality: "Connaught Place, New Delhi",
    complianceNotes: "Volunteer roster verified (simulated). Cold storage disclaimer active."
  },
  {
    id: "ORG-NGO-004",
    name: "Annapurna Dry Staples & Grain Bank",
    type: "Food Bank & Dry Rations Pantry",
    category: "NGO",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-DARPAN-NGO-4471",
    verifiedAt: "2026-07-05T10:00:00.000Z",
    hygieneRating: "4.6 / 5.0 (Simulated)",
    contactPerson: "Pt. Ramprasad",
    phone: "+91 98112 33445",
    locality: "Sector 14, Rohini",
    complianceNotes: "Dry storage pantry verified (simulated). Strictly dry goods only."
  },
  {
    id: "ORG-NGO-005",
    name: "Hope Independent Youth Shelter",
    type: "Community Youth Home",
    category: "NGO",
    verificationStatus: "Pending Review",
    simulatedRegistrationId: "DEMO-DARPAN-NGO-1092",
    verifiedAt: null,
    hygieneRating: "Under Audit",
    contactPerson: "Suresh Pillai",
    phone: "+91 98770 66554",
    locality: "Okhla Phase 1",
    complianceNotes: "Simulated registration audit pending. Cold chain inspection scheduled."
  }
];
