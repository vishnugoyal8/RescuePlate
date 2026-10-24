import React from 'react';
import { Sparkles, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

/**
 * MatchScoreBadge displays the algorithmic compatibility score (0 - 100%)
 * with clear qualitative tiering and high readability.
 */
export function MatchScoreBadge({ score, isEligible = true, size = "md" }) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs font-bold";

  if (!isEligible || score === 0) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
        <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
        <span>Ineligible Match</span>
      </span>
    );
  }

  if (score >= 85) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs ${sizeClasses}`}>
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
        <span>{score}% Match &bull; Top Fit</span>
      </span>
    );
  }

  if (score >= 70) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-forest-50 text-forest-900 border border-forest-200 ${sizeClasses}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
        <span>{score}% Match &bull; Good Fit</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 ${sizeClasses}`}>
      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
      <span>{score}% Match &bull; Moderate Fit</span>
    </span>
  );
}
