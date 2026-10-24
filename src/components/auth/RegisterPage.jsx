import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  AlertCircle,
  UtensilsCrossed,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function RegisterPage({ onNavigate }) {
  const { register } = useAuth();

  const [role, setRole] = useState('donor'); // 'donor' | 'ngo'
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Indirapuram, Ghaziabad');
  const [capacity, setCapacity] = useState('50');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !orgName.trim() || !email.trim()) {
      setErrorMessage('Please fill in all required profile fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        fullName: fullName.trim(),
        orgName: orgName.trim(),
        email: email.trim(),
        role,
        phone: phone.trim(),
        locality: locality.trim(),
        capacity: role === 'ngo' ? capacity : undefined,
        password,
        confirmPassword
      });

      if (result.success) {
        if (role === 'donor') {
          onNavigate('donor');
        } else {
          onNavigate('ngo');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-xl mx-auto animate-fadeIn">
      
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-forest-100 text-forest-800 px-3 py-1 rounded-full mb-2">
          Organization Onboarding &bull; PS-43
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
          Join the RescuePlate Network
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Connect surplus food to verified community kitchens with end-to-end auditability.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Select Your Organization Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'donor'
                    ? 'border-forest-700 bg-forest-50/70 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <UtensilsCrossed className={`w-4 h-4 ${role === 'donor' ? 'text-forest-700' : 'text-stone-400'}`} />
                  <span className={`text-xs font-bold ${role === 'donor' ? 'text-forest-900' : 'text-stone-700'}`}>
                    Food Donor
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Hotels, banquets, restaurants & commercial catering kitchens.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('ngo')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'ngo'
                    ? 'border-purple-600 bg-purple-50/70 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className={`w-4 h-4 ${role === 'ngo' ? 'text-purple-700' : 'text-stone-400'}`} />
                  <span className={`text-xs font-bold ${role === 'ngo' ? 'text-purple-900' : 'text-stone-700'}`}>
                    Recipient NGO
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Shelters, food banks, charities & verified hunger relief operations.
                </p>
              </button>
            </div>
          </div>

          {/* Full Name & Organization Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Full Name / Contact Lead
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Chef Vikram Sethi"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                {role === 'donor' ? 'Restaurant / Banquet Name' : 'NGO / Foundation Name'}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder={role === 'donor' ? "Grand Pearl Hotel" : "Asha Relief Network"}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@org.org"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98100 12345"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                />
              </div>
            </div>
          </div>

          {/* Locality & Role-Specific field */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Operating Locality
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                >
                  <option value="Indirapuram, Ghaziabad">Indirapuram, Ghaziabad</option>
                  <option value="Sector 18, Noida">Sector 18, Noida</option>
                  <option value="Connaught Place, New Delhi">Connaught Place, New Delhi</option>
                  <option value="Mayur Vihar, East Delhi">Mayur Vihar, East Delhi</option>
                  <option value="Laxmi Nagar, Delhi">Laxmi Nagar, Delhi</option>
                  <option value="Saket, South Delhi">Saket, South Delhi</option>
                  <option value="Rohini, North Delhi">Rohini, North Delhi</option>
                </select>
              </div>
            </div>

            {role === 'ngo' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Meal Intake Capacity (Portions)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="50"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Kitchen Category
                </label>
                <div className="py-2.5 px-3.5 text-xs text-stone-600 bg-stone-100 rounded-xl border border-stone-200/80">
                  Commercial Kitchen & Banquet Hospitality
                </div>
              </div>
            )}
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Password (Min 8 Chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 bg-stone-50/50"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Safe KYC Disclaimer */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="leading-relaxed">
              <span className="font-semibold">Simulated KYC Policy:</span> Newly registered accounts start in <span className="font-semibold text-amber-800 font-mono">Pending Review</span> status. In adherence to privacy standards, RescuePlate never collects government ID cards, Aadhaar, or PAN for hackathon evaluations.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating organization account...
              </span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4 text-terracotta-400" />
              </>
            )}
          </button>
        </form>

        {/* Existing account link */}
        <div className="text-center pt-2 text-xs text-stone-500">
          Already registered?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="font-semibold text-forest-800 hover:text-forest-950 underline transition-colors"
          >
            Sign in to existing account
          </button>
        </div>

      </div>

    </div>
  );
}
