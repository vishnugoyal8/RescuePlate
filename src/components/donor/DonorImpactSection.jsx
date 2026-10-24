import React, { useState } from 'react';
import { 
  Award, 
  Utensils, 
  Leaf, 
  DollarSign, 
  Share2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Info, 
  Copy, 
  X, 
  ArrowRight,
  Sparkles,
  Settings,
  Building2,
  Sliders
} from 'lucide-react';
import { useDonations } from '../../context/DonationContext';
import { StatsCard } from '../common/StatsCard';
import { 
  calculateDonorImpact, 
  getDonorRecommendedNextAction, 
  generateShareableImpactSummary 
} from '../../utils/donorImpact';

export function DonorImpactSection({ setActiveTab, onOpenDonationModal }) {
  const { donations, disposalCostPerKg, setDisposalCostPerKg, showToast } = useDonations();

  // Modal state for shareable summary
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showCostSettings, setShowCostSettings] = useState(false);
  const [customDonorName, setCustomDonorName] = useState("Royal Spoon Banquets & Kitchens");
  const [copySuccess, setCopySuccess] = useState(false);

  // Compute verified donor impact metrics
  const impact = calculateDonorImpact(donations, { disposalCostPerKg });
  const nextAction = getDonorRecommendedNextAction(donations);

  const shareableText = generateShareableImpactSummary(customDonorName, impact);

  const handleCopySummary = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareableText);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareableText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopySuccess(true);
      showToast("Impact summary copied to clipboard! Ready to paste into reports or updates.", "info");
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.error(err);
      showToast("Failed to copy automatically. Please select and copy text manually.", "error");
    }
  };

  const handleNextActionClick = () => {
    if (nextAction.targetTab === 'modal') {
      onOpenDonationModal();
    } else if (nextAction.targetTab) {
      setActiveTab(nextAction.targetTab);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Community Partner Recognition Badge Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
              Kitchen Social Accountability
            </span>
            <span className="text-[11px] text-stone-400 font-mono">Demo Verification</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Verified Restaurant Impact Ledger
          </h2>

          <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
            Every figure below reflects <strong>verified, closed-loop deliveries</strong>. Open or in-transit batches are strictly tracked as pipeline until receipt confirmation.
          </p>
        </div>

        {/* Partner Badge Card */}
        <div className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${
          impact.partnerBadge.isQualified 
            ? 'bg-forest-50/90 border-forest-300 ring-2 ring-forest-500/10' 
            : 'bg-canvas-subtle border-stone-200'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
            impact.partnerBadge.isQualified 
              ? 'bg-forest-800 text-terracotta-400' 
              : 'bg-stone-200 text-stone-500'
          }`}>
            <Award className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                {impact.partnerBadge.tierName}
              </span>
              {impact.partnerBadge.isQualified && (
                <ShieldCheck className="w-4 h-4 text-forest-700" />
              )}
            </div>

            <div className="text-xs text-stone-600 mt-0.5">
              {impact.partnerBadge.isQualified ? (
                <span className="text-forest-800 font-semibold">
                  ✓ Qualified: {impact.completedCount} completed deliveries (Demo Verified)
                </span>
              ) : (
                <span>
                  {impact.completedCount} of {impact.partnerBadge.targetCount} deliveries completed ({impact.partnerBadge.progressPercentage}%)
                </span>
              )}
            </div>

            {/* Micro progress bar */}
            {!impact.partnerBadge.isQualified && (
              <div className="w-40 bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="bg-forest-700 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${impact.partnerBadge.progressPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 2. Primary Verified Impact Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Verified Rescue Milestones</h3>
            <p className="text-xs text-stone-500">Excludes incomplete or unfulfilled food batches</p>
          </div>

          {/* Configurable Assumption Toggle */}
          <button
            onClick={() => setShowCostSettings(!showCostSettings)}
            className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-forest-700" />
            <span>Waste Hauling Rate: ₹{disposalCostPerKg}/kg</span>
          </button>
        </div>

        {/* Optional Configurable Demo Assumption Panel */}
        {showCostSettings && (
          <div className="mb-4 p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-700 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-stone-500" />
                <span>Adjust Configurable Disposal Cost Assumption</span>
              </span>
              <button onClick={() => setShowCostSettings(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-stone-500">
              This demo assumption estimates the commercial waste cartage, tipping, and container fees avoided by diverting food from landfill.
            </p>
            <div className="flex items-center gap-3">
              <label className="font-semibold text-stone-700">Estimated Municipal Hauling Fee:</label>
              <div className="flex items-center gap-1">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={disposalCostPerKg}
                  onChange={(e) => setDisposalCostPerKg(Math.max(0, Number(e.target.value) || 0))}
                  className="w-20 px-2 py-1 rounded-lg border border-stone-300 text-xs font-mono font-bold"
                />
                <span>/ kg</span>
              </div>
              <button
                onClick={() => setDisposalCostPerKg(12.0)}
                className="text-[11px] text-forest-700 underline font-medium"
              >
                Reset Default (₹12/kg)
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            icon={Utensils}
            title="Verified Rescued Meals"
            value={impact.verifiedMealsRescued.toLocaleString()}
            subtitle="Delivered dispatches only (400g adult std)"
            trend="100% verified hand-off"
            accent="forest"
          />

          <StatsCard 
            icon={Leaf}
            title="Diverted Food Waste"
            value={`${impact.verifiedWeightDivertedKg} kg`}
            subtitle="Kept out of municipal landfill"
            trend="Zero-landfill protocol"
            accent="terracotta"
          />

          <StatsCard 
            icon={DollarSign}
            title="Est. Disposal Cost Avoided"
            value={`₹${impact.estimatedDisposalCostAvoided.toLocaleString()}`}
            subtitle={`*Configurable demo rate: ₹${disposalCostPerKg}/kg avoided`}
            accent="forest"
          />

          <StatsCard 
            icon={CheckCircle2}
            title="Completed Dispatches"
            value={`${impact.completedCount} / ${impact.totalPosted}`}
            subtitle={`${impact.inProgressCount} in transit &bull; ${impact.availableCount} open`}
            accent="amber"
          />
        </div>
      </div>

      {/* 3. Strict Pipeline Separation Notice & Progress Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline vs Verified Distinction Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Discipline of Integrity: Verified vs Pipeline</h4>
              <p className="text-xs text-stone-500">Only Delivered items count as verified rescued food</p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
              Audit Standard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Column A: Verified Completed */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Verified Rescued Food</span>
              </div>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Confirmed received by NGO courier at community distribution shelters:
              </p>
              <div className="pt-1 space-y-1 font-semibold text-emerald-950">
                <div>&bull; {impact.verifiedMealsRescued} meals verified delivered</div>
                <div>&bull; {impact.verifiedWeightDivertedKg} kg commercial surplus saved</div>
                <div>&bull; {impact.completedCount} closed-loop audit records</div>
              </div>
            </div>

            {/* Column B: Pipeline Pending Delivery */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Pipeline (Pending Delivery)</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Currently broadcasting or in transit; excluded from verified rescued figures:
              </p>
              <div className="pt-1 space-y-1 font-semibold text-amber-950">
                <div>&bull; ~{impact.pipelinePendingMeals} estimated meals in transit/claim</div>
                <div>&bull; ~{impact.pipelinePendingKg} kg awaiting final receipt</div>
                <div>&bull; {impact.inProgressCount} active courier dispatches</div>
              </div>
            </div>

          </div>

          {/* Supported NGOs */}
          {impact.partnerNgosSupported.length > 0 && (
            <div className="pt-2 text-xs text-stone-600">
              <span className="font-semibold text-stone-800">Shelters & NGOs Served:</span>{' '}
              <span className="text-stone-600">{impact.partnerNgosSupported.join(' &bull; ')}</span>
            </div>
          )}
        </div>

        {/* Shareable Impact Action Card */}
        <div className="bg-canvas-subtle p-6 rounded-3xl border border-stone-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">Shareable Impact Summary</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Export an auditable, plain-text impact summary to update executive management, corporate sponsors, or kitchen staff.
            </p>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <Share2 className="w-3.5 h-3.5 text-terracotta-400" />
            <span>Preview & Copy Summary</span>
          </button>
        </div>

      </div>

      {/* 4. Honest Retention Progress & Contextual Next Action */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Community Retention & Accountability
            </span>
            <h4 className="text-lg font-bold text-stone-900 mt-0.5">
              Recommended Next Action
            </h4>
          </div>

          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
            nextAction.urgency === 'high' ? 'bg-terracotta-50 text-terracotta-700 border border-terracotta-200' : 'bg-forest-50 text-forest-800 border border-forest-200'
          }`}>
            {nextAction.actionType.replace('_', ' ')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-canvas-subtle border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h5 className="font-bold text-stone-900 text-sm">{nextAction.actionTitle}</h5>
            <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
              {nextAction.actionDescription}
            </p>
          </div>

          <button
            onClick={handleNextActionClick}
            className="whitespace-nowrap inline-flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <span>{nextAction.buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5 text-terracotta-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real community tracking &bull; No automated fake reviews or fabricated marketing claims</span>
        </div>

      </div>

      {/* 5. Plain-Text Shareable Impact Summary Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-forest-900 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-800 text-terracotta-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Shareable Impact Summary</h3>
                  <p className="text-xs text-forest-200">
                    RescuePlate &bull; Copyable Plain-Text Report
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-forest-300 hover:text-white p-1 rounded-lg hover:bg-forest-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Kitchen / Business Entity Name:
                </label>
                <input
                  type="text"
                  value={customDonorName}
                  onChange={(e) => setCustomDonorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-700"
                />
              </div>

              {/* Plain-text display */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Generated Text Summary (Markdown / Plain Text):
                </label>
                <pre className="p-4 rounded-2xl bg-stone-900 text-stone-100 font-mono text-[11px] leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-64 border border-stone-800">
                  {shareableText}
                </pre>
              </div>

              {/* Explicit Transparency Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Notice:</strong> This generates a plain-text summary for manual sharing in emails, social posts, or internal reports. RescuePlate does not automatically broadcast to third-party platforms or issue certified government tax receipts.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <Copy className="w-4 h-4 text-terracotta-400" />
                  <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
