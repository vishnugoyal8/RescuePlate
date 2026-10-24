import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  User, 
  Utensils, 
  AlertCircle,
  PackageOpen,
  ArrowRight,
  Sparkles,
  Phone,
  Building2,
  ChevronDown,
  CheckCircle2,
  Award,
  Leaf,
  LayoutDashboard,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { useDonations } from '../../context/DonationContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, UrgencyBadge, SampleDataTag } from '../common/Badge';
import { StatsCard } from '../common/StatsCard';
import { rankNgosForDonation } from '../../utils/matchingEngine';
import { MatchScoreBadge } from '../matching/MatchScoreBadge';
import { DonorImpactSection } from './DonorImpactSection';
import { DonorValueProposition } from './DonorValueProposition';

export function DonorDashboard({ onOpenDonationModal, setActiveTab }) {
  const { donations, ngoProfiles, updateStatus } = useDonations();
  const { currentUser } = useAuth();
  const [donorSubTab, setDonorSubTab] = useState('listings'); // 'listings' | 'impact' | 'benefits'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMatchesId, setExpandedMatchesId] = useState(null);

  // Calculate donor statistics
  const totalDonations = donations.length;
  const activeAvailable = donations.filter(d => d.status === 'Available').length;
  const inProgress = donations.filter(d => d.status === 'Claimed' || d.status === 'Picked Up').length;
  const completed = donations.filter(d => d.status === 'Delivered').length;

  // Filter donations
  const filteredDonations = donations.filter((item) => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = 
      item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.donorOrg && item.donorOrg.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

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
      
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Donor Management Hub
            </h1>
            <span className="bg-forest-100 text-forest-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-forest-200">
              Kitchen & Caterer Portal
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Manage surplus listings, inspect live verification status, and log community pickups.
          </p>
        </div>

        <button
          onClick={onOpenDonationModal}
          className="inline-flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-98"
        >
          <PlusCircle className="w-4 h-4 text-terracotta-400" />
          <span>Post New Donation</span>
        </button>
      </div>

      {/* Subnavigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-3">
        <div className="inline-flex p-1 bg-stone-200/70 rounded-2xl overflow-x-auto max-w-full">
          <button
            onClick={() => setDonorSubTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              donorSubTab === 'listings'
                ? 'bg-white text-forest-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Surplus Listings ({totalDonations})</span>
          </button>

          <button
            onClick={() => setDonorSubTab('impact')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              donorSubTab === 'impact'
                ? 'bg-white text-forest-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-forest-700" />
            <span>Verified Impact & Partner Badge</span>
          </button>

          <button
            onClick={() => setDonorSubTab('benefits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              donorSubTab === 'benefits'
                ? 'bg-white text-forest-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Restaurant Value Proposition</span>
          </button>
        </div>

        {/* Quick status pill */}
        <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-forest-700" />
          <span>Demo Verification Standard</span>
        </div>
      </div>

      {donorSubTab === 'impact' && (
        <DonorImpactSection 
          setActiveTab={setActiveTab} 
          onOpenDonationModal={onOpenDonationModal} 
        />
      )}

      {donorSubTab === 'benefits' && (
        <DonorValueProposition 
          onOpenDonationModal={onOpenDonationModal} 
        />
      )}

      {donorSubTab === 'listings' && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Total Batches"
              value={totalDonations}
              subtitle="All recorded food dispatches"
              accent="forest"
            />
            <StatsCard 
              title="Awaiting NGO Claim"
              value={activeAvailable}
              subtitle="Active on community radar"
              accent="amber"
            />
            <StatsCard 
              title="In Transit / Claimed"
              value={inProgress}
              subtitle="NGO dispatched for pickup"
              accent="terracotta"
            />
            <StatsCard 
              title="Successfully Delivered"
              value={completed}
              subtitle="Safe community consumption"
              accent="forest"
            />
          </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by food name, location, category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-700"
          />
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-stone-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['ALL', 'Available', 'Claimed', 'Picked Up', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Donation Cards Grid */}
      {filteredDonations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                
                {/* Header row: Status badge + urgency/sample */}
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={item.status} />
                  <div className="flex items-center gap-1.5">
                    {item.isSample && <SampleDataTag />}
                    <UrgencyBadge urgency={item.urgency} size="sm" />
                  </div>
                </div>

                {/* Food Name & Category */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
                    {item.category}
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-forest-800 transition-colors mt-0.5 line-clamp-2">
                    {item.foodName}
                  </h3>
                  {item.donorOrg && (
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      By {item.donorOrg}
                    </p>
                  )}
                </div>

                {/* Details Pills: Quantity & Storage */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="bg-forest-50 text-forest-900 font-semibold px-2.5 py-1 rounded-lg border border-forest-200/60">
                    {item.quantity} {item.unit} ({item.estimatedWeightKg} kg est.)
                  </div>
                  <div className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-medium">
                    {item.storageCondition}
                  </div>
                </div>

                {/* Address & Deadline Details */}
                <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.pickupAddress}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    <span>
                      Cutoff: <strong className="text-stone-800">{formatDeadline(item.collectionDeadline)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    <span>Contact: {item.contactName}</span>
                  </div>

                  {item.claimedBy && (
                    <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 text-amber-900 mt-2">
                      <p className="font-semibold text-[11px]">Claimed by Verified Partner:</p>
                      <p className="text-xs font-bold text-stone-900 mt-0.5">{item.claimedBy}</p>
                    </div>
                  )}

                  {/* Ranked Eligible NGOs for this donation (Requirement 3) */}
                  {item.status === 'Available' && (() => {
                    const rankedNgos = rankNgosForDonation(item, ngoProfiles);
                    const isExpanded = expandedMatchesId === item.id;

                    return (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setExpandedMatchesId(isExpanded ? null : item.id)}
                          className="w-full text-left p-2.5 rounded-xl bg-forest-50/80 hover:bg-forest-100/80 border border-forest-200/70 transition-colors flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-forest-900">
                            <Sparkles className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" />
                            <span>Matched NGOs ({rankedNgos.length} Eligible)</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-forest-700">
                            {rankedNgos.length > 0 ? (
                              <span>Top: {rankedNgos[0].ngo.name.split(' ')[0]} ({rankedNgos[0].score}%)</span>
                            ) : (
                              <span>No eligible matches</span>
                            )}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-3 bg-canvas-subtle rounded-xl border border-stone-200 space-y-2 text-xs">
                            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                              Ranked Eligible NGOs:
                            </div>
                            {rankedNgos.length > 0 ? (
                              rankedNgos.map(({ ngo, score, reasons, details }) => (
                                <div key={ngo.id} className="p-2 rounded-lg bg-white border border-stone-200/80 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-stone-900">{ngo.name}</span>
                                    <MatchScoreBadge score={score} size="sm" />
                                  </div>
                                  <div className="text-[11px] text-stone-500">
                                    ~{details?.distanceKm} km away &bull; Open Cap: {ngo.currentAvailableCapacityMeals} meals
                                  </div>
                                  <div className="space-y-0.5 pt-0.5 text-[11px] text-forest-800">
                                    {reasons.slice(0, 3).map((r, idx) => (
                                      <div key={idx} className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-forest-600 flex-shrink-0" />
                                        <span className="line-clamp-1" dangerouslySetInnerHTML={{ __html: r }} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-stone-500 italic">
                                No registered NGOs currently meet the distance, capacity, or storage requirements for this donation.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Pending Handover Action for Donors (Ownership Protected) */}
                {item.status === 'Claimed' && (() => {
                  const isOwner = !currentUser?.orgName || item.donorOrg.toLowerCase() === currentUser.orgName.toLowerCase();

                  return (
                    <div className="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-sky-950 block">Courier Pickup Pending</span>
                        <span className="text-sky-800 text-[11px]">
                          Reserved by <strong>{item.claimedBy}</strong>. Confirm handoff when the courier arrives.
                        </span>
                      </div>
                      {isOwner ? (
                        <button
                          onClick={() => updateStatus(item.id, 'Picked Up')}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shrink-0 shadow-xs transition-colors"
                        >
                          Confirm Handover
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-stone-500 italic bg-white/80 px-2 py-1 rounded-md border border-stone-200 shrink-0">
                          Managed by {item.donorOrg}
                        </span>
                      )}
                    </div>
                  );
                })()}

                {item.status === 'Picked Up' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex items-center justify-between">
                    <span className="text-[11px]">In Transit with <strong>{item.claimedBy}</strong>.</span>
                    <button
                      onClick={() => setActiveTab('traceability')}
                      className="font-semibold underline text-forest-800 hover:text-forest-950 text-[11px]"
                    >
                      View Live Timeline &rarr;
                    </button>
                  </div>
                )}

              </div>

              {/* Card Footer with action link to traceability */}
              <div className="px-6 py-3.5 bg-canvas-subtle/50 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-stone-400">
                  #{item.id}
                </span>
                <button
                  onClick={() => setActiveTab('traceability')}
                  className="font-semibold text-forest-800 hover:text-forest-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Inspect Timeline & Traceability</span>
                  <ArrowRight className="w-3.5 h-3.5 text-terracotta-500" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-canvas-subtle text-stone-400 flex items-center justify-center mx-auto">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">No Food Donations Found</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery || filterStatus !== 'ALL'
                ? 'No items matched your current search filters. Try clearing your search keyword.'
                : 'There are currently no donation records in your workspace.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {(searchQuery || filterStatus !== 'ALL') ? (
              <button
                onClick={() => { setSearchQuery(''); setFilterStatus('ALL'); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={onOpenDonationModal}
                className="inline-flex items-center gap-2 bg-forest-800 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-forest-900"
              >
                <PlusCircle className="w-4 h-4 text-terracotta-400" />
                <span>Create First Donation</span>
              </button>
            )}
          </div>
        </div>
      )}
      </>
      )}

    </div>
  );
}
