import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, PackageCheck, AlertCircle } from 'lucide-react';

/**
 * StatusBadge renders discrete lifecycle states:
 * Available | Claimed | Picked Up | Delivered
 */
export function StatusBadge({ status, size = "md" }) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs font-semibold";

  switch (status) {
    case 'Available':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Available
        </span>
      );
    case 'Claimed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/90 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Claimed
        </span>
      );
    case 'Picked Up':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-900 border border-sky-200/80 ${sizeClasses}`}>
          <PackageCheck className="w-3.5 h-3.5 text-sky-600" />
          Picked Up
        </span>
      );
    case 'Delivered':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200/90 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
          Delivered
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}

/**
 * UrgencyBadge shows time urgency for food spoilage prevention:
 * High (<3h) | Moderate (3-6h) | Normal (>6h)
 */
export function UrgencyBadge({ urgency, size = "md" }) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  switch (urgency) {
    case 'High':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-terracotta-50 text-terracotta-700 border border-terracotta-200 font-semibold ${sizeClasses}`}>
          <AlertTriangle className="w-3 h-3 text-terracotta-500" />
          Urgent &bull; &lt; 3h
        </span>
      );
    case 'Moderate':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-amber-600" />
          Moderate &bull; &lt; 6h
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-stone-100 text-stone-600 border border-stone-200 font-medium ${sizeClasses}`}>
          Normal Window
        </span>
      );
  }
}

/**
 * SampleDataTag clearly labels mock/seed data to satisfy hackathon rules
 */
export function SampleDataTag() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase rounded bg-stone-100 text-stone-500 border border-stone-200/70" title="This is preloaded demonstration data for hackathon evaluation">
      <AlertCircle className="w-3 h-3 text-stone-400" />
      Sample Data
    </span>
  );
}
