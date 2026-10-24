import React from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Truck
} from 'lucide-react';
import { MatchScoreBadge } from './MatchScoreBadge';

export function MatchExplanationModal({ matchResult, onClose }) {
  if (!matchResult) return null;

  const { donation, ngo, isEligible, score, reasons, exclusionReasons, details } = matchResult;
  const breakdown = details?.breakdown || { proximity: 0, urgency: 0, capacity: 0, condition: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-forest-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-terracotta-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Explainable Match Breakdown</h3>
                <MatchScoreBadge score={score} isEligible={isEligible} size="sm" />
              </div>
              <p className="text-xs text-forest-200">
                RescuePlate PS-43 &bull; Deterministic Compatibility Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-forest-300 hover:text-white p-1 rounded-lg hover:bg-forest-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto text-sm text-stone-700">
          
          {/* Pair Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-canvas-subtle p-4 rounded-2xl border border-stone-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Donation Batch
              </span>
              <p className="font-bold text-stone-900 mt-0.5">{donation.foodName}</p>
              <p className="text-xs text-stone-500">{donation.category} &bull; {donation.quantity} {donation.unit}</p>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {donation.pickupAddress}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Evaluating NGO Profile
              </span>
              <p className="font-bold text-stone-900 mt-0.5">{ngo.name}</p>
              <p className="text-xs text-stone-500">{ngo.type}</p>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {ngo.address}
              </p>
            </div>
          </div>

          {/* Hard Exclusion Banner if Ineligible */}
          {!isEligible && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>Eligibility Disqualification Triggered</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                This donation failed one or more strict safety or operational constraints and was excluded from recommendations:
              </p>
              <ul className="list-disc pl-5 text-xs text-red-800 space-y-1 font-medium">
                {exclusionReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Explainable Reasons Summary */}
          {isEligible && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-800">
                Key Matching Factors
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-forest-50/70 border border-forest-200/80 text-xs text-forest-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: reason }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4-Factor Weighted Scoring Table */}
          {isEligible && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Scoring Formula Breakdown (Total 100 Points)
                </h4>
                <span className="text-xs font-bold text-forest-800">
                  Achieved: {score} / 100
                </span>
              </div>

              <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Evaluation Pillar</th>
                      <th className="px-4 py-2.5">Observed Metric</th>
                      <th className="px-4 py-2.5 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    <tr>
                      <td className="px-4 py-3 font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>Proximity (Haversine)</span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        ~{details?.distanceKm} km (Est. ~{details?.transitMinutes}m transit window)
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-right text-stone-900">
                        {breakdown.proximity} / 35
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-3 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Spoilage Urgency Window</span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {donation.urgency} urgency &bull; ~{Math.round(details?.timeRemainingMinutes / 60)}h until cutoff
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-right text-stone-900">
                        {breakdown.urgency} / 25
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-3 font-semibold flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-stone-400" />
                        <span>Intake Capacity Fit</span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        Requires {details?.requiredAmount} of {details?.availableCapacity} {details?.unit} open capacity
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-right text-stone-900">
                        {breakdown.capacity} / 20
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-3 font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                        <span>Category & Storage Match</span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        Accepted: "{donation.category}" &bull; Handling: "{donation.storageCondition}"
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-right text-stone-900">
                        {breakdown.condition} / 20
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transparency Disclaimer Notice */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-stone-800">Simulated Data Labeling:</span> Distance calculations use verified demo geographical coordinates for Delhi NCR localities with a fixed 25 km/h urban transit velocity and 15 min handling buffer. No real-time GPS sensors or traffic tracking are fabricated.
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Close Breakdown
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
