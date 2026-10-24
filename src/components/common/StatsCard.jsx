import React from 'react';

/**
 * Metric card component for high-readability numerical and impact stats.
 */
export function StatsCard({ icon: Icon, title, value, subtitle, trend, accent = "forest" }) {
  const accentBorder = 
    accent === 'terracotta' ? 'hover:border-terracotta-300' :
    accent === 'amber' ? 'hover:border-amber-300' :
    'hover:border-forest-400';

  const iconBg = 
    accent === 'terracotta' ? 'bg-terracotta-100 text-terracotta-700' :
    accent === 'amber' ? 'bg-amber-100 text-amber-800' :
    'bg-forest-100 text-forest-800';

  return (
    <div className={`bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm transition-all duration-200 ${accentBorder}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-stone-900">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-stone-500 leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
