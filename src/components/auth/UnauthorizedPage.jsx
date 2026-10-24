import React from 'react';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Home, 
  LayoutDashboard, 
  Building2, 
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function UnauthorizedPage({ onNavigate, attemptedTab }) {
  const { currentUser } = useAuth();

  const userRole = currentUser ? currentUser.role : 'unauthenticated';
  const roleTitle = userRole === 'donor' ? 'Food Donor' : userRole === 'ngo' ? 'Recipient NGO' : 'Anonymous Guest';

  const getRequiredRoleMessage = () => {
    if (attemptedTab === 'donor' || attemptedTab === 'hotel') {
      return {
        target: "Donor Hub & Hotel Waste Intelligence",
        required: "Food Donor / Commercial Kitchen",
        reason: "These modules allow logging commercial surplus batches and managing kitchen production schedules. Recipient NGOs cannot modify commercial food inventory."
      };
    }
    if (attemptedTab === 'ngo') {
      return {
        target: "NGO Dispatch & Matching Portal",
        required: "Recipient NGO",
        reason: "This portal displays live intake matching and reservation claims. Donors cannot reserve or claim their own food dispatches."
      };
    }
    return {
      target: "Protected Dashboard",
      required: "Authorized Role",
      reason: "This action requires specific role authorization to maintain food safety and custody integrity."
    };
  };

  const context = getRequiredRoleMessage();

  return (
    <div className="py-16 sm:py-20 max-w-2xl mx-auto text-center animate-fadeIn">
      
      {/* Icon */}
      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-full mb-3">
        HTTP 403 Forbidden &bull; Role-Based Access Control
      </span>

      <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight font-serif mb-3">
        Access Restricted
      </h1>

      <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed mb-8">
        You are currently logged in as <strong className="text-stone-900">{currentUser?.fullName || "Guest"}</strong> ({roleTitle}). You do not have the required permissions to access <strong className="text-stone-900">{context.target}</strong>.
      </p>

      {/* Explanatory Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 text-left space-y-4 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-forest-700" />
          Security & Separation of Concerns Policy
        </h3>

        <div className="space-y-3 text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-stone-900 w-32 shrink-0">Attempted Module:</span>
            <span>{context.target}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-stone-900 w-32 shrink-0">Required Role:</span>
            <span className="font-semibold text-forest-800">{context.required}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-stone-900 w-32 shrink-0">Your Active Role:</span>
            <span className="font-semibold text-rose-700">{roleTitle}</span>
          </div>
          <div className="flex items-start gap-2 pt-1 border-t border-stone-200">
            <span className="font-semibold text-stone-900 w-32 shrink-0">Rationale:</span>
            <span className="text-stone-600">{context.reason}</span>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {currentUser?.role === 'donor' && (
          <button
            onClick={() => onNavigate('donor')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-terracotta-400" />
            <span>Go to Donor Hub</span>
          </button>
        )}

        {currentUser?.role === 'ngo' && (
          <button
            onClick={() => onNavigate('ngo')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            <Building2 className="w-4 h-4 text-terracotta-400" />
            <span>Go to NGO Portal</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('overview')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-colors"
        >
          <Home className="w-4 h-4 text-stone-500" />
          <span>Return to Overview</span>
        </button>
      </div>

    </div>
  );
}
