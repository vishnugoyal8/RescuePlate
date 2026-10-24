import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileCheck2,
  Lock,
  MapPin,
  Info,
  ExternalLink,
  Award,
  Sparkles,
  UserCheck,
  Eye,
  EyeOff,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDonations } from '../../context/DonationContext';

/**
 * Public-Safe Community Trust Directory & Segregated KYC Management (PS-43)
 * 
 * Strict Privacy & RBAC Rules:
 * 1. Community Trust Directory: Public-safe view exposing ONLY approved fields (name, verified badge, aggregate stats).
 *    Private contact phone numbers, personal contacts, registration numbers, and internal audit notes are strictly hidden.
 * 2. My Organization Verification: Allows logged-in Donors and NGOs to inspect their own verification status.
 * 3. Verifier & Admin Console: Gated on the server and UI to authorized compliance administrators only (admin role).
 */
export function VerificationView() {
  const { currentUser, isAuthenticated } = useAuth();
  const { showToast } = useDonations();

  // Active sub-navigation: 'public_trust' | 'my_kyc' | 'verifier_console'
  const [activeSubTab, setActiveSubTab] = useState('public_trust');
  
  // Public Trust Directory State
  const [trustProfiles, setTrustProfiles] = useState([]);
  const [isLoadingTrust, setIsLoadingTrust] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All'); // All | Donor | NGO

  // My KYC Status State
  const [myKycData, setMyKycData] = useState(null);
  const [isLoadingMyKyc, setIsLoadingMyKyc] = useState(false);

  // Admin / Verifier Console State (Admin only)
  const [adminRecords, setAdminRecords] = useState([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // 1. Fetch Public-Safe Trust Profiles
  const loadPublicTrustProfiles = async () => {
    setIsLoadingTrust(true);
    try {
      const res = await fetch('/api/trust/profiles');
      if (res.ok) {
        const data = await res.json();
        setTrustProfiles(data.trustProfiles || []);
      }
    } catch (e) {
      console.warn("Could not fetch server trust profiles:", e);
    } finally {
      setIsLoadingTrust(false);
    }
  };

  // 2. Fetch My Organization's Verification Status (Authenticated User)
  const loadMyKycStatus = async () => {
    if (!isAuthenticated || !currentUser?.orgName) return;
    setIsLoadingMyKyc(true);
    try {
      const res = await fetch('/api/kyc/my-status', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setMyKycData(data.verificationRecord);
      }
    } catch (e) {
      console.warn("Could not fetch self KYC status:", e);
    } finally {
      setIsLoadingMyKyc(false);
    }
  };

  // 3. Fetch Admin Records Queue (Authorized Verifiers Only)
  const loadAdminRecords = async () => {
    if (currentUser?.role !== 'admin') return;
    setIsLoadingAdmin(true);
    try {
      const res = await fetch('/api/kyc/admin/records', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAdminRecords(data.records || []);
      } else if (res.status === 403) {
        showToast("Access Denied: Verifier queue requires administrator privileges.", "error");
      }
    } catch (e) {
      console.warn("Could not fetch admin records:", e);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  useEffect(() => {
    loadPublicTrustProfiles();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyKycStatus();
      if (currentUser?.role === 'admin') {
        loadAdminRecords();
      }
    }
  }, [isAuthenticated, currentUser]);

  // Administrative Review Action: Update Organization Verification Status
  const handleUpdateStatus = async (recordId, newStatus) => {
    if (currentUser?.role !== 'admin') {
      showToast("Access Denied: Only authorized compliance verifiers can update verification status.", "error");
      return;
    }

    setUpdatingId(recordId);
    try {
      const res = await fetch(`/api/kyc/admin/records/${recordId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          newStatus,
          verifierNotes: `Verified by Council Auditor (${currentUser.email}) on ${new Date().toLocaleDateString()}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Updated status for "${data.record.name}" to "${newStatus}"`, "success");
        // Refresh admin records and public trust directory
        loadAdminRecords();
        loadPublicTrustProfiles();
        loadMyKycStatus();
      } else {
        showToast(data.error || "Failed to update verification status.", "error");
      }
    } catch (err) {
      showToast("Network error updating verification status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter public trust profiles
  const filteredTrustProfiles = trustProfiles.filter(profile => {
    const matchesSearch = 
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || profile.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter admin records queue
  const filteredAdminRecords = adminRecords.filter(r => {
    if (adminStatusFilter === 'All') return true;
    return r.verificationStatus === adminStatusFilter;
  });

  return (
    <div className="py-8 space-y-8 animate-fadeIn">
      
      {/* Header & Sub-Navigation */}
      <div className="border-b border-stone-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              <span>Trust & Safety Protocol &bull; PS-43</span>
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
              Community Trust & Verification
            </h1>
            <p className="text-stone-600 mt-1 max-w-2xl text-sm">
              Segregated public trust profiles and role-based verification. Public trust indicators are visible to everyone, while confidential identity documents and audit notes remain strictly restricted.
            </p>
          </div>

          {/* Sub-Tab Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('public_trust')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'public_trust'
                  ? 'bg-white text-forest-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-forest-700" />
              <span>Public Trust Profiles</span>
            </button>

            {isAuthenticated && currentUser?.role !== 'admin' && (
              <button
                onClick={() => setActiveSubTab('my_kyc')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'my_kyc'
                    ? 'bg-white text-forest-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-terracotta-500" />
                <span>My Organization KYC</span>
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveSubTab('verifier_console')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'verifier_console'
                    ? 'bg-forest-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-forest-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Verifier Console ({adminRecords.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Mandatory Hackathon Privacy Notice */}
        <div className="mt-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="leading-relaxed">
            <span className="font-semibold">Simulated Verification Architecture & Privacy Boundaries:</span> All license references (e.g. <span className="font-mono font-medium">DEMO-FSSAI-REG-...</span>, <span className="font-mono font-medium">DEMO-NGO-DARPAN-...</span>) and food safety audit scores shown in this hackathon prototype are simulated demonstration fixtures. RescuePlate <strong>does not collect, scan, or expose real identity documents</strong> (such as Aadhaar, PAN, or commercial lease agreements). In a live deployment, this module interfaces with authorized government digital identity APIs.
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* VIEW 1: PUBLIC-SAFE COMMUNITY TRUST DIRECTORY                 */}
      {/* ============================================================= */}
      {activeSubTab === 'public_trust' && (
        <div className="space-y-6">
          
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified partners by name, type, or locality..."
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 bg-stone-50/50"
              />
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto text-xs">
              <span className="text-stone-400 font-medium">Filter Partner Type:</span>
              <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50">
                {['All', 'Donor', 'NGO'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      categoryFilter === cat 
                        ? 'bg-forest-800 text-white shadow-xs' 
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {cat === 'All' ? 'All Partners' : cat === 'Donor' ? 'Commercial Donors' : 'Recipient NGOs'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy Segregation Disclaimer Banner */}
          <div className="bg-forest-50/60 border border-forest-200/60 rounded-2xl p-4 flex items-center justify-between text-xs text-forest-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
              <span>
                <strong>Public-Safe View:</strong> Displays verified partners and aggregate community impact only. Private phone numbers, internal inspection files, and confidential registration credentials are strictly withheld.
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-forest-700 hidden sm:inline">
              {filteredTrustProfiles.length} Verified Partners
            </span>
          </div>

          {/* Public Trust Cards Grid */}
          {isLoadingTrust ? (
            <div className="py-16 text-center text-xs text-stone-400">Loading verified trust profiles...</div>
          ) : filteredTrustProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrustProfiles.map((partner) => (
                <div 
                  key={partner.id}
                  className="bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-300 transition-all shadow-xs hover:shadow-md p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        partner.category === 'Donor' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                      }`}>
                        {partner.category === 'Donor' ? 'Commercial Donor' : 'Community NGO'}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        {partner.name}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">{partner.type}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{partner.locality}</span>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400">Food Safety Rating:</span>
                        <span className="font-bold text-forest-900">{partner.trustScore || "4.8 / 5.0"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400">Estimated Meals Rescued:</span>
                        <span className="font-bold text-stone-800 font-mono">
                          {partner.totalMealsRescued?.toLocaleString() || "1,200+"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400">Verified Dispatches:</span>
                        <span className="font-bold text-stone-800 font-mono">
                          {partner.completedDispatches || 24}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Partner Since {partner.activeSince || "2025"}</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Tier-1 Trust
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8">
              <Building2 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500">No verified partners match your search criteria.</p>
            </div>
          )}

        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 2: MY ORGANIZATION'S OWN KYC STATUS                      */}
      {/* ============================================================= */}
      {activeSubTab === 'my_kyc' && isAuthenticated && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Your Organization Verification Record
                </span>
                <h2 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
                  {currentUser.orgName}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Logged in as {currentUser.fullName} ({currentUser.role === 'donor' ? 'Food Donor' : 'Recipient NGO'})
                </p>
              </div>

              <div>
                {currentUser.verificationStatus === 'Verified' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Partner
                  </span>
                ) : currentUser.verificationStatus === 'Pending Review' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Pending Review
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Audit Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Verification Metadata */}
            <div className="space-y-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-100 text-stone-700">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Demo Registration ID:</span>
                <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                  {myKycData?.simulatedRegistrationId || currentUser.simulatedRegistrationId || "DEMO-FSSAI-REG-NEW"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Registered Locality:</span>
                <span className="font-semibold text-stone-900">{myKycData?.locality || currentUser.locality || "Delhi NCR"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Platform Permissions:</span>
                <span className="font-semibold text-forest-800">
                  {currentUser.verificationStatus === 'Verified' 
                    ? currentUser.role === 'donor' ? 'Allowed to broadcast food donations' : 'Allowed to claim & dispatch donations'
                    : 'Gated: Awaiting compliance sign-off'}
                </span>
              </div>
            </div>

            {/* Verification Notes / Guidance */}
            <div className="p-4 rounded-2xl border text-xs leading-relaxed space-y-2 bg-stone-50/70 border-stone-200">
              <span className="font-bold text-stone-800 block">Compliance Audit Status:</span>
              <p className="text-stone-600">
                {myKycData?.complianceNotes || (currentUser.verificationStatus === 'Verified' 
                  ? "Your organization credentials and food safety hygiene inspection have been approved by the RescuePlate Trust Council." 
                  : "Your simulated credentials are currently in the compliance review queue. Once signed off by an authorized verifier, broadcast and claim permissions will unlock automatically.")}
              </p>
            </div>

            <div className="text-[11px] text-stone-400 italic">
              🔒 Privacy Guarantee: Only authorized compliance verifiers have access to your organization's internal inspection documents and audit history.
            </div>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 3: VERIFIER & ADMIN CONSOLE (AUTHORIZED ADMINS ONLY)    */}
      {/* ============================================================= */}
      {activeSubTab === 'verifier_console' && (
        currentUser?.role === 'admin' ? (
          <div className="space-y-6">
            
            {/* Admin Header */}
            <div className="bg-forest-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-terracotta-400">
                  Compliance Council Internal Tool
                </span>
                <h2 className="text-2xl font-bold font-serif mt-1">
                  KYC Verifier & Audit Console
                </h2>
                <p className="text-xs text-forest-200 mt-0.5">
                  Authorized Verifier: <strong>{currentUser.email}</strong> &bull; Inspect sensitive licenses and authorize organizations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadAdminRecords}
                  className="px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Filter Queue:</span>
              {['All', 'Pending Review', 'Verified', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setAdminStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    adminStatusFilter === status
                      ? 'bg-forest-800 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Admin Verification Records Queue */}
            {isLoadingAdmin ? (
              <div className="py-12 text-center text-xs text-stone-400">Loading verifier records...</div>
            ) : (
              <div className="space-y-4">
                {filteredAdminRecords.map((org) => {
                  const isVerified = org.verificationStatus === 'Verified';
                  const isPending = org.verificationStatus === 'Pending Review';
                  const isRejected = org.verificationStatus === 'Rejected';

                  return (
                    <div 
                      key={org.id}
                      className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            {org.id}
                          </span>
                          <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                            org.category === 'Donor' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {org.category}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isVerified ? 'bg-emerald-100 text-emerald-800' :
                            isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {org.verificationStatus}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-stone-900">{org.name}</h3>
                          <p className="text-xs text-stone-500">{org.type} &bull; {org.locality}</p>
                        </div>

                        {/* Sensitive Fields (Only Visible to Admin) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                          <div>
                            <span className="text-stone-400">Demo License ID: </span>
                            <span className="font-mono font-bold text-stone-800">{org.simulatedRegistrationId}</span>
                          </div>
                          <div>
                            <span className="text-stone-400">Contact Person: </span>
                            <span className="font-semibold text-stone-800">{org.contactPerson} ({org.phone})</span>
                          </div>
                        </div>

                        <div className="text-xs text-stone-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                          <span className="font-bold text-stone-800">Compliance Audit Notes: </span>
                          {org.complianceNotes}
                        </div>
                      </div>

                      {/* Verifier Review Actions */}
                      <div className="lg:w-64 flex flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-stone-100 pt-4 lg:pt-0 lg:pl-6">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                          Verifier Actions:
                        </span>
                        
                        <button
                          disabled={updatingId === org.id || isVerified}
                          onClick={() => handleUpdateStatus(org.id, 'Verified')}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            isVerified 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed opacity-80'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isVerified ? 'Currently Verified' : 'Approve & Verify'}</span>
                        </button>

                        <button
                          disabled={updatingId === org.id || isPending}
                          onClick={() => handleUpdateStatus(org.id, 'Pending Review')}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            isPending 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed opacity-80'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isPending ? 'In Pending Queue' : 'Set to Pending'}</span>
                        </button>

                        <button
                          disabled={updatingId === org.id || isRejected}
                          onClick={() => handleUpdateStatus(org.id, 'Rejected')}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            isRejected 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed opacity-80'
                              : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isRejected ? 'Currently Rejected' : 'Reject with Reason'}</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center max-w-lg mx-auto">
            <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900">Administrative Access Required</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Only authorized compliance verifier accounts can view full organization registration documents and review queue actions.
            </p>
          </div>
        )
      )}

    </div>
  );
}
