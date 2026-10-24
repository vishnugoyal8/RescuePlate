import React from 'react';
import { 
  BarChart3, 
  Utensils, 
  Leaf, 
  Droplets, 
  Award, 
  ShieldCheck, 
  Info, 
  HeartHandshake,
  Layers,
  Sparkles
} from 'lucide-react';
import { useDonations } from '../../context/DonationContext';
import { StatsCard } from '../common/StatsCard';
import { StatusBadge, SampleDataTag } from '../common/Badge';

export function ImpactView() {
  const { donations } = useDonations();

  // Aggregate Calculations
  const totalDonationsCount = donations.length;
  const deliveredDonations = donations.filter(d => d.status === 'Delivered');
  const deliveredCount = deliveredDonations.length;
  const inProgressDonations = donations.filter(d => d.status === 'Claimed' || d.status === 'Picked Up');
  const claimedOrInTransitCount = inProgressDonations.length;
  const availableCount = donations.filter(d => d.status === 'Available').length;

  // Helper for item weight
  const getItemWeight = (item) => {
    return item.estimatedWeightKg || (item.unit === 'kg' ? item.quantity : item.quantity * 0.4);
  };

  // Helper for item meals
  const getItemMeals = (item) => {
    if (item.unit === 'meals' || item.unit === 'servings') {
      return Number(item.quantity);
    }
    return Math.round(getItemWeight(item) * 2.5);
  };

  // STRICT RULE: Only completed "Delivered" donations count as verified rescued food
  const verifiedMealsRescued = deliveredDonations.reduce((sum, item) => sum + getItemMeals(item), 0);
  const verifiedWeightKg = Math.round(deliveredDonations.reduce((sum, item) => sum + getItemWeight(item), 0) * 10) / 10;

  // Pipeline pending
  const pipelineMeals = inProgressDonations.reduce((sum, item) => sum + getItemMeals(item), 0);

  // Environmental impact metrics (Standard FAO & EPA food waste conversion factors on verified diverted food)
  // ~2.5 kg CO2 equivalent greenhouse emissions prevented per kg food saved from anaerobic landfill
  const estimatedCo2SavedKg = Math.round(verifiedWeightKg * 2.5);
  // ~800 liters virtual water footprint embedded per kg mixed food
  const estimatedWaterSavedLiters = Math.round(verifiedWeightKg * 800);

  // Category breakdown
  const categoryCounts = donations.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Impact & Ecological Metrics
            </h1>
            <span className="bg-forest-100 text-forest-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-forest-200">
              Community Ledger
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Quantifying social nutrition outcomes and greenhouse emission offsets through closed-loop food redistribution.
          </p>
        </div>
      </div>

      {/* Transparent Disclaimer Box (Hackathon Requirement) */}
      <div className="p-4 rounded-2xl bg-forest-50/80 border border-forest-200 text-forest-950 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-forest-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-forest-900">
            Methodology & Formula Transparency Disclaimer:
          </p>
          <p className="text-forest-800/90 leading-relaxed">
            All numerical figures displayed on this dashboard are <strong>clearly designated estimates</strong> based on community nutrition averages. 
            Direct plate servings are counted 1:1; weight-based donations (produce, bakery, dairy) use the standard 400g adult meal guideline (1 kg ≈ 2.5 meals). 
            Emissions savings use the UNEP factor of 2.5 kg CO₂e offset per kg food diverted from municipal landfills.
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          icon={Utensils}
          title="Verified Meals Rescued"
          value={verifiedMealsRescued.toLocaleString()}
          subtitle={`*Delivered batches only • ~${pipelineMeals} meals in pipeline`}
          trend="Verified Delivered"
          accent="forest"
        />
        <StatsCard 
          icon={Leaf}
          title="Est. CO₂e Prevented"
          value={`${estimatedCo2SavedKg.toLocaleString()} kg`}
          subtitle="*Estimate: 2.5 kg CO₂e per kg food diverted"
          trend="Diverted from landfill"
          accent="terracotta"
        />
        <StatsCard 
          icon={Droplets}
          title="Virtual Water Saved"
          value={`${(estimatedWaterSavedLiters / 1000).toFixed(1)}k L`}
          subtitle="*Estimate: Agricultural water footprint"
          accent="amber"
        />
        <StatsCard 
          icon={Layers}
          title="Total Surplus Batches"
          value={totalDonationsCount}
          subtitle={`${deliveredCount} completed &bull; ${claimedOrInTransitCount} active`}
          accent="forest"
        />
      </div>

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Food Categories Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-lg">Rescued Food By Category</h3>
              <p className="text-xs text-stone-500">Distribution across food types logged</p>
            </div>
            <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
              {Object.keys(categoryCounts).length} Categories Active
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(categoryCounts).map(([catName, count]) => {
              const percentage = Math.round((count / totalDonationsCount) * 100) || 0;

              return (
                <div key={catName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{catName}</span>
                    <span className="text-stone-500 font-mono">
                      {count} batch{count > 1 ? 'es' : ''} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-forest-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Health Status Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">Pipeline Distribution</h3>
            <p className="text-xs text-stone-500">Real-time status proportions</p>
          </div>

          <div className="space-y-3 py-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="font-semibold text-emerald-900">Delivered to Beneficiaries</span>
              <span className="font-bold text-emerald-800">{deliveredCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="font-semibold text-amber-900">Claimed & In Transit</span>
              <span className="font-bold text-amber-800">{claimedOrInTransitCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="font-semibold text-stone-700">Available For Claim</span>
              <span className="font-bold text-stone-800">{availableCount}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-canvas-subtle border border-stone-200 text-center">
            <div className="text-2xl font-extrabold text-forest-900">
              {totalDonationsCount > 0 ? Math.round((deliveredCount / totalDonationsCount) * 100) : 0}%
            </div>
            <div className="text-[11px] text-stone-500 font-medium">
              Resolution & Fulfillment Rate
            </div>
          </div>
        </div>

      </div>

      {/* Recent Impact Distribution Ledger */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">Verified Food Rescue Ledger</h3>
            <p className="text-xs text-stone-500">Transparent community record of logged dispatches</p>
          </div>
          <div className="text-xs font-semibold text-forest-800 bg-forest-50 px-3 py-1 rounded-xl border border-forest-200">
            Auditable Chain
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-subtle text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Donation ID</th>
                <th className="px-6 py-3.5 font-semibold">Food Batch</th>
                <th className="px-6 py-3.5 font-semibold">Category</th>
                <th className="px-6 py-3.5 font-semibold">Est. Quantity</th>
                <th className="px-6 py-3.5 font-semibold">Est. Meals</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold">Claiming Partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {donations.map((item) => {
                const itemMeals = item.unit === 'meals' || item.unit === 'servings'
                  ? item.quantity
                  : Math.round((item.estimatedWeightKg || item.quantity * 0.4) * 2.5);

                return (
                  <tr key={item.id} className="hover:bg-canvas/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-stone-500">
                      #{item.id}
                      {item.isSample && <span className="block text-[10px] text-stone-400">Sample</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      {item.foodName}
                      <span className="block text-[11px] font-normal text-stone-400">{item.pickupAddress}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">{item.category}</td>
                    <td className="px-6 py-4 font-semibold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 font-bold text-forest-800">
                      ~{itemMeals} meals*
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      {item.claimedBy ? (
                        <span className="font-medium text-stone-900">{item.claimedBy}</span>
                      ) : (
                        <span className="text-stone-400 italic">Unclaimed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
