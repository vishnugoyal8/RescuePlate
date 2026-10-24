import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Sparkles, 
  HeartHandshake, 
  Phone,
  ShieldCheck,
  Info,
  Layers,
  HelpCircle,
  AlertOctagon,
  ChevronRight,
  TestTube2,
  Truck
} from 'lucide-react';
import { useDonations } from '../../context/DonationContext';
import { useAuth } from '../../context/AuthContext';
import { UrgencyBadge, SampleDataTag, StatusBadge } from '../common/Badge';
import { rankDonationsForNgo } from '../../utils/matchingEngine';
import { MatchScoreBadge } from '../matching/MatchScoreBadge';
import { MatchExplanationModal } from '../matching/MatchExplanationModal';
import { TestScenariosModal } from '../matching/TestScenariosModal';

export function NgoDashboard({ setActiveTab }) {
  const { donations, activeNgo, setActiveNgo, ngoProfiles, claimDonation, updateStatus } = useDonations();
  const { currentUser } = useAuth();

  // Active Tab within NGO portal: 'eligible' or 'excluded'
  const [viewTab, setViewTab] = useState('eligible');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState(null);
  const [selectedDonationForClaim, setSelectedDonationForClaim] = useState(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Run explainable matching engine on all donations against active NGO
  const { rankedEligible, excluded } = rankDonationsForNgo(donations, activeNgo);

  // Filter ranked eligible matches
  const filteredEligible = rankedEligible.filter(({ donation }) => {
    const matchesUrgency = urgencyFilter === 'ALL' || donation.urgency === urgencyFilter;
    const matchesCategory = categoryFilter === 'ALL' || donation.category === categoryFilter;
    const matchesSearch = 
      donation.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesUrgency && matchesCategory && matchesSearch;
  });

  // Filter excluded list
  const filteredExcluded = excluded.filter(({ donation }) => {
    return (
      donation.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Claimed donations assigned to this active NGO or current user's NGO organization
  const myClaimedDonations = donations.filter(d => 
    d.claimedBy && (
      d.claimedBy.toLowerCase() === activeNgo.name.toLowerCase() ||
      (currentUser?.orgName && d.claimedBy.toLowerCase() === currentUser.orgName.toLowerCase())
    )
  );

  const handleOpenClaim = (donation) => {
    setSelectedDonationForClaim(donation);
  };

  const handleConfirmClaim = () => {
    if (!selectedDonationForClaim) return;
    claimDonation(selectedDonationForClaim.id, activeNgo.name);
    setSelectedDonationForClaim(null);
    setViewTab('my_pickups');
  };

  const formatDeadline = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Top Banner: Smart Matching & Active NGO Profile Switcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
        
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                NGO Smart Matching Portal
              </h1>
              <span className="bg-forest-100 text-forest-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-forest-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" />
                <span>Explainable Algorithm (PS-43)</span>
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Surplus donations ranked by distance, remaining capacity, spoilage urgency, and storage requirements.
            </p>
          </div>

          {/* Quick Test Suite Launcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-300/80 transition-all active:scale-98"
            >
              <TestTube2 className="w-4 h-4 text-forest-700" />
              <span>Verify Test Suite (6 Scenarios)</span>
            </button>
          </div>
        </div>

        {/* Profile Switcher Card */}
        <div className="bg-canvas-subtle p-5 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-forest-700" />
              <span>Select Active NGO Profile:</span>
            </span>
            <span className="text-[11px] text-stone-400">
              Switch profiles to see how rankings and eligibility dynamically change
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ngoProfiles.map((profile) => {
              const isSelected = activeNgo?.id === profile.id;
              return (
                <button
                  key={profile.id}
                  onClick={() => setActiveNgo(profile)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-white border-forest-600 ring-2 ring-forest-600/20 shadow-xs'
                      : 'bg-white/60 hover:bg-white border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 line-clamp-1">{profile.name}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-forest-600"></span>}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                    Cap: <strong>{profile.currentAvailableCapacityMeals} meals</strong> &bull; Rad: {profile.maxRadiusKm} km
                  </div>
                  <div className="text-[10px] text-forest-800 font-semibold mt-1">
                    {profile.storageEquipment.includes('Refrigerated (4°C)') ? '❄️ Cold Chain' : '📦 Ambient/Hot only'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Profile Constraints Pill */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-stone-600 border-t border-stone-200/60">
            <div>
              <span className="text-stone-400">Active HQ:</span> <strong className="text-stone-800">{activeNgo.address}</strong>
            </div>
            <div>
              <span className="text-stone-400">Intake Capacity:</span> <strong className="text-forest-800">{activeNgo.currentAvailableCapacityMeals} meals ({activeNgo.currentAvailableCapacityKg} kg)</strong>
            </div>
            <div>
              <span className="text-stone-400">Accepted:</span> <strong className="text-stone-800">{activeNgo.acceptedCategories.join(', ')}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* View Switcher: Ranked Matches vs Ineligible Items */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="inline-flex p-1 bg-stone-200/70 rounded-2xl">
          <button
            onClick={() => setViewTab('eligible')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === 'eligible'
                ? 'bg-white text-forest-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Ranked Smart Matches ({rankedEligible.length})</span>
          </button>

          <button
            onClick={() => setViewTab('my_pickups')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === 'my_pickups'
                ? 'bg-white text-forest-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-forest-700" />
            <span>My Pickups & Deliveries ({myClaimedDonations.length})</span>
          </button>

          <button
            onClick={() => setViewTab('excluded')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === 'excluded'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-stone-500" />
            <span>Excluded / Ineligible Items ({excluded.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food item or locality..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-700 bg-white"
          />
        </div>

      </div>

      {/* -------------------------------------------------------- */}
      {/* VIEW A: RANKED SMART MATCHES (HIGHEST COMPATIBILITY FIRST) */}
      {/* -------------------------------------------------------- */}
      {viewTab === 'eligible' && (
        <div className="space-y-6">
          
          {/* Urgency Filter Bar */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Filter Urgency:</span>
            {['ALL', 'High', 'Moderate', 'Normal'].map((urg) => (
              <button
                key={urg}
                onClick={() => setUrgencyFilter(urg)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  urgencyFilter === urg
                    ? urg === 'High' ? 'bg-terracotta-600 text-white' : 'bg-forest-800 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {urg === 'High' ? '🚨 High (<3h)' : urg}
              </button>
            ))}
          </div>

          {filteredEligible.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEligible.map((matchItem) => {
                const { donation, score, reasons, details } = matchItem;

                return (
                  <div
                    key={donation.id}
                    className={`bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                      score >= 85 ? 'border-forest-400 ring-1 ring-forest-200' : 'border-stone-200/90'
                    }`}
                  >
                    <div className="p-6 space-y-4">
                      
                      {/* Top Row: Match Score Badge + Spoilage Urgency */}
                      <div className="flex items-center justify-between gap-2">
                        <MatchScoreBadge score={score} isEligible={true} />
                        <div className="flex items-center gap-1.5">
                          {donation.isSample && <SampleDataTag />}
                          <UrgencyBadge urgency={donation.urgency} size="sm" />
                        </div>
                      </div>

                      {/* Food Name & Category */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
                            {donation.category}
                          </span>
                          <span className="font-mono text-[11px] text-stone-400">#{donation.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mt-0.5 line-clamp-2">
                          {donation.foodName}
                        </h3>
                        {donation.donorOrg && (
                          <p className="text-xs text-stone-500 font-medium mt-0.5">
                            Offered by {donation.donorOrg}
                          </p>
                        )}
                      </div>

                      {/* Quantity & Storage Pill */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <div className="bg-forest-50 text-forest-900 font-bold px-3 py-1 rounded-lg border border-forest-200/80">
                          {donation.quantity} {donation.unit} &bull; ~{donation.estimatedWeightKg} kg
                        </div>
                        <div className="bg-stone-100 text-stone-700 font-medium px-2.5 py-1 rounded-lg">
                          {donation.storageCondition}
                        </div>
                      </div>

                      {/* Distance & Transit Transparency Pill */}
                      <div className="bg-canvas-subtle p-3 rounded-xl border border-stone-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between text-stone-700 font-semibold">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-forest-700" />
                            <span>~{details?.distanceKm} km distance</span>
                          </span>
                          <span className="text-[11px] text-stone-500">
                            ~{details?.transitMinutes}m transit window
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400">
                          *Simulated demo distance calculated via Haversine
                        </p>
                      </div>

                      {/* Explainable Match Reasons (3 highlights) */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-forest-800">
                          Why this matched your profile:
                        </div>
                        <div className="space-y-1 text-xs">
                          {reasons.slice(0, 3).map((reason, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-stone-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1" dangerouslySetInnerHTML={{ __html: reason }} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pickup Address & Cutoff */}
                      <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1 text-stone-800 font-medium">{donation.pickupAddress}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-terracotta-500 flex-shrink-0" />
                          <span>
                            Cutoff: <strong className="text-stone-900">{formatDeadline(donation.collectionDeadline)}</strong>
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 bg-canvas-subtle/50 border-t border-stone-100 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMatchForDetails(matchItem)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/70 border border-stone-200 transition-colors"
                        title="View explainable formula breakdown"
                      >
                        Explain Score
                      </button>

                      <button
                        onClick={() => handleOpenClaim(donation)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold py-2 px-3 rounded-xl shadow-xs text-xs transition-all active:scale-98"
                      >
                        <HeartHandshake className="w-4 h-4" />
                        <span>Claim for {activeNgo.name.split(' ')[0]}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State for Eligible Matches */
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-800">No Suitable Matches for Active NGO</h3>
                <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                  None of the available food donations fit <strong>{activeNgo.name}</strong>'s current capacity ({activeNgo.currentAvailableCapacityMeals} meals), operational radius ({activeNgo.maxRadiusKm} km), or storage capabilities.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => setViewTab('excluded')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Inspect Filtered / Excluded Items ({excluded.length})
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* VIEW B: EXCLUDED / INELIGIBLE DONATIONS (AUDIT TRANSPARENCY) */}
      {/* -------------------------------------------------------- */}
      {viewTab === 'excluded' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-start gap-3">
            <Info className="w-5 h-5 text-stone-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900">Constraint Elimination Ledger:</span>
              <p className="mt-0.5 leading-relaxed">
                To guarantee recipient safety and reliable logistics, RescuePlate disqualifies items that are expired, already fulfilled, exceed NGO capacity, or have unreachable courier transit windows.
              </p>
            </div>
          </div>

          {filteredExcluded.length > 0 ? (
            <div className="space-y-4">
              {filteredExcluded.map((matchItem) => {
                const { donation, exclusionReasons, details } = matchItem;

                return (
                  <div
                    key={donation.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-400">#{donation.id}</span>
                          <StatusBadge status={donation.status} size="sm" />
                          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                            {donation.category}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-stone-900 mt-1">
                          {donation.foodName}
                        </h4>
                      </div>

                      <div className="text-xs text-stone-500">
                        <span>Quantity: <strong>{donation.quantity} {donation.unit}</strong></span>
                      </div>
                    </div>

                    {/* Exclusion Explanation Banner */}
                    <div className="bg-red-50/80 p-3 rounded-xl border border-red-200 text-xs text-red-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-red-800">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                        <span>Why this is ineligible for {activeNgo.name}:</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5 font-medium">
                        {exclusionReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                      <span>Pickup: {donation.pickupAddress}</span>
                      <button
                        onClick={() => setSelectedMatchForDetails(matchItem)}
                        className="text-stone-700 font-semibold underline hover:text-stone-900"
                      >
                        Inspect Full Audit
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 max-w-lg mx-auto">
              <h3 className="text-base font-bold text-stone-800">No Excluded Donations</h3>
              <p className="text-xs text-stone-500 mt-1">
                All current donations are fully eligible for this NGO profile.
              </p>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* VIEW C: MY ACCEPTED PICKUPS & DELIVERIES (CONSOLIDATED)   */}
      {/* -------------------------------------------------------- */}
      {viewTab === 'my_pickups' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex items-start gap-3">
            <Truck className="w-5 h-5 text-forest-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-forest-950">Active Pickup & Delivery Management:</span>
              <p className="mt-0.5 leading-relaxed text-forest-800">
                Track all surplus donations accepted by <strong>{activeNgo.name}</strong>. Confirm courier pickup when in transit, and log intake verification upon safe arrival at your shelter or kitchen.
              </p>
            </div>
          </div>

          {myClaimedDonations.length > 0 ? (
            <div className="space-y-6">
              {myClaimedDonations.map((donation) => {
                const getStepIdx = (status) => {
                  switch (status) {
                    case 'Available': return 0;
                    case 'Claimed': return 1;
                    case 'Picked Up': return 2;
                    case 'Delivered': return 3;
                    default: return 1;
                  }
                };
                const stepIdx = getStepIdx(donation.status);

                return (
                  <div
                    key={donation.id}
                    className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-5"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded">
                            #{donation.id}
                          </span>
                          <StatusBadge status={donation.status} />
                          <span className="text-xs font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded border border-terracotta-100">
                            {donation.category}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
                          {donation.foodName}
                        </h3>
                        <p className="text-xs text-stone-500 font-medium">
                          Donor: <strong>{donation.donorOrg}</strong>
                        </p>
                      </div>

                      <div className="text-left sm:text-right text-xs text-stone-500">
                        <span className="block font-bold text-stone-900 text-sm">
                          {donation.quantity} {donation.unit} (~{donation.estimatedWeightKg} kg)
                        </span>
                        <span>Pickup Cutoff: <strong>{formatDeadline(donation.collectionDeadline)}</strong></span>
                      </div>
                    </div>

                    {/* Stepper Progress */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[
                        { label: 'Available', desc: 'Broadcast' },
                        { label: 'Claimed', desc: 'Reserved' },
                        { label: 'Picked Up', desc: 'In Transit' },
                        { label: 'Delivered', desc: 'Intake Confirmed' }
                      ].map((st, idx) => {
                        const isDone = idx < stepIdx;
                        const isCurr = idx === stepIdx;

                        return (
                          <div key={st.label} className="space-y-1.5">
                            <div className={`h-2 rounded-full transition-all ${
                              isDone || isCurr
                                ? donation.status === 'Delivered' ? 'bg-forest-700' : 'bg-terracotta-500'
                                : 'bg-stone-200'
                            }`} />
                            <div className="text-[11px] font-bold text-stone-800 hidden sm:block">
                              {st.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pickup Details & Logistics Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-canvas-subtle border border-stone-200 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                          <span><strong>Pickup Locality:</strong> {donation.pickupAddress}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span><strong>Donor Contact:</strong> {donation.contactName} ({donation.contactPhone})</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div><strong>Storage Condition:</strong> {donation.storageCondition}</div>
                        <div><strong>Claimed At:</strong> {donation.claimedAt ? new Date(donation.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}</div>
                      </div>
                    </div>

                    {/* Pending Action Buttons for NGO */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-stone-500">
                        Status Phase: <strong className="text-forest-800">{donation.status}</strong>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {donation.status === 'Claimed' && (
                          <button
                            onClick={() => updateStatus(donation.id, 'Picked Up')}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Confirm Courier Picked Up</span>
                          </button>
                        )}

                        {donation.status === 'Picked Up' && (
                          <button
                            onClick={() => updateStatus(donation.id, 'Delivered')}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-white shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-terracotta-400" />
                            <span>Confirm Safe Delivery</span>
                          </button>
                        )}

                        {donation.status === 'Delivered' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Intake Verified Complete</span>
                          </span>
                        )}

                        <button
                          onClick={() => setActiveTab('traceability')}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
                        >
                          Inspect Trace Pass &rarr;
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 max-w-lg mx-auto space-y-3">
              <Truck className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">No Accepted Pickups Yet</h3>
              <p className="text-xs text-stone-500">
                Claim available donations from the Ranked Smart Matches tab to schedule courier pickup and confirm intake delivery.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setViewTab('eligible')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-white shadow-xs"
                >
                  Browse Eligible Matches
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* CLAIM CONFIRMATION MODAL (RACE-CONDITION & DOUBLE-CLAIM SAFE) */}
      {/* -------------------------------------------------------- */}
      {selectedDonationForClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-forest-900 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Confirm Exclusive Claim</h3>
                  <p className="text-xs text-forest-200">RescuePlate &bull; Allocation Lock</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-canvas-subtle border border-stone-200 text-xs space-y-1.5">
                <div className="font-bold text-stone-900 text-sm">
                  {selectedDonationForClaim.foodName}
                </div>
                <div className="text-stone-600 flex items-center gap-2">
                  <span>Batch: <strong>{selectedDonationForClaim.quantity} {selectedDonationForClaim.unit}</strong></span>
                  <span>&bull;</span>
                  <span>Cutoff: <strong>{formatDeadline(selectedDonationForClaim.collectionDeadline)}</strong></span>
                </div>
                <div className="text-stone-500 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-stone-400" />
                  <span>{selectedDonationForClaim.pickupAddress}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-900 space-y-1">
                <p className="font-bold">Claiming as: {activeNgo.name}</p>
                <p className="text-forest-700">
                  This batch will be locked immediately and removed from other NGOs' radar.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDonationForClaim(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClaim}
                  className="inline-flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Lock Allocation</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Explainable Match Breakdown Modal */}
      <MatchExplanationModal
        matchResult={selectedMatchForDetails}
        onClose={() => setSelectedMatchForDetails(null)}
      />

      {/* Test Scenarios Verification Modal */}
      <TestScenariosModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

    </div>
  );
}
