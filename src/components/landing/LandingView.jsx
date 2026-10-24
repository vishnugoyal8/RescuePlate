import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Utensils, 
  MapPin, 
  HeartHandshake, 
  Award,
  Layers,
  Leaf
} from 'lucide-react';
import { useDonations } from '../../context/DonationContext';
import { useAuth } from '../../context/AuthContext';
import { StatsCard } from '../common/StatsCard';

export function LandingView({ setActiveTab, onOpenDonationModal }) {
  const { donations } = useDonations();
  const { currentUser, isAuthenticated } = useAuth();

  // Dynamic calculations based on current state (including new donations added by user)
  const totalDonations = donations.length;
  const deliveredDonations = donations.filter(d => d.status === 'Delivered');
  const availableCount = donations.filter(d => d.status === 'Available').length;
  
  // Total estimated meals rescued
  const estimatedMeals = donations.reduce((sum, item) => {
    if (item.unit === 'meals' || item.unit === 'servings') {
      return sum + item.quantity;
    }
    // approximate: 1 kg ~ 2.5 meals
    return sum + Math.round((item.estimatedWeightKg || (item.quantity * 0.4)) * 2.5);
  }, 0);

  return (
    <div className="space-y-16 py-6 sm:py-10">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-stone-200/90 shadow-sm p-8 sm:p-14 lg:p-16">
        <div className="max-w-3xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Tech Yuva Build-A-Thon 2026 &bull; Problem Statement PS-43</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-forest-950 tracking-tight leading-[1.15]">
            Bridging surplus food to communities in need.
          </h1>

          <p className="text-lg sm:text-xl text-stone-600 font-normal leading-relaxed">
            <strong className="font-semibold text-stone-900">RescuePlate</strong> connects banquet halls, caterers, corporate cafeterias, and bakeries directly with verified local NGOs. We turn potential food waste into immediate nutrition.
          </p>

          <p className="text-sm font-medium text-terracotta-600 tracking-wide uppercase">
            Good food. Better futures.
          </p>

          {/* Role-Aware Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {!isAuthenticated && (
              <>
                <button
                  onClick={onOpenDonationModal}
                  className="inline-flex items-center gap-2.5 bg-forest-800 hover:bg-forest-900 text-white text-base font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98"
                >
                  <span>Donate Food (Sign In)</span>
                  <ArrowRight className="w-4 h-4 text-terracotta-400" />
                </button>

                <button
                  onClick={() => setActiveTab('ngo')}
                  className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-base font-semibold px-6 py-3.5 rounded-xl border border-stone-300/80 transition-all active:scale-98"
                >
                  <span>Claim Surplus (NGO Sign In)</span>
                </button>
              </>
            )}

            {isAuthenticated && currentUser?.role === 'donor' && (
              <>
                <button
                  onClick={onOpenDonationModal}
                  className="inline-flex items-center gap-2.5 bg-forest-800 hover:bg-forest-900 text-white text-base font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98"
                >
                  <span>Post New Food Donation</span>
                  <ArrowRight className="w-4 h-4 text-terracotta-400" />
                </button>

                <button
                  onClick={() => setActiveTab('donor')}
                  className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-base font-semibold px-6 py-3.5 rounded-xl border border-stone-300/80 transition-all active:scale-98"
                >
                  <span>Open Donor Hub</span>
                </button>
              </>
            )}

            {isAuthenticated && currentUser?.role === 'ngo' && (
              <>
                <button
                  onClick={() => setActiveTab('ngo')}
                  className="inline-flex items-center gap-2.5 bg-forest-800 hover:bg-forest-900 text-white text-base font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98"
                >
                  <span>Explore Available Food ({availableCount})</span>
                  <ArrowRight className="w-4 h-4 text-terracotta-400" />
                </button>

                <button
                  onClick={() => setActiveTab('traceability')}
                  className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-base font-semibold px-6 py-3.5 rounded-xl border border-stone-300/80 transition-all active:scale-98"
                >
                  <span>View Custody Timeline</span>
                </button>
              </>
            )}
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Food Quality</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Rapid Response Logistics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Zero Landfill Policy</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative stamp */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <Utensils className="w-72 h-72 text-forest-800" />
        </div>
      </section>

      {/* The Problem Statement (PS-43 Focus) */}
      <section className="bg-canvas-subtle rounded-3xl p-8 sm:p-12 border border-stone-200">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
            The Problem Statement (PS-43)
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Why commercial food surplus rarely reaches those who need it.
          </h2>
          <p className="mt-4 text-stone-600 leading-relaxed text-base">
            Every night in urban centers, commercial events and restaurants prepare delicious meals that go unserved. Meanwhile, local shelters and community kitchens struggle with daily ingredient costs. 
            The barrier isn't a lack of food—it is <strong className="text-stone-900">time-critical coordination</strong>. Food expires quickly, and traditional charities lack an instant, structured digital channel to discover and claim surplus before it spoils.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-900">Spolage Window</h3>
            <p className="mt-2 text-sm text-stone-500 leading-relaxed">
              Cooked food has a perishable safety limit of 3 to 6 hours. Traditional paper or slow phone chains cause food to be discarded before an NGO can arrive.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-900">Hyperlocal Visibility</h3>
            <p className="mt-2 text-sm text-stone-500 leading-relaxed">
              Donors don't know which shelters within a 5 km radius currently have storage capacity, refrigeration, or transport volunteers available.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-900">Safety & Trust Verification</h3>
            <p className="mt-2 text-sm text-stone-500 leading-relaxed">
              Donors worry about safety compliance, while NGOs need clear information on dietary category, preparation time, and packaging condition.
            </p>
          </div>
        </div>
      </section>

      {/* Real-Time Platform Impact Stats */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Community Impact Snapshot
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Live figures aggregated across our community network
            </p>
          </div>
          <button
            onClick={() => setActiveTab('impact')}
            className="mt-3 sm:mt-0 text-sm font-semibold text-forest-800 hover:text-forest-900 flex items-center gap-1 group"
          >
            <span>View Full Impact Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard 
            icon={Utensils}
            title="Estimated Meals Rescued"
            value={estimatedMeals.toLocaleString()}
            subtitle="Calculated at 400g standard nutritional serving"
            trend="+12% this week"
            accent="forest"
          />
          <StatsCard 
            icon={Layers}
            title="Total Food Listings"
            value={totalDonations}
            subtitle={`${availableCount} currently ready for pickup`}
            accent="amber"
          />
          <StatsCard 
            icon={Award}
            title="Successfully Delivered"
            value={deliveredDonations.length}
            subtitle="Closed-loop verified distributions"
            accent="forest"
          />
          <StatsCard 
            icon={Clock}
            title="Avg. NGO Response"
            value="42 min"
            subtitle="From listing submission to NGO claim"
            accent="terracotta"
          />
        </div>
      </section>

      {/* How RescuePlate Works */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/90 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
            Streamlined 3-Step Flow
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900">
            How RescuePlate works for Donors and NGOs
          </h2>
          <p className="mt-3 text-stone-500 text-sm">
            Zero friction, mobile-ready, designed for fast kitchen turnarounds during closing hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="relative space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white font-extrabold text-lg flex items-center justify-center shadow-md mx-auto sm:mx-0">
              1
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Post Surplus in Under 60 Seconds
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              Donors input food description, category, estimated quantity, collection window, and pickup contact. No lengthy paperwork.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenDonationModal}
                className="text-xs font-semibold text-forest-800 hover:underline inline-flex items-center gap-1"
              >
                <span>Try Posting a Donation</span> &rarr;
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-terracotta-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md mx-auto sm:mx-0">
              2
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Nearby Verified NGOs Claim
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              Shelters and food banks see urgent listings sorted by spoilage urgency and location. They claim with one tap to dispatch volunteer couriers.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('ngo')}
                className="text-xs font-semibold text-terracotta-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Open NGO Portal</span> &rarr;
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white font-extrabold text-lg flex items-center justify-center shadow-md mx-auto sm:mx-0">
              3
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Track Pickup to Delivery
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              Transparent 4-step pipeline: Available &rarr; Claimed &rarr; Picked Up &rarr; Delivered. Both donor and NGO keep an auditable record of community impact.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('traceability')}
                className="text-xs font-semibold text-stone-700 hover:underline inline-flex items-center gap-1"
              >
                <span>View Custody Timeline</span> &rarr;
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Quick Action Footer Banner */}
      <section className="bg-forest-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Have edible food left over today?</h3>
          <p className="text-forest-200 text-sm mt-1 max-w-xl">
            Don't let prepared meals go to waste. A verified community partner is ready to distribute it to families in need.
          </p>
        </div>
        <button
          onClick={onOpenDonationModal}
          className="whitespace-nowrap bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold px-6 py-3.5 rounded-xl shadow transition-all active:scale-98"
        >
          Post a Donation Now
        </button>
      </section>

    </div>
  );
}
