import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  HeartHandshake,
  Building2,
  UtensilsCrossed,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function LoginPage({ onNavigate, redirectAfterLogin }) {
  const { login, loginWithDemo, backendConnected } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        // Authenticate first -> Identify role -> Authorize access -> Open permitted dashboard
        const role = result.user.role;
        const donorAllowed = ['donor', 'hotel', 'traceability', 'verification', 'impact'];
        const ngoAllowed = ['ngo', 'traceability', 'verification', 'impact'];

        if (redirectAfterLogin && role === 'donor' && donorAllowed.includes(redirectAfterLogin)) {
          onNavigate(redirectAfterLogin);
        } else if (redirectAfterLogin && role === 'ngo' && ngoAllowed.includes(redirectAfterLogin)) {
          onNavigate(redirectAfterLogin);
        } else if (role === 'admin') {
          onNavigate('verification');
        } else {
          // Open default permitted dashboard based on identified role
          onNavigate(role === 'donor' ? 'donor' : 'ngo');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoKey) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const result = await loginWithDemo(demoKey);
      if (result.success) {
        if (result.user.role === 'admin') {
          onNavigate('verification');
        } else if (result.user.role === 'donor') {
          onNavigate('donor');
        } else {
          onNavigate('ngo');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Quick demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-md mx-auto animate-fadeIn">
      
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest-800 text-white shadow-md mb-3">
          <HeartHandshake className="w-6 h-6 text-terracotta-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
          Welcome back to RescuePlate
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Good food. Better futures. Sign in to your dashboard.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-medium text-forest-700 hover:text-forest-900 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign in to RescuePlate</span>
                <ArrowRight className="w-4 h-4 text-terracotta-400" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-widest shrink-0">
            Tech Yuva Demo Logins
          </span>
        </div>

        {/* 1-Click Judge Demo Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('donor')}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-forest-700 bg-stone-50/70 hover:bg-forest-50/40 text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Chef Vikram (Verified Donor)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">VERIFIED</span>
                </div>
                <div className="text-[11px] text-stone-500">Grand Pearl Banquet & Hotel</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-forest-700 transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('ngo')}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-forest-700 bg-stone-50/70 hover:bg-forest-50/40 text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Dr. Sunita Rao (Verified NGO)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">VERIFIED</span>
                </div>
                <div className="text-[11px] text-stone-500">Asha Ek Kadam Relief Network</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-forest-700 transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('donor_pending')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-50/70 text-left transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-xs">
                ⚠️
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Virender Chawla (Pending KYC)</span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">PENDING</span>
                </div>
                <div className="text-[10px] text-stone-500">Tests Verification Gating Restrictions</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700 transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50/80 text-left transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 text-xs font-bold">
                🛡️
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Kavita Singhal (Chief Verifier)</span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">ADMIN</span>
                </div>
                <div className="text-[10px] text-stone-500">Access Verifier Console & Audit Records</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-blue-700 transition-colors" />
          </button>
        </div>

        {/* Footer Link to Register */}
        <div className="text-center pt-2 text-xs text-stone-500">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="font-semibold text-forest-800 hover:text-forest-950 underline transition-colors"
          >
            Register your organization
          </button>
        </div>

      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Protected with HttpOnly cookies, bcrypt hashing & rate limiting</span>
      </div>

    </div>
  );
}
