import React, { useState } from 'react';
import { 
  Building2, 
  Utensils, 
  TrendingDown, 
  AlertTriangle, 
  PlusCircle, 
  CheckCircle2, 
  Trash2, 
  Layers, 
  Leaf, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  HelpCircle, 
  Info,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useDonations } from '../../context/DonationContext';
import { useAuth } from '../../context/AuthContext';
import { StatsCard } from '../common/StatsCard';
import { FOOD_CATEGORIES, QUANTITY_UNITS } from '../../data/sampleDonations';
import { 
  validateWasteEntry, 
  computeEntryReconciliation, 
  summarizeWasteEntries 
} from '../../utils/wasteIntelligence';

export function HotelWasteDashboard({ onOpenDonationModal }) {
  const { wasteEntries, addWasteEntry, deleteWasteEntry, showToast } = useDonations();
  const { currentUser } = useAuth();

  // Filter timeframe state: 'all' | '7days' | '30days'
  const [timeFilter, setTimeFilter] = useState('all');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // New entry form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hotelOrg: currentUser?.orgName || "Grand Pearl Banquet & Hotel",
    itemName: "",
    category: "Cooked Meals",
    preparedQty: "",
    soldOrServedQty: "",
    donatedQty: "",
    discardedQty: "",
    unit: "meals",
    notes: ""
  });

  const [formErrors, setFormErrors] = useState({});

  // Filter entries based on timeframe
  const filteredEntries = wasteEntries.filter(entry => {
    if (timeFilter === 'all') return true;
    const entryDate = new Date(entry.date);
    const now = new Date();
    const daysDiff = (now - entryDate) / (1000 * 60 * 60 * 24);
    if (timeFilter === '7days') return daysDiff <= 7;
    if (timeFilter === '30days') return daysDiff <= 30;
    return true;
  });

  const summary = summarizeWasteEntries(filteredEntries);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFillDemo = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      hotelOrg: "Grand Pearl Banquet & Hotel",
      itemName: "Corporate Lunch Special (Dal Makhani & Naan)",
      category: "Cooked Meals",
      preparedQty: "90",
      soldOrServedQty: "65",
      donatedQty: "20",
      discardedQty: "3",
      unit: "meals",
      notes: "Lunch banquet buffet. 25 surplus = 20 donated + 3 discarded + 2 unaccounted plating loss."
    });
    setFormErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateWasteEntry(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    addWasteEntry(formData);
    setIsEntryModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      hotelOrg: currentUser?.orgName || "Grand Pearl Banquet & Hotel",
      itemName: "",
      category: "Cooked Meals",
      preparedQty: "",
      soldOrServedQty: "",
      donatedQty: "",
      discardedQty: "",
      unit: "meals",
      notes: ""
    });
  };

  const handleDeleteEntry = (item) => {
    // Cross-Organization Isolation check
    if (currentUser?.orgName && item.hotelOrg && item.hotelOrg.toLowerCase() !== currentUser.orgName.toLowerCase()) {
      showToast(`Access Denied: You cannot delete waste logs belonging to "${item.hotelOrg}".`, "error");
      return;
    }
    deleteWasteEntry(item.id);
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Hotel Food Waste Intelligence
            </h1>
            <span className="bg-forest-100 text-forest-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-forest-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" />
              <span>Commercial Surplus Accounting</span>
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Record daily prep, sales, donations, and kitchen discards. Reconcile surplus dispositions and pinpoint recurring waste patterns to tune kitchen prep batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="inline-flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4 text-terracotta-400" />
            <span>Log Daily Food Prep & Waste</span>
          </button>
        </div>
      </div>

      {/* 2. Transparency Methodology Banner */}
      <div className="p-4 rounded-2xl bg-forest-50/80 border border-forest-200 text-xs text-forest-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-forest-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-forest-900">
            Food Waste Reconciliation Formula Standard:
          </p>
          <p className="text-forest-800/90 leading-relaxed">
            <strong>Estimated Surplus</strong> = Prepared − Sold/Served &bull;{' '}
            <strong>Recorded Disposition</strong> = Donated + Discarded &bull;{' '}
            <strong>Unaccounted Quantity</strong> = Estimated Surplus − Recorded Disposition (identifies unmeasured plate scrapings, cooking shrinkage, or kitchen variance).
            All figures are kitchen operational estimates based on logged demo shifts.
          </p>
        </div>
      </div>

      {/* 3. Timeframe Filter & High-Level Metrics */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Waste Ledger Metrics</h2>
            <p className="text-xs text-stone-500">Summary across verified kitchen shift logs</p>
          </div>

          <div className="inline-flex p-1 bg-stone-200/80 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeFilter === 'all' ? 'bg-white text-forest-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Records ({wasteEntries.length})
            </button>
            <button
              onClick={() => setTimeFilter('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeFilter === '7days' ? 'bg-white text-forest-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeFilter('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeFilter === '30days' ? 'bg-white text-forest-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard 
            icon={Utensils}
            title="Total Food Prepared"
            value={summary.totalPrepared.toLocaleString()}
            subtitle={`Across ${summary.totalEntries} logged kitchen shifts`}
            accent="forest"
          />

          <StatsCard 
            icon={Layers}
            title="Sold / Served"
            value={summary.totalSold.toLocaleString()}
            subtitle={`${summary.totalPrepared > 0 ? Math.round((summary.totalSold / summary.totalPrepared) * 100) : 0}% consumption rate`}
            accent="forest"
          />

          <StatsCard 
            icon={Leaf}
            title="Rescued & Donated"
            value={summary.totalDonated.toLocaleString()}
            subtitle={`${summary.avgDonationRate}% donation capture rate`}
            trend="Diverted to shelters"
            accent="terracotta"
          />

          <StatsCard 
            icon={TrendingDown}
            title="Discarded Waste"
            value={summary.totalDiscarded.toLocaleString()}
            subtitle={`${summary.overallDiscardRate}% discard ratio`}
            accent="amber"
          />

          <StatsCard 
            icon={AlertTriangle}
            title="Unaccounted Variance"
            value={summary.totalUnaccounted.toLocaleString()}
            subtitle="Plate scrapings & prep loss"
            accent="forest"
          />
        </div>
      </div>

      {/* 4. Frequently Wasted Items & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Frequently Wasted Items Table */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Frequently Discarded Kitchen Items</h3>
              <p className="text-xs text-stone-500">Ranked by total discarded volume to guide prep portioning</p>
            </div>
            <span className="text-[11px] font-bold text-terracotta-600 bg-terracotta-50 px-2.5 py-1 rounded-lg border border-terracotta-100">
              High Spoilage Radar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas-subtle text-stone-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-3 py-2.5">Food Item</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5 text-right">Prepared</th>
                  <th className="px-3 py-2.5 text-right">Donated</th>
                  <th className="px-3 py-2.5 text-right text-red-700">Discarded</th>
                  <th className="px-3 py-2.5 text-right">Discard Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {summary.frequentlyWasted.map((item, idx) => {
                  const rate = item.totalPrepared > 0 
                    ? Math.round((item.totalDiscarded / item.totalPrepared) * 100) 
                    : 0;

                  return (
                    <tr key={idx} className="hover:bg-canvas/60 transition-colors">
                      <td className="px-3 py-3 font-bold text-stone-900">
                        {item.name}
                      </td>
                      <td className="px-3 py-3 text-stone-500 font-medium">
                        {item.category}
                      </td>
                      <td className="px-3 py-3 text-right font-mono">
                        {item.totalPrepared} {item.unit}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-forest-800 font-bold">
                        {item.totalDonated} {item.unit}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-red-600 font-bold">
                        {item.totalDiscarded} {item.unit}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold">
                        <span className={`px-2 py-0.5 rounded ${
                          rate > 10 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kitchen Optimization Insights Card */}
        <div className="bg-forest-900 text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-terracotta-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Kitchen Optimization Insights</h3>
            <p className="text-xs text-forest-200 leading-relaxed">
              Tracking recurring surplus reveals over-preparation trends. If evening buffets consistently show 20–30% surplus, adjusting batch prep sizes saves ingredient purchase costs and lowers municipal disposal fees.
            </p>
            <div className="p-3 rounded-xl bg-forest-800/80 border border-forest-700 text-xs space-y-1">
              <span className="font-bold text-terracotta-300">Actionable Metric:</span>
              <p className="text-forest-200">
                Current Kitchen Donation Rate is <strong>{summary.avgDonationRate}%</strong>. Unaccounted plate loss averages ~{summary.totalUnaccounted} units.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDonationModal}
            className="w-full inline-flex items-center justify-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <span>Broadcast Remaining Surplus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 5. Detailed Daily Log Entries Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">Daily Food Waste & Disposition Ledger</h3>
            <p className="text-xs text-stone-500">Shift-by-shift reconciliation records</p>
          </div>
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-xl">
            {filteredEntries.length} Shift Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-subtle text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Date & Entity</th>
                <th className="px-4 py-3.5 font-semibold">Item & Category</th>
                <th className="px-4 py-3.5 font-semibold text-right">Prepared</th>
                <th className="px-4 py-3.5 font-semibold text-right">Sold / Served</th>
                <th className="px-4 py-3.5 font-semibold text-right text-forest-800">Donated</th>
                <th className="px-4 py-3.5 font-semibold text-right text-red-600">Discarded</th>
                <th className="px-4 py-3.5 font-semibold text-right">Est. Surplus</th>
                <th className="px-4 py-3.5 font-semibold text-right">Unaccounted</th>
                <th className="px-4 py-3.5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredEntries.map((item) => {
                const recon = computeEntryReconciliation(item);

                return (
                  <tr key={item.id} className="hover:bg-canvas/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-medium text-stone-900">{item.date}</div>
                      <div className="text-[10px] text-stone-400">{item.hotelOrg}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-stone-900">{item.itemName}</div>
                      <div className="text-[11px] text-stone-500">{item.category}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-medium">
                      {item.preparedQty} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-stone-600">
                      {item.soldOrServedQty} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-forest-800">
                      {item.donatedQty} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-red-600">
                      {item.discardedQty} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-stone-900">
                      {recon.estimatedSurplus} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      {recon.unaccountedQty > 0 ? (
                        <span className="text-amber-800 font-semibold" title="Plate scrapings or prep shrinkage">
                          +{recon.unaccountedQty} {item.unit}
                        </span>
                      ) : recon.unaccountedQty < 0 ? (
                        <span className="text-red-700 font-semibold" title="Disposition exceeds calculated surplus">
                          {recon.unaccountedQty} {item.unit}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">0 (Reconciled)</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleDeleteEntry(item)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal Form to Log Daily Entry */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-forest-900 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-800 text-terracotta-400 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Log Kitchen Prep & Waste Entry</h3>
                  <p className="text-xs text-forest-200">RescuePlate Waste Intelligence &bull; Daily Shift Reconciliation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs bg-forest-800 hover:bg-forest-700 text-terracotta-300 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Fill Demo</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Date <span className="text-terracotta-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-stone-900"
                  />
                  {formErrors.date && <p className="text-red-600 mt-1">{formErrors.date}</p>}
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Hotel / Banquet Entity Name
                  </label>
                  <input
                    type="text"
                    name="hotelOrg"
                    value={formData.hotelOrg}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Food Item / Spread Description <span className="text-terracotta-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    placeholder="e.g. Lunch Buffet Dum Biryani & Dal"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                  />
                  {formErrors.itemName && <p className="text-red-600 mt-1">{formErrors.itemName}</p>}
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
                  >
                    {FOOD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Quantities Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Prepared <span className="text-terracotta-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="preparedQty"
                    value={formData.preparedQty}
                    onChange={handleInputChange}
                    placeholder="100"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 font-mono"
                  />
                  {formErrors.preparedQty && <p className="text-red-600 mt-1">{formErrors.preparedQty}</p>}
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Sold / Served <span className="text-terracotta-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="soldOrServedQty"
                    value={formData.soldOrServedQty}
                    onChange={handleInputChange}
                    placeholder="75"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 font-mono"
                  />
                  {formErrors.soldOrServedQty && <p className="text-red-600 mt-1">{formErrors.soldOrServedQty}</p>}
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-forest-800 mb-1">
                    Donated
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="donatedQty"
                    value={formData.donatedQty}
                    onChange={handleInputChange}
                    placeholder="20"
                    className="w-full px-3 py-2 rounded-xl border border-forest-300 text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-red-700 mb-1">
                    Discarded
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="discardedQty"
                    value={formData.discardedQty}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="w-full px-3 py-2 rounded-xl border border-red-300 text-stone-900 font-mono"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
                  >
                    {QUANTITY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Live Reconciliation Preview */}
              {formData.preparedQty && formData.soldOrServedQty && (
                <div className="p-3 bg-canvas-subtle rounded-2xl border border-stone-200 text-xs space-y-1">
                  <span className="font-bold text-stone-900">Reconciliation Preview:</span>
                  <div className="flex flex-wrap gap-4 text-stone-600">
                    <span>Est. Surplus: <strong>{Math.max(0, Number(formData.preparedQty) - Number(formData.soldOrServedQty))} {formData.unit}</strong></span>
                    <span>Disposition: <strong>{(Number(formData.donatedQty) || 0) + (Number(formData.discardedQty) || 0)} {formData.unit}</strong></span>
                    <span>Unaccounted: <strong>{Math.max(0, Number(formData.preparedQty) - Number(formData.soldOrServedQty)) - ((Number(formData.donatedQty) || 0) + (Number(formData.discardedQty) || 0))} {formData.unit}</strong></span>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Shift Notes / Spoilage Reason (Optional)
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Lower banquet attendance than booked; high quality surplus dispatched to shelter."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold shadow-xs"
                >
                  Save Shift Log
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
