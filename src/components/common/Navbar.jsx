import React, { useState } from 'react';
import { 
  HeartHandshake, 
  PlusCircle, 
  RotateCcw, 
  Menu, 
  X, 
  LayoutDashboard, 
  Building2, 
  Truck, 
  Home,
  UtensilsCrossed,
  QrCode,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { useDonations } from '../../context/DonationContext';
import { useAuth } from '../../context/AuthContext';

export function Navbar({ activeTab, setActiveTab, onOpenDonationModal }) {
  const { resetToSampleData } = useDonations();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Dynamic role-aware navigation tabs
  const getNavItems = () => {
    const items = [
      { id: 'overview', label: 'Overview', icon: Home }
    ];

    if (isAuthenticated) {
      if (currentUser?.role === 'donor') {
        items.push(
          { id: 'donor', label: 'Donor Hub', icon: LayoutDashboard },
          { id: 'hotel', label: 'Hotel Waste', icon: UtensilsCrossed }
        );
      } else if (currentUser?.role === 'ngo') {
        items.push(
          { id: 'ngo', label: 'NGO Portal', icon: Building2 }
        );
      }

      // Shared authenticated audit & compliance modules
      items.push(
        { id: 'traceability', label: 'Traceability & Timeline', icon: QrCode },
        { 
          id: 'verification', 
          label: currentUser?.role === 'admin' ? 'Verifier Console' : 'KYC & Trust', 
          icon: ShieldCheck 
        }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    setActiveTab('overview');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Top Banner for Tech Yuva Hackathon */}
      <div className="bg-forest-900 text-forest-100 text-[11px] sm:text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-terracotta-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase">
              Tech Yuva 2026
            </span>
            <span className="font-medium text-stone-200 truncate">
              Problem Statement PS-43: Community Food Donation Matcher & Waste Intelligence
            </span>
          </div>
          <button
            onClick={resetToSampleData}
            title="Reset localStorage to default demonstration records"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-forest-200 hover:text-white transition-colors underline decoration-dotted shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => handleTabClick('overview')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-md group-hover:bg-forest-900 transition-colors">
              <HeartHandshake className="w-4 h-4 text-terracotta-400" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-extrabold tracking-tight text-forest-950 font-sans">
                  RescuePlate
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500"></span>
              </div>
              <p className="text-[10px] font-medium text-stone-500 -mt-0.5 hidden xl:block">
                Good food. Better futures.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl text-xs xl:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-forest-50 text-forest-800 font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 ${isActive ? 'text-forest-700' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            
            {/* Donate button for Donors or guests */}
            {(!isAuthenticated || currentUser?.role === 'donor') && (
              <button
                onClick={onOpenDonationModal}
                className="inline-flex items-center gap-1.5 bg-forest-800 hover:bg-forest-900 text-white text-xs xl:text-sm font-semibold px-3 py-2 xl:px-4 xl:py-2 rounded-xl shadow-xs hover:shadow transition-all duration-150 active:scale-98"
              >
                <PlusCircle className="w-4 h-4 text-terracotta-400" />
                <span>Donate Food</span>
              </button>
            )}

            {/* Authenticated User Pill / Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-forest-800 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[120px]">
                      {currentUser.fullName}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-500">
                      <span className="font-semibold text-forest-800 uppercase">
                        {currentUser.role === 'admin' ? 'Verifier' : currentUser.role === 'donor' ? 'Donor' : 'NGO'}
                      </span>
                      <span>&bull;</span>
                      <span className={currentUser.verificationStatus === 'Verified' ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                        {currentUser.verificationStatus}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900">{currentUser.fullName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                      <p className="text-[11px] font-medium text-forest-800 mt-0.5 truncate">{currentUser.orgName}</p>
                    </div>

                    <div className="p-1 space-y-1">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleTabClick('verification')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-forest-50 hover:text-forest-900 text-left"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                          <span>Verifier & KYC Console</span>
                        </button>
                      )}

                      {currentUser.role === 'donor' && (
                        <button
                          onClick={() => handleTabClick('donor')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-forest-50 hover:text-forest-900 text-left"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-forest-700" />
                          <span>Donor Hub Dashboard</span>
                        </button>
                      )}

                      {currentUser.role === 'ngo' && (
                        <button
                          onClick={() => handleTabClick('ngo')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-forest-50 hover:text-forest-900 text-left"
                        >
                          <Building2 className="w-3.5 h-3.5 text-purple-700" />
                          <span>NGO Dispatch Portal</span>
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 text-left transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated Buttons */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTabClick('login')}
                  className="flex items-center gap-1.5 text-xs xl:text-sm font-semibold text-stone-700 hover:text-stone-900 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-forest-800" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => handleTabClick('register')}
                  className="hidden xl:inline-flex items-center gap-1 text-xs xl:text-sm font-semibold text-white bg-forest-800 hover:bg-forest-900 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                >
                  <span>Register</span>
                </button>
              </div>
            )}

          </div>

          {/* Mobile/Tablet menu button */}
          <div className="flex lg:hidden items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={() => handleTabClick('login')}
                className="text-xs font-bold text-forest-800 px-2 py-1 rounded bg-forest-50"
              >
                Sign In
              </button>
            ) : (
              <div className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-lg">
                {currentUser?.role === 'donor' ? 'Donor' : 'NGO'}
              </div>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile/Tablet Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg max-h-[85vh] overflow-y-auto">
          {isAuthenticated && (
            <div className="p-3 bg-stone-50 rounded-xl mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-900">{currentUser.fullName}</p>
                <p className="text-[11px] text-stone-500">{currentUser.orgName} ({currentUser.role})</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-700 font-semibold underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-left transition-all ${
                  isActive
                    ? 'bg-forest-50 text-forest-800 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-forest-700' : 'text-stone-400'}`} />
                {item.label}
              </button>
            );
          })}

          {!isAuthenticated && (
            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => handleTabClick('login')}
                className="flex-1 py-2 text-center text-xs font-semibold bg-forest-800 text-white rounded-xl"
              >
                Sign In
              </button>
              <button
                onClick={() => handleTabClick('register')}
                className="flex-1 py-2 text-center text-xs font-semibold border border-stone-200 text-stone-700 rounded-xl"
              >
                Register
              </button>
            </div>
          )}
          
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 px-1">
            <span>Demo Data State: active</span>
            <button
              onClick={() => {
                resetToSampleData();
                setMobileMenuOpen(false);
              }}
              className="text-forest-700 font-semibold underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
