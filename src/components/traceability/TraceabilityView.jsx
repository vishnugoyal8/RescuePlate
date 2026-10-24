import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  FileCheck, 
  Layers, 
  RefreshCw, 
  Building2, 
  Truck, 
  ArrowRight, 
  Info, 
  Bug, 
  Lock, 
  MapPin, 
  User, 
  Search, 
  Filter, 
  RotateCcw,
  PackageCheck
} from 'lucide-react';
import { useDonations } from '../../context/DonationContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, SampleDataTag } from '../common/Badge';
import { 
  verifyTraceabilityChain, 
  appendTraceEvent, 
  computeEventHash 
} from '../../utils/cryptoTraceability';

/**
 * Procedural SVG QR Code Graphic for demo visualization
 */
function DemoQrCodeSvg({ value, size = 140 }) {
  const cells = 21; // standard Version 1 QR matrix size
  const cellSize = size / cells;

  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) % 1000003;
  }
  const nextPseudo = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  const grid = [];
  for (let r = 0; r < cells; r++) {
    const row = [];
    for (let c = 0; c < cells; c++) {
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= cells - 7;
      const isBottomLeft = r >= cells - 7 && c < 7;

      if (isTopLeft || isTopRight || isBottomLeft) {
        const localR = isTopLeft ? r : isTopRight ? r : r - (cells - 7);
        const localC = isTopLeft ? c : isTopRight ? c - (cells - 7) : c;
        const isBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
        const isCenter = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
        row.push(isBorder || isCenter ? 1 : 0);
      } else {
        row.push(nextPseudo() > 0.45 ? 1 : 0);
      }
    }
    grid.push(row);
  }

  return (
    <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded">
        <rect width={size} height={size} fill="white" />
        {grid.map((row, r) =>
          row.map((val, c) =>
            val === 1 ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1B3F2F"
              />
            ) : null
          )
        )}
      </svg>
      <div className="text-[10px] text-center font-mono text-stone-500 mt-2 font-semibold tracking-wider">
        SCAN TO AUDIT
      </div>
    </div>
  );
}

