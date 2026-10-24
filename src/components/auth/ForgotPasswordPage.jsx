import React, { useState } from 'react';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Info 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ForgotPasswordPage({ onNavigate }) {
  const { requestPasswordReset, resetPassword } = useAuth();

  const [step, setStep] = useState(1); // 1 = request token, 2 = enter new password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await requestPasswordReset(email.trim());
      setSuccessMessage(res.message);
      if (res.demoResetToken) {
        setResetToken(res.demoResetToken);
      }
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to request password reset token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(email.trim(), resetToken.trim(), newPassword, confirmPassword);
      setSuccessMessage(res.message);
      setTimeout(() => {
        onNavigate('login');
      }, 1800);
    } catch (err) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-md mx-auto animate-fadeIn">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest-800 text-white shadow-md mb-3">
          <KeyRound className="w-6 h-6 text-terracotta-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
          Password Recovery
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {step === 1 ? "Enter your registered email to receive a recovery token." : "Enter your recovery token and new password."}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-5">
        
        {/* Status Messages */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="leading-relaxed">{successMessage}</div>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Registered Email Address
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? "Generating Token..." : "Send Recovery Token"}
              <ArrowRight className="w-4 h-4 text-terracotta-400" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            
            {resetToken && (
              <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-700">
                <span className="font-semibold block text-[11px] uppercase tracking-wider text-forest-800 mb-1">
                  Demo Token Auto-Filled:
                </span>
                <span className="font-mono text-[10px] break-all">{resetToken}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Reset Token
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste reset token here"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                New Password (Min 8 Chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? "Updating Password..." : "Set New Password & Log In"}
              <ArrowRight className="w-4 h-4 text-terracotta-400" />
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="pt-2 text-center border-t border-stone-100">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </button>
        </div>

      </div>

    </div>
  );
}
