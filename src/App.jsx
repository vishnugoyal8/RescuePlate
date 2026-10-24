import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DonationProvider } from './context/DonationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { NotificationToast } from './components/common/NotificationToast';
import { LandingView } from './components/landing/LandingView';
import { DonorDashboard } from './components/donor/DonorDashboard';
import { NgoDashboard } from './components/ngo/NgoDashboard';
import { ImpactView } from './components/impact/ImpactView';
import { HotelWasteDashboard } from './components/hotel/HotelWasteDashboard';
import { VerificationView } from './components/verification/VerificationView';
import { TraceabilityView } from './components/traceability/TraceabilityView';
import { DonationFormModal } from './components/donor/DonationFormModal';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { UnauthorizedPage } from './components/auth/UnauthorizedPage';
import { AlertCircle } from 'lucide-react';

/**
 * Helper to resolve active tab from browser URL path
 */
function resolvePathToTab(pathname) {
  const cleaned = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!cleaned || cleaned === 'index.html' || cleaned === 'overview') return 'overview';
  // Redirect legacy /tracking or /pipeline URLs directly to the consolidated traceability timeline
  if (cleaned === 'tracking' || cleaned === 'pipeline') return 'traceability';
  // Sustainability section is temporarily disabled
  if (cleaned === 'sustainability') return 'overview';
  const validTabs = [
    'login', 'register', 'forgot-password', 'unauthorized',
    'donor', 'ngo', 'hotel', 'traceability', 'verification', 
    'impact'
  ];
  return validTabs.includes(cleaned) ? cleaned : 'overview';
}