export function TraceabilityView() {
  const { 
    donations, 
    traceChains, 
    setTraceChains, 
    updateStatus,
    showToast 
  } = useDonations();
  const { currentUser } = useAuth();

  // Filters & selection
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonationId, setSelectedDonationId] = useState(
    donations[0]?.id || "DON-101"
  );

  // 4 discrete lifecycle steps merged from Pipeline
  const LIFECYCLE_STEPS = [
    { key: 'Available', label: '1. Available', desc: 'Surplus Broadcast' },
    { key: 'Claimed', label: '2. Claimed', desc: 'NGO Reserved' },
    { key: 'Picked Up', label: '3. Picked Up', desc: 'In Transit' },
    { key: 'Delivered', label: '4. Delivered', desc: 'Community Intake' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Available': return 0;
      case 'Claimed': return 1;
      case 'Picked Up': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  // Filtered donation list
  const filteredDonations = donations.filter((item) => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = 
      item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donorOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.claimedBy && item.claimedBy.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Ensure selected donation is valid
  const selectedDonation = 
    donations.find(d => d.id === selectedDonationId) || 
    filteredDonations[0] || 
    donations[0];

  const currentChain = traceChains[selectedDonation?.id] || [];

  // Live cryptographic validation of current chain
  const verificationResult = verifyTraceabilityChain(currentChain);
  const currentStepIdx = getStepIndex(selectedDonation?.status);

  // Copy trace ID
  const handleCopyTraceId = () => {
    if (!selectedDonation) return;
    const traceId = `TRC-${selectedDonation.id}`;
    navigator.clipboard?.writeText?.(traceId);
    showToast(`Traceability ID copied: ${traceId}`);
  };

  // Donor Handover confirmation action (Role & Ownership Guarded)
  const handleDonorSignOff = () => {
    if (!selectedDonation) return;
    if (currentUser?.role && currentUser.role !== 'donor') {
      showToast("Access Denied: Only authenticated Food Donors can sign off kitchen pickup handovers.", "error");
      return;
    }
    if (currentUser?.orgName && selectedDonation.donorOrg.toLowerCase() !== currentUser.orgName.toLowerCase()) {
      showToast(`Cross-Organization Isolation: You cannot sign off handover for "${selectedDonation.donorOrg}".`, "error");
      return;
    }
    updateStatus(selectedDonation.id, 'Picked Up');
  };

  // Recipient safe intake sign-off action (Role & Ownership Guarded)
  const handleRecipientSignOff = () => {
    if (!selectedDonation) return;
    if (currentUser?.role && currentUser.role !== 'ngo') {
      showToast("Access Denied: Only authenticated Recipient NGOs can sign off safe intake delivery.", "error");
      return;
    }
    if (currentUser?.orgName && selectedDonation.claimedBy && selectedDonation.claimedBy.toLowerCase() !== currentUser.orgName.toLowerCase()) {
      showToast(`Cross-Organization Isolation: You cannot sign off delivery intake for "${selectedDonation.claimedBy}".`, "error");
      return;
    }
    updateStatus(selectedDonation.id, 'Delivered');
  };

  // Simulate record tampering for hackathon judges
  const handleSimulateTamper = () => {
    if (!currentChain || currentChain.length < 2) {
      showToast("Need at least 2 events to demonstrate link tampering.", "warning");
      return;
    }

    const tampered = currentChain.map((ev, index) => {
      if (index === 1) {
        return {
          ...ev,
          payload: {
            ...ev.payload,
            quantity: 9999, // Unauthorized illicit modification
            tamperedFlag: true
          }
        };
      }
      return ev;
    });

    setTraceChains(prev => ({
      ...prev,
      [selectedDonation.id]: tampered
    }));

    showToast("Simulated unauthorized tampering of Block #2 payload!", "error");
  };

  // Restore chain integrity
  const handleRestoreChain = () => {
    if (!currentChain || currentChain.length === 0) return;

    let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";
    const fixed = currentChain.map((ev, idx) => {
      const pHash = idx === 0 ? prevHash : fixed[idx - 1].hash;
      const cleanPayload = { ...ev.payload };
      delete cleanPayload.tamperedFlag;
      if (cleanPayload.quantity === 9999) {
        cleanPayload.quantity = selectedDonation.quantity;
      }

      const newHash = computeEventHash(
        pHash,
        ev.type,
        ev.timestamp,
        ev.actorOrg,
        cleanPayload
      );

      return {
        ...ev,
        previousHash: pHash,
        payload: cleanPayload,
        hash: newHash
      };
    });

    setTraceChains(prev => ({
      ...prev,
      [selectedDonation.id]: fixed
    }));

    showToast("Audit chain restored and verified clean.");
  };

  const formatTime = (isoString) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <QrCode className="w-3.5 h-3.5 text-forest-700" />
              Traceability & Custody Timeline &bull; PS-43
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
              Donation Timeline & Cryptographic Traceability
            </h1>
            <p className="text-stone-600 mt-1 max-w-2xl text-sm">
              Unified dispatch timeline tracking surplus food from commercial kitchen preparation through courier transit to shelter intake, anchored by a tamper-evident SHA-256 audit chain.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="flex items-center gap-3">
            {verificationResult.isValid ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>SHA-256 Chain Valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Tamper Detected in Audit Chain</span>
              </div>
            )}
          </div>
        </div>

        {/* Legal & Food Safety Disclaimer */}
        <div className="mt-4 bg-stone-100 border border-stone-300/80 rounded-xl p-4 text-xs text-stone-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-forest-700 mt-0.5 shrink-0" />
          <div className="leading-relaxed">
            <span className="font-semibold text-stone-900">Cryptographic Audit Chain Notice:</span>
            {' '}This timeline links each handover event with deterministic SHA-256 hashes in client storage (local demonstration log).
            <span className="font-semibold text-stone-900 block mt-1">
              Food Safety Independence: Cryptographic hashes guarantee that records have not been altered after the fact; physical food safety requires the certified temperature checks and sensory inspections logged below.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Batch Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by food, donor, or NGO..."
            className="w-full pl-9 pr-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-700/20 bg-stone-50/50"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> State:
          </span>
          {['ALL', 'Available', 'Claimed', 'Picked Up', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Selected Batch Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0">
            Active Batch:
          </span>
          <select
            value={selectedDonation?.id}
            onChange={(e) => setSelectedDonationId(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-medium bg-stone-50 text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-700/20 max-w-[220px] truncate"
          >
            {filteredDonations.map(d => (
              <option key={d.id} value={d.id}>
                #{d.id} &bull; {d.foodName} ({d.status})
              </option>
            ))}
          </select>
        </div>

      </div>

      {selectedDonation ? (
        <>
          {/* ------------------------------------------------------------- */}
          {/* SECTION 1: UNIFIED 4-STEP PIPELINE TIMELINE STEPPER            */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-md">
                    #{selectedDonation.id}
                  </span>
                  <StatusBadge status={selectedDonation.status} />
                  {selectedDonation.isSample && <SampleDataTag />}
                  <span className="text-xs font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded border border-terracotta-100">
                    {selectedDonation.category}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                  {selectedDonation.foodName}
                </h2>
              </div>

              <div className="text-left sm:text-right text-xs text-stone-500">
                <span className="block font-bold text-stone-900 text-base">
                  {selectedDonation.quantity} {selectedDonation.unit} (~{selectedDonation.estimatedWeightKg} kg)
                </span>
                <span>Offered by <strong className="text-stone-800">{selectedDonation.donorOrg}</strong></span>
              </div>
            </div>

            {/* 4-Step Interactive Pipeline Stepper */}
            <div className="relative pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.key} className="space-y-2">
                      <div className={`h-2.5 rounded-full transition-all ${
                        isCompleted || isCurrent 
                          ? selectedDonation.status === 'Delivered' 
                            ? 'bg-forest-700' 
                            : 'bg-terracotta-500' 
                          : 'bg-stone-200'
                      }`} />

                      <div className="text-left">
                        <div className={`text-xs font-bold ${
                          isCurrent 
                            ? 'text-stone-900 flex items-center gap-1' 
                            : isCompleted 
                            ? 'text-forest-800' 
                            : 'text-stone-400'
                        }`}>
                          {step.label}
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />}
                        </div>
                        <div className="text-[11px] text-stone-500 hidden sm:block">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custody Transition Action Buttons */}
            <div className="p-4 rounded-2xl bg-canvas-subtle border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-stone-600">
                <span className="font-semibold text-stone-900">Current Custody Status:</span>{' '}
                <strong className="text-forest-800">{selectedDonation.status}</strong>
                {selectedDonation.claimedBy && (
                  <span className="text-stone-500 ml-1">
                    &bull; Handled by <strong>{selectedDonation.claimedBy}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedDonation.status === 'Available' && (
                  <button
                    onClick={() => updateStatus(selectedDonation.id, 'Claimed')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>Simulate NGO Reservation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {selectedDonation.status === 'Claimed' && (
                  <button
                    onClick={handleDonorSignOff}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Confirm Courier Picked Up</span>
                  </button>
                )}

                {selectedDonation.status === 'Picked Up' && (
                  <button
                    onClick={handleRecipientSignOff}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-white shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-terracotta-400" />
                    <span>Confirm Safely Delivered</span>
                  </button>
                )}

                {selectedDonation.status === 'Delivered' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 bg-forest-50 px-3 py-1.5 rounded-xl border border-forest-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Delivery Complete</span>
                  </span>
                )}

                {/* Reset button for test cycling */}
                {selectedDonation.status !== 'Available' && (
                  <button
                    onClick={() => updateStatus(selectedDonation.id, 'Available', true)}
                    title="Reset to Available for test evaluation"
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 2: QR DIGITAL CUSTODY PASS & CRYPTOGRAPHIC TIMELINE   */}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Visual Pass & Sign-offs */}
            <div className="space-y-6">
              
              {/* QR Pass */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-forest-700 uppercase tracking-widest mb-1">
                  RescuePlate Digital Custody Pass
                </span>
                <span className="text-lg font-mono font-extrabold text-stone-900 tracking-tight mb-4">
                  TRC-{selectedDonation.id}
                </span>

                <DemoQrCodeSvg value={`https://rescueplate.app/trace/TRC-${selectedDonation.id}`} size={160} />

                <div className="mt-4 space-y-2 text-xs text-stone-600 w-full text-left pt-4 border-t border-stone-100">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Food Batch:</span>
                    <span className="font-semibold text-stone-800">{selectedDonation.foodName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Rescued Qty:</span>
                    <span className="font-semibold text-stone-800">{selectedDonation.quantity} {selectedDonation.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Storage Class:</span>
                    <span className="font-semibold text-stone-800">{selectedDonation.storageCondition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Donor Entity:</span>
                    <span className="font-semibold text-stone-800">{selectedDonation.donorOrg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Claiming NGO:</span>
                    <span className="font-semibold text-stone-800">{selectedDonation.claimedBy || "Unclaimed"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Current Phase:</span>
                    <span className="font-bold text-forest-800">{selectedDonation.status}</span>
                  </div>
                </div>

                <button
                  onClick={handleCopyTraceId}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy Trace ID (TRC-{selectedDonation.id})</span>
                </button>
              </div>

              {/* Handover & Intake Sign-Off Controls */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 space-y-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-forest-700" />
                  Custody Handshake Controls
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Dual-party digital confirmations automatically seal new SHA-256 blocks into the audit chain.
                </p>
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleDonorSignOff}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-stone-200 hover:border-forest-700 bg-stone-50/50 hover:bg-forest-50/40 text-xs font-medium text-stone-800 transition-colors flex items-center justify-between"
                  >
                    <span>Donor Kitchen Handover</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                  <button
                    onClick={handleRecipientSignOff}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-stone-200 hover:border-forest-700 bg-stone-50/50 hover:bg-forest-50/40 text-xs font-medium text-stone-800 transition-colors flex items-center justify-between"
                  >
                    <span>Recipient Shelter Intake Sign-Off</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                </div>
              </div>

              {/* Hackathon Judge Tampering Simulator */}
              <div className="bg-stone-50 rounded-3xl border border-stone-200 p-5 space-y-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-terracotta-500" />
                  Judge Demo: Tamper Detection
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Click to simulate unauthorized modification in Block #2. The validator will immediately detect the broken hash linkage.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSimulateTamper}
                    className="flex-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-semibold text-xs py-2 px-3 rounded-xl transition-colors"
                  >
                    Simulate Tamper
                  </button>
                  <button
                    onClick={handleRestoreChain}
                    className="flex-1 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs py-2 px-3 rounded-xl transition-colors"
                  >
                    Restore Chain
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Chronological Event Block Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-7">
                
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
                      <Layers className="w-5 h-5 text-forest-700" />
                      Immutable Event Blocks ({currentChain.length})
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Sequential cryptographic records linked via SHA-256 block hashes.
                    </p>
                  </div>

                  <div>
                    {verificationResult.isValid ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Valid Chain
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Tamper Detected
                      </span>
                    )}
                  </div>
                </div>

                {/* Tampering diagnostic banner */}
                {!verificationResult.isValid && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1">
                    <div className="font-bold flex items-center gap-2 text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Cryptographic Chain Integrity Broken
                    </div>
                    <p className="font-mono text-[11px]">{verificationResult.error}</p>
                    <p className="text-rose-700 pt-1">
                      Click "Restore Chain" on the left panel to recalculate authentic signatures.
                    </p>
                  </div>
                )}

                {/* Chronological Blocks */}
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-stone-200">
                  {currentChain.map((block, idx) => {
                    const isGenesis = idx === 0;
                    const isTamperedBlock = !verificationResult.isValid && verificationResult.brokenIndex === idx;

                    return (
                      <div key={block.eventId || idx} className="relative flex items-start gap-4">
                        
                        {/* Stepper Node */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 font-mono text-xs font-bold shadow-xs ${
                          isTamperedBlock 
                            ? 'bg-rose-600 text-white animate-bounce' 
                            : isGenesis 
                            ? 'bg-forest-800 text-white' 
                            : 'bg-white border-2 border-forest-700 text-forest-800'
                        }`}>
                          #{idx + 1}
                        </div>

                        {/* Block Content */}
                        <div className={`flex-1 rounded-2xl border p-4 sm:p-5 transition-all ${
                          isTamperedBlock 
                            ? 'bg-rose-50/40 border-rose-300 shadow-sm' 
                            : 'bg-stone-50/60 border-stone-200/90 hover:border-stone-300'
                        }`}>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-stone-900">
                                {block.type}
                              </span>
                              <span className="text-[11px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-mono">
                                {block.eventId}
                              </span>
                            </div>
                            <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              {formatTime(block.timestamp)}
                            </span>
                          </div>

                          <div className="text-xs text-stone-600 mb-3 flex items-center gap-2">
                            <span className="font-semibold text-stone-800">{block.actorOrg}</span>
                            <span className="text-stone-400">&bull;</span>
                            <span className="text-stone-500">{block.actorRole}</span>
                          </div>

                          {/* Payload Data */}
                          <div className="bg-white rounded-xl p-3 border border-stone-200/80 mb-3 text-xs font-mono text-stone-700 space-y-1">
                            <div className="text-[10px] uppercase font-bold text-stone-400 font-sans mb-1">
                              Payload Ledger Data
                            </div>
                            {Object.entries(block.payload || {}).map(([k, v]) => (
                              <div key={k} className="flex justify-between gap-4">
                                <span className="text-stone-500">{k}:</span>
                                <span className="text-stone-900 font-medium truncate max-w-[280px]">
                                  {String(v)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Cryptographic Hashes */}
                          <div className="space-y-1 pt-1 text-[11px] font-mono">
                            <div className="flex items-center gap-2 text-stone-500">
                              <span className="w-20 shrink-0 text-[10px] uppercase text-stone-400 font-sans">Prev Hash:</span>
                              <span className="truncate text-stone-600" title={block.previousHash}>
                                {block.previousHash.slice(0, 16)}...{block.previousHash.slice(-8)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-forest-800 font-semibold">
                              <span className="w-20 shrink-0 text-[10px] uppercase text-stone-400 font-sans">Block Hash:</span>
                              <span className="truncate" title={block.hash}>
                                {block.hash.slice(0, 16)}...{block.hash.slice(-8)}
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 max-w-lg mx-auto space-y-3">
          <Truck className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No Dispatches Match Filters</h3>
          <p className="text-xs text-stone-500">Try clearing the search query or selecting a different status filter.</p>
        </div>
      )}

    </div>
  );
}
