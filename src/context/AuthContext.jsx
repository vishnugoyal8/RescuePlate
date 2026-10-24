import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Fallback demo users for offline prototype mode if server is not running
const CLIENT_DEMO_USERS = {
  donor: {
    id: "usr_donor_001",
    email: "donor@grandpearl.com",
    fullName: "Chef Vikram Sethi",
    orgName: "Grand Pearl Banquet & Hotel",
    role: "donor",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-FSSAI-REG-4412B",
    phone: "+91 98112 88990",
    locality: "Indirapuram, Ghaziabad"
  },
  donor_pending: {
    id: "usr_donor_003",
    email: "pending@saffron.com",
    fullName: "Virender Chawla",
    orgName: "Saffron Heritage Banquets",
    role: "donor",
    verificationStatus: "Pending Review",
    simulatedRegistrationId: "DEMO-FSSAI-REG-7721D",
    phone: "+91 98100 55443",
    locality: "Saket, South Delhi"
  },
  ngo: {
    id: "usr_ngo_001",
    email: "ngo@asha.org",
    fullName: "Dr. Sunita Rao",
    orgName: "Asha Ek Kadam",
    role: "ngo",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-NGO-DARPAN-4401X",
    phone: "+91 98200 11223",
    locality: "Mayur Vihar, East Delhi",
    capacity: 60
  },
  ngo_pending: {
    id: "usr_ngo_003",
    email: "pending@hopeshelter.org",
    fullName: "Sister Mary",
    orgName: "Hope Shelter Home",
    role: "ngo",
    verificationStatus: "Pending Review",
    simulatedRegistrationId: "DEMO-NGO-DARPAN-1102Z",
    phone: "+91 98111 22334",
    locality: "Rohini, North Delhi",
    capacity: 25
  },
  admin: {
    id: "usr_admin_001",
    email: "admin@rescueplate.org",
    fullName: "Kavita Singhal",
    orgName: "RescuePlate Trust & Verification Authority",
    role: "admin",
    verificationStatus: "Verified",
    simulatedRegistrationId: "DEMO-ADMIN-VERIFIER-001",
    phone: "+91 11 2345 6789",
    locality: "Central Delhi"
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [authNotice, setAuthNotice] = useState(null);

  /**
   * Session Restoration on Refresh via HttpOnly Cookie
   * Calls GET /api/auth/me with credentials: 'include'.
   */
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include' // Sends HttpOnly cookie automatically
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setBackendConnected(true);
          setIsLoading(false);
          return;
        }
      }
      
      // If server responded with 401 or non-auth, clear local user
      if (res.status === 401) {
        setBackendConnected(true);
        setCurrentUser(null);
      } else {
        // Backend not running or proxy error
        setBackendConnected(false);
      }
    } catch (err) {
      // Backend server is offline
      setBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      setCurrentUser(data.user);
      setBackendConnected(true);
      return { success: true, user: data.user };
    } catch (err) {
      // If backend is offline, check if matching demo user for offline presentation mode
      if (!backendConnected) {
        const foundDemoKey = Object.keys(CLIENT_DEMO_USERS).find(
          k => CLIENT_DEMO_USERS[k].email.toLowerCase() === email.toLowerCase()
        );
        if (foundDemoKey && (password === 'DemoDonor@2026' || password === 'DemoNgo@2026')) {
          const demoUser = CLIENT_DEMO_USERS[foundDemoKey];
          setCurrentUser(demoUser);
          setAuthNotice("Operating in Client Offline Demo Mode. Start backend with 'npm run server' for production cookie authentication.");
          return { success: true, user: demoUser, isDemoFallback: true };
        }
      }
      throw err;
    }
  };

  /**
   * Register a new Food Donor or NGO
   */
  const register = async (formData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setCurrentUser(data.user);
      setBackendConnected(true);
      return { success: true, user: data.user };
    } catch (err) {
      if (!backendConnected) {
        // Offline demo fallback registration
        const fallbackUser = {
          id: `usr_${Date.now()}`,
          email: formData.email,
          fullName: formData.fullName,
          orgName: formData.orgName,
          role: formData.role,
          verificationStatus: "Pending Review",
          simulatedRegistrationId: `DEMO-REG-${Date.now().toString().slice(-6)}`,
          phone: formData.phone || "",
          locality: formData.locality || "Delhi NCR",
          capacity: formData.role === 'ngo' ? (Number(formData.capacity) || 50) : 0
        };
        setCurrentUser(fallbackUser);
        setAuthNotice("Operating in Client Offline Demo Mode. Start backend with 'npm run server' for production cookie authentication.");
        return { success: true, user: fallbackUser, isDemoFallback: true };
      }
      throw err;
    }
  };

  /**
   * Logout and clear session cookie
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.warn("Server logout notification skipped:", e);
    } finally {
      setCurrentUser(null);
      setAuthNotice(null);
    }
  };

  /**
   * Quick 1-Click Demo Login Helper
   * Allows judges to immediately test with donor or NGO accounts without typing.
   */
  const loginWithDemo = async (demoKey = 'donor') => {
    const demoUser = CLIENT_DEMO_USERS[demoKey] || CLIENT_DEMO_USERS.donor;
    const defaultPassword = demoUser.role === 'admin' 
      ? 'DemoAdmin@2026' 
      : demoUser.role === 'donor' 
      ? 'DemoDonor@2026' 
      : 'DemoNgo@2026';

    try {
      return await login(demoUser.email, defaultPassword);
    } catch (e) {
      // Direct demo login fallback
      setCurrentUser(demoUser);
      return { success: true, user: demoUser, isDemoFallback: true };
    }
  };

  /**
   * Forgot Password request
   */
  const requestPasswordReset = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Password reset request failed.");
    return data;
  };

  /**
   * Reset Password with token
   */
  const resetPassword = async (email, token, newPassword, confirmPassword) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword, confirmPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Password reset failed.");
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        backendConnected,
        authNotice,
        setAuthNotice,
        login,
        register,
        logout,
        loginWithDemo,
        requestPasswordReset,
        resetPassword,
        checkSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
