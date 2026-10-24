import React from 'react';
import { 
  Leaf, 
  HeartHandshake, 
  BarChart3, 
  Share2, 
  Award, 
  ShieldCheck, 
  Info,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

/**
 * Restaurant Value Proposition Component (Task 3 - PS-43)
 * Explains clear, practical benefits for restaurants, caterers, and food businesses.
 * Does not make false promises of tax deductions, marketing guarantees, or government subsidies.
 */
export function DonorValueProposition({ onOpenDonationModal }) {
  const benefits = [
    {
      id: "reduce-waste",
      icon: Leaf,
      title: "1. Reduce Avoidable Commercial Food Waste",
      subtitle: "Kitchen Efficiency & Zero-Landfill Protocol",
      description: "Buffets, catered events, and bakeries often produce edible surplus. RescuePlate provides an immediate, safe alternative to municipal landfill dumping during end-of-day kitchen cleanups.",
      accent: "forest"
    },
    {
      id: "smart-matching",
      icon: HeartHandshake,
      title: "2. Connect Surplus with Suitable Recipient NGOs",
      subtitle: "No Phone Chains or Blind Dispatches",
      description: "Our explainable matching engine pairs your specific food category and temperature condition with nearby shelters that have actual open capacity and proper storage equipment.",
      accent: "amber"
    },
    {
      id: "verified-tracking",
      icon: BarChart3,
      title: "3. Track Completed Deliveries & Rescued Meals",
      subtitle: "Closed-Loop Hand-off Accountability",
      description: "Only donations verified by an NGO courier as 'Delivered' are counted as rescued food. You receive transparent logs with timestamps, courier details, and estimated plate equivalents.",
      accent: "forest"
    },
    {
      id: "shareable-impact",
      icon: Share2,
      title: "4. Generate Shareable Impact Summaries",
      subtitle: "Honest, Copyable Reporting for Stakeholders",
      description: "Export clean plain-text metrics detailing meals delivered and waste diverted. Use them in internal staff reports, sustainability updates, or client community presentations.",
      accent: "terracotta"
    },
    {
      id: "verifiable-record",
      icon: Award,
      title: "5. Build a Verifiable Record of Community Contribution",
      subtitle: "Transparent Community Partner Recognition",
      description: "Earn the RescuePlate Community Partner badge based on transparent milestones (e.g., 3 completed deliveries), creating an auditable track record of local social impact.",
      accent: "forest"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Introduction Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" />
          <span>Kitchen & Catering Partner Framework</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Why Commercial Kitchens Partner with RescuePlate
        </h2>
        
        <p className="text-sm sm:text-base text-stone-600 max-w-3xl leading-relaxed">
          Kitchen teams take immense pride in their cooking. Throwing away good food at the end of a shift hurts kitchen morale, clogs local waste streams, and creates logistical clutter. RescuePlate gives banquet halls, restaurants, and bakeries a streamlined, friction-free way to channel fresh surplus directly to verified community shelters.
        </p>

        {/* Honest Guardrail Disclaimer (Mandatory Requirement) */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparent Commitment:</span> RescuePlate provides verified operational matching and community accountability. We do not claim tax exemptions, government incentives, or guaranteed commercial customer growth. Our mission is honest, direct food rescue for communities in need.
          </div>
        </div>
      </div>

      {/* 5 Core Restaurant Benefits Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {benefits.map((b) => {
          const Icon = b.icon;
          const iconColor = 
            b.accent === 'terracotta' ? 'bg-terracotta-50 text-terracotta-600 border-terracotta-200' :
            b.accent === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-forest-50 text-forest-700 border-forest-200';

          return (
            <div
              key={b.id}
              className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    {b.subtitle}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-0.5">
                    {b.title}
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center text-[11px] font-semibold text-forest-800">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-600 mr-1.5" />
                <span>Verified RescuePlate Standard</span>
              </div>
            </div>
          );
        })}

        {/* Quick Action Post Card */}
        <div className="bg-forest-900 text-white p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-forest-800 text-terracotta-400 flex items-center justify-center border border-forest-700">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Have Surplus Ready Right Now?</h3>
            <p className="text-xs text-forest-200 leading-relaxed">
              Post surplus before your kitchen closes. Nearby shelters receive automated urgency alerts to dispatch couriers immediately.
            </p>
          </div>

          <button
            onClick={onOpenDonationModal}
            className="w-full inline-flex items-center justify-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <span>Post Surplus in 60 Seconds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