function MainContent() {
  const { currentUser, isAuthenticated, isLoading, authNotice } = useAuth();
  
  // Initialize tab from current browser URL path
  const [activeTab, setActiveTab] = useState(() => resolvePathToTab(window.location.pathname));
  const [attemptedTab, setAttemptedTab] = useState(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync browser URL with activeTab
  const handleNavigate = (newTab) => {
    const protectedDonorTabs = ['donor', 'hotel'];
    const protectedNgoTabs = ['ngo'];
    const publicTabs = ['overview', 'login', 'register', 'forgot-password', 'unauthorized'];

    // 1. Route Guard for Unauthenticated Users:
    // Any protected tab access redirects immediately to login
    if (!isAuthenticated) {
      if (!publicTabs.includes(newTab)) {
        setRedirectAfterLogin(newTab);
        setActiveTab('login');
        if (window.location.pathname !== '/login') {
          window.history.pushState({}, '', '/login');
        }
        return;
      }
    }

    // 2. Role-Based Access Control (RBAC) Route Guards for Authenticated Users
    if (isAuthenticated) {
      // Donors cannot access NGO-only portal
      if (currentUser?.role === 'donor' && protectedNgoTabs.includes(newTab)) {
        setAttemptedTab(newTab);
        setActiveTab('unauthorized');
        window.history.pushState({}, '', '/unauthorized');
        return;
      }

      // NGOs cannot access Donor-only hubs or Hotel Waste
      if (currentUser?.role === 'ngo' && protectedDonorTabs.includes(newTab)) {
        setAttemptedTab(newTab);
        setActiveTab('unauthorized');
        window.history.pushState({}, '', '/unauthorized');
        return;
      }

      // If already authenticated, redirect away from login/register to assigned role dashboard
      if (newTab === 'login' || newTab === 'register') {
        const target = currentUser?.role === 'donor' ? 'donor' : 'ngo';
        setActiveTab(target);
        window.history.pushState({}, '', `/${target}`);
        return;
      }
    }

    // Safe permitted navigation
    setActiveTab(newTab);
    const path = newTab === 'overview' ? '/' : `/${newTab}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  // Listen to browser Back and Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const tabFromUrl = resolvePathToTab(window.location.pathname);
      handleNavigate(tabFromUrl);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, currentUser]);

  // Initial Route Guard evaluation once session loading completes
  useEffect(() => {
    if (!isLoading) {
      handleNavigate(activeTab);
    }
  }, [isLoading]);

  // Gated modal open: Donors only. Unauthenticated prompted to login.
  const handleOpenModal = () => {
    if (!isAuthenticated) {
      setRedirectAfterLogin('donor');
      handleNavigate('login');
      return;
    }
    if (currentUser?.role !== 'donor') {
      setAttemptedTab('donor');
      handleNavigate('unauthorized');
      return;
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  // Full-page secure session restoration loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-forest-800 text-white flex items-center justify-center mx-auto shadow-md">
            <div className="w-6 h-6 border-2 border-forest-200 border-t-terracotta-400 rounded-full animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-bold text-forest-950 font-serif">RescuePlate</h2>
            <p className="text-xs text-stone-500 mt-1 font-medium">Authenticating secure session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-stone-800 font-sans">
      
      {/* Sticky Global Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleNavigate}
        onOpenDonationModal={handleOpenModal}
      />

      {/* Offline Prototype Demo Banner if Backend is not connected */}
      {authNotice && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-950 text-xs py-2 px-4 text-center font-medium">
          ℹ️ {authNotice}
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Authentication Pages */}
        {activeTab === 'login' && (
          <LoginPage 
            onNavigate={handleNavigate}
            redirectAfterLogin={redirectAfterLogin}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage 
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'forgot-password' && (
          <ForgotPasswordPage 
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'unauthorized' && (
          <UnauthorizedPage 
            onNavigate={handleNavigate}
            attemptedTab={attemptedTab}
          />
        )}

        {/* Public Landing View */}
        {activeTab === 'overview' && (
          <LandingView 
            setActiveTab={handleNavigate} 
            onOpenDonationModal={handleOpenModal} 
          />
        )}

        {/* Protected Donor Views with Double-Lock Component Level Guards */}
        {activeTab === 'donor' && (
          isAuthenticated && currentUser?.role === 'donor' ? (
            <DonorDashboard 
              setActiveTab={handleNavigate} 
              onOpenDonationModal={handleOpenModal} 
            />
          ) : (
            <UnauthorizedPage 
              onNavigate={handleNavigate} 
              attemptedTab="donor" 
            />
          )
        )}

        {activeTab === 'hotel' && (
          isAuthenticated && currentUser?.role === 'donor' ? (
            <HotelWasteDashboard 
              onOpenDonationModal={handleOpenModal}
            />
          ) : (
            <UnauthorizedPage 
              onNavigate={handleNavigate} 
              attemptedTab="hotel" 
            />
          )
        )}

        {/* Protected NGO View with Double-Lock Component Level Guard */}
        {activeTab === 'ngo' && (
          isAuthenticated && currentUser?.role === 'ngo' ? (
            <NgoDashboard 
              setActiveTab={handleNavigate} 
            />
          ) : (
            <UnauthorizedPage 
              onNavigate={handleNavigate} 
              attemptedTab="ngo" 
            />
          )
        )}

        {/* Shared Authenticated Dispatches & Audit Modules */}
        {activeTab === 'traceability' && (
          isAuthenticated ? (
            <TraceabilityView />
          ) : (
            <LoginPage onNavigate={handleNavigate} redirectAfterLogin="traceability" />
          )
        )}

        {activeTab === 'verification' && (
          isAuthenticated ? (
            <VerificationView />
          ) : (
            <LoginPage onNavigate={handleNavigate} redirectAfterLogin="verification" />
          )
        )}

        {activeTab === 'sustainability' && (
          <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 text-center shadow-xs">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2 font-serif">
              Section Temporarily Unavailable
            </h2>
            <p className="text-sm text-stone-600 mb-6 max-w-md mx-auto">
              The Sustainability & Environmental Impact section is undergoing scheduled maintenance. Please explore our other community modules.
            </p>
            <button
              onClick={() => handleNavigate('overview')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-800 text-white rounded-xl text-sm font-semibold hover:bg-forest-900 transition-colors shadow-xs"
            >
              Return to Overview
            </button>
          </div>
        )}

        {activeTab === 'impact' && (
          isAuthenticated ? (
            <ImpactView />
          ) : (
            <LoginPage onNavigate={handleNavigate} redirectAfterLogin="impact" />
          )
        )}
      </main>

      {/* Persistent Global Notification Toast */}
      <NotificationToast />

      {/* Donation Submission Modal */}
      <DonationFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />

      {/* Informative Hackathon Footer */}
      <Footer setActiveTab={handleNavigate} />
      
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DonationProvider>
        <MainContent />
      </DonationProvider>
    </AuthProvider>
  );
}
