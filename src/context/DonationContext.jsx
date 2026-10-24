import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DONATIONS } from '../data/sampleDonations';
import { DEMO_NGO_PROFILES, DEMO_LOCALITIES } from '../data/ngoProfiles';
import { INITIAL_HOTEL_WASTE_ENTRIES } from '../data/hotelWasteData';
import { INITIAL_ORG_PROFILES } from '../data/orgVerificationData';
import { buildInitialTraceabilityChains } from '../data/traceabilityData';
import { createGenesisTraceEvent, appendTraceEvent } from '../utils/cryptoTraceability';
import { validateStateTransition } from '../utils/stateTransitions';
import { DEFAULT_DISPOSAL_COST_PER_KG } from '../utils/donorImpact';

const DonationContext = createContext(null);

const STORAGE_KEY = 'rescueplate_donations_v1';
const NGO_PROFILE_STORAGE_KEY = 'rescueplate_active_ngo_v1';
const DISPOSAL_COST_STORAGE_KEY = 'rescueplate_disposal_cost_v1';
const WASTE_ENTRIES_STORAGE_KEY = 'rescueplate_waste_entries_v1';
const ORG_PROFILES_STORAGE_KEY = 'rescueplate_org_profiles_v1';
const TRACE_CHAINS_STORAGE_KEY = 'rescueplate_trace_chains_v1';

export function DonationProvider({ children }) {
  // 1. Configurable municipal waste disposal fee assumption per kg
  const [disposalCostPerKg, setDisposalCostPerKg] = useState(() => {
    try {
      const saved = localStorage.getItem(DISPOSAL_COST_STORAGE_KEY);
      if (saved) return Number(saved) || DEFAULT_DISPOSAL_COST_PER_KG;
    } catch {
      // fallback
    }
    return DEFAULT_DISPOSAL_COST_PER_KG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(DISPOSAL_COST_STORAGE_KEY, String(disposalCostPerKg));
    } catch (e) {
      console.warn("Could not save disposal cost to localStorage:", e);
    }
  }, [disposalCostPerKg]);

  // 2. Donations state
  const [donations, setDonations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not parse saved donations from localStorage:", e);
    }
    return INITIAL_DONATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
    } catch (e) {
      console.error("Failed to save donations to localStorage:", e);
    }
  }, [donations]);

  // 3. Active NGO profile for matching
  const [activeNgo, setActiveNgo] = useState(() => {
    try {
      const savedNgoId = localStorage.getItem(NGO_PROFILE_STORAGE_KEY);
      if (savedNgoId) {
        const found = DEMO_NGO_PROFILES.find(p => p.id === savedNgoId);
        if (found) return found;
      }
    } catch (e) {
      console.warn("Could not read saved NGO profile from localStorage:", e);
    }
    return DEMO_NGO_PROFILES[0];
  });

  useEffect(() => {
    try {
      if (activeNgo?.id) {
        localStorage.setItem(NGO_PROFILE_STORAGE_KEY, activeNgo.id);
      }
    } catch (e) {
      console.error("Failed to save active NGO to localStorage:", e);
    }
  }, [activeNgo]);

  // 4. Hotel Waste Intelligence Entries
  const [wasteEntries, setWasteEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(WASTE_ENTRIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not parse waste entries from localStorage:", e);
    }
    return INITIAL_HOTEL_WASTE_ENTRIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(WASTE_ENTRIES_STORAGE_KEY, JSON.stringify(wasteEntries));
    } catch (e) {
      console.error("Failed to save waste entries to localStorage:", e);
    }
  }, [wasteEntries]);

  // 5. Organization Profiles & Verification Status
  const [orgProfiles, setOrgProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem(ORG_PROFILES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not parse org profiles from localStorage:", e);
    }
    return INITIAL_ORG_PROFILES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ORG_PROFILES_STORAGE_KEY, JSON.stringify(orgProfiles));
    } catch (e) {
      console.error("Failed to save org profiles to localStorage:", e);
    }
  }, [orgProfiles]);

  // 6. Cryptographic Traceability Chains
  const [traceChains, setTraceChains] = useState(() => {
    try {
      const saved = localStorage.getItem(TRACE_CHAINS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not parse trace chains from localStorage:", e);
    }
    return buildInitialTraceabilityChains();
  });

  useEffect(() => {
    try {
      localStorage.setItem(TRACE_CHAINS_STORAGE_KEY, JSON.stringify(traceChains));
    } catch (e) {
      console.error("Failed to save trace chains to localStorage:", e);
    }
  }, [traceChains]);

  // 7. Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const closeToast = () => {
    setToast(null);
  };

  /**
   * Helper to verify if an organization is verified in demo KYC registry.
   */
  const checkOrgVerification = (orgName) => {
    if (!orgName) return { isVerified: true, status: "Verified" };
    const matched = orgProfiles.find(o => o.name.toLowerCase() === orgName.trim().toLowerCase());
    if (!matched) {
      // If organization is unlisted in registry, treat as verified demo partner by default
      return { isVerified: true, status: "Verified" };
    }
    return {
      isVerified: matched.verificationStatus === "Verified",
      status: matched.verificationStatus,
      org: matched
    };
  };

  /**
   * Update verification status of an organization (e.g. for testing gating)
   */
  const updateOrgVerificationStatus = (orgId, newStatus) => {
    setOrgProfiles(prev => 
      prev.map(org => {
        if (org.id === orgId) {
          return {
            ...org,
            verificationStatus: newStatus,
            verifiedAt: newStatus === "Verified" ? new Date().toISOString() : null
          };
        }
        return org;
      })
    );
    showToast(`Organization verification status updated to "${newStatus}"`, "info");
  };

  /**
   * Add a waste intelligence log entry
   */
  const addWasteEntry = (entryData) => {
    const newEntry = {
      id: `HWE-${Date.now().toString().slice(-6)}`,
      isDemo: false,
      date: entryData.date,
      hotelOrg: entryData.hotelOrg?.trim() || "Grand Pearl Banquet & Hotel",
      itemName: entryData.itemName.trim(),
      category: entryData.category || "Cooked Meals",
      preparedQty: Number(entryData.preparedQty) || 0,
      soldOrServedQty: Number(entryData.soldOrServedQty) || 0,
      donatedQty: Number(entryData.donatedQty) || 0,
      discardedQty: Number(entryData.discardedQty) || 0,
      unit: entryData.unit || "meals",
      notes: entryData.notes?.trim() || "Daily shift kitchen log."
    };

    setWasteEntries(prev => [newEntry, ...prev]);
    showToast(`Logged waste intelligence entry for "${newEntry.itemName}"`);
    return newEntry;
  };

  const deleteWasteEntry = (entryId) => {
    setWasteEntries(prev => prev.filter(e => e.id !== entryId));
    showToast("Waste intelligence record removed.", "info");
  };

  /**
   * Helper to resolve coordinates from address text
   */
  const resolveCoordinates = (addressText) => {
    const matchedLocality = DEMO_LOCALITIES.find(loc => 
      addressText.toLowerCase().includes(loc.name.toLowerCase().split(',')[0].trim())
    );
    if (matchedLocality) {
      return {
        lat: matchedLocality.lat,
        lng: matchedLocality.lng,
        label: `Verified Demo Coordinate (${matchedLocality.name})`
      };
    }
    return {
      lat: 28.6315,
      lng: 77.2167,
      label: "Verified Demo Coordinate (Central Delhi Default)"
    };
  };

  /**
   * Add a new donation submitted from the Donor form.
   * GATED: Checks if donor organization is Verified.
   */
  const addDonation = (formData) => {
    const donorOrgName = formData.donorOrg?.trim() || "Royal Spoon Banquets";
    const verification = checkOrgVerification(donorOrgName);

    if (!verification.isVerified) {
      showToast(
        `Verification Blocked: "${donorOrgName}" is currently ${verification.status}. Only Verified organizations may broadcast food donations.`,
        "error"
      );
      return null;
    }

    const hoursRemaining = (new Date(formData.collectionDeadline) - new Date()) / (1000 * 60 * 60);
    let calculatedUrgency = "Normal";
    if (hoursRemaining > 0 && hoursRemaining <= 3) {
      calculatedUrgency = "High";
    } else if (hoursRemaining > 3 && hoursRemaining <= 6) {
      calculatedUrgency = "Moderate";
    }

    const coords = resolveCoordinates(formData.pickupAddress);

    const newDonation = {
      id: `DON-${Date.now().toString().slice(-6)}`,
      isSample: false,
      foodName: formData.foodName.trim(),
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      estimatedWeightKg: formData.estimatedWeightKg ? Number(formData.estimatedWeightKg) : (
        formData.unit === 'kg' ? Number(formData.quantity) : Number(formData.quantity) * 0.4
      ),
      storageCondition: formData.storageCondition || "Room Temp",
      pickupAddress: formData.pickupAddress.trim(),
      coordinates: coords,
      collectionDeadline: formData.collectionDeadline,
      contactName: formData.contactName.trim(),
      contactPhone: formData.contactPhone?.trim() || "Not provided",
      notes: formData.notes?.trim() || "No additional instructions.",
      status: "Available",
      urgency: calculatedUrgency,
      claimedBy: null,
      claimedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
      donorOrg: donorOrgName
    };

    // Initialize Genesis event in cryptographic traceability chain
    const genesisEvent = createGenesisTraceEvent(newDonation);
    const packingEvent = appendTraceEvent(
      [genesisEvent],
      "Packed",
      newDonation.donorOrg,
      "Kitchen Dispatch Supervisor",
      {
        packagingType: newDonation.storageCondition === "Hot & Insulated"
          ? "Insulated Thermocol & Foil Food-Grade Boxes"
          : "Sanitized Food-Grade Containers",
        hygieneSignOffBy: newDonation.contactName
      }
    );

    setTraceChains(prev => ({
      ...prev,
      [newDonation.id]: packingEvent
    }));

    setDonations((prev) => [newDonation, ...prev]);
    showToast(`Donation "${newDonation.foodName}" posted successfully! Traceability ID: TRC-${newDonation.id}`);
    return newDonation;
  };

  /**
   * Action for an NGO to claim an available donation.
   * GATED: Checks if NGO is Verified.
   * RACE-CONDITION & DOUBLE-CLAIM SAFE.
   */
  const claimDonation = (donationId, ngoName = "Asha Ek Kadam Shelter Home") => {
    const verification = checkOrgVerification(ngoName);
    if (!verification.isVerified) {
      showToast(
        `Claim Blocked: "${ngoName}" is currently ${verification.status}. Only Verified recipient NGOs may claim donations.`,
        "error"
      );
      return false;
    }

    let success = false;
    let claimedItemName = "";
    let alreadyClaimedBy = null;

    setDonations((prev) => {
      const target = prev.find(item => item.id === donationId);
      
      if (!target) {
        showToast("Error: Donation record could not be found.", "error");
        return prev;
      }

      if (target.status !== 'Available') {
        alreadyClaimedBy = target.claimedBy || "another partner";
        return prev;
      }

      success = true;
      claimedItemName = target.foodName;

      return prev.map((item) => {
        if (item.id === donationId) {
          return {
            ...item,
            status: "Claimed",
            claimedBy: ngoName,
            claimedAt: new Date().toISOString(),
          };
        }
        return item;
      });
    });

    if (alreadyClaimedBy) {
      showToast(`Cannot claim: This donation was already claimed by ${alreadyClaimedBy}.`, 'error');
      return false;
    }

    if (success) {
      // Append Handover Confirmed trace event
      setTraceChains(prev => {
        const existingChain = prev[donationId] || [];
        return {
          ...prev,
          [donationId]: appendTraceEvent(
            existingChain,
            "Handover Confirmed",
            ngoName,
            "NGO Logistics Dispatch",
            {
              claimedTimestamp: new Date().toISOString(),
              reservedForNgo: ngoName,
              pickupScheduled: true
            }
          )
        };
      });

      showToast(`Successfully claimed "${claimedItemName}". Reserved exclusively for ${ngoName}!`, 'info');
      return true;
    }

    return false;
  };

  /**
   * Update the status of any donation along the lifecycle:
   * Available -> Claimed -> Picked Up -> Delivered
   * Appends cryptographic trace blocks for Picked Up and Delivered events.
   */
  const updateStatus = (donationId, newStatus, isDemoReset = false) => {
    let transitionError = null;
    let updatedItem = null;

    setDonations((prev) => {
      const target = prev.find(item => item.id === donationId);
      if (!target) {
        transitionError = `Donation #${donationId} not found.`;
        return prev;
      }

      const validation = validateStateTransition(target.status, newStatus, isDemoReset);
      if (!validation.isValid) {
        transitionError = validation.error;
        return prev;
      }

      updatedItem = target;

      const timestampKey =
        newStatus === 'Claimed' ? 'claimedAt' :
        newStatus === 'Picked Up' ? 'pickedUpAt' :
        newStatus === 'Delivered' ? 'deliveredAt' : null;

      return prev.map((item) => {
        if (item.id === donationId) {
          return {
            ...item,
            status: newStatus,
            ...(timestampKey ? { [timestampKey]: new Date().toISOString() } : {}),
            ...(newStatus === 'Available' ? { claimedBy: null, claimedAt: null, pickedUpAt: null, deliveredAt: null } : {})
          };
        }
        return item;
      });
    });

    if (transitionError) {
      showToast(transitionError, 'error');
      return { success: false, error: transitionError };
    }

    // Append trace event if transitioning forward
    if (updatedItem && !isDemoReset) {
      if (newStatus === 'Picked Up') {
        setTraceChains(prev => ({
          ...prev,
          [donationId]: appendTraceEvent(
            prev[donationId] || [],
            "Picked Up",
            updatedItem.claimedBy || "Courier Service",
            "Courier Logistics",
            {
              custodyTransferred: true,
              inTransitTimestamp: new Date().toISOString()
            }
          )
        }));
      } else if (newStatus === 'Delivered') {
        setTraceChains(prev => ({
          ...prev,
          [donationId]: appendTraceEvent(
            prev[donationId] || [],
            "Delivered",
            updatedItem.claimedBy || "Shelter Home",
            "Intake Supervisor",
            {
              deliverySignOff: "Verified Complete",
              safeReceiptConfirmed: true,
              deliveredTimestamp: new Date().toISOString()
            }
          )
        }));
      }
    }

    showToast(`Status updated to "${newStatus}" for donation #${donationId}`);
    return { success: true };
  };

  /**
   * Reset all demo data to clean baseline
   */
  const resetToSampleData = () => {
    setDonations(INITIAL_DONATIONS);
    setWasteEntries(INITIAL_HOTEL_WASTE_ENTRIES);
    setOrgProfiles(INITIAL_ORG_PROFILES);
    setTraceChains(buildInitialTraceabilityChains());
    setDisposalCostPerKg(DEFAULT_DISPOSAL_COST_PER_KG);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DONATIONS));
    localStorage.setItem(WASTE_ENTRIES_STORAGE_KEY, JSON.stringify(INITIAL_HOTEL_WASTE_ENTRIES));
    localStorage.setItem(ORG_PROFILES_STORAGE_KEY, JSON.stringify(INITIAL_ORG_PROFILES));
    localStorage.setItem(TRACE_CHAINS_STORAGE_KEY, JSON.stringify(buildInitialTraceabilityChains()));
    localStorage.setItem(DISPOSAL_COST_STORAGE_KEY, String(DEFAULT_DISPOSAL_COST_PER_KG));

    showToast("Application data reset to clean initial demo state.", "info");
  };

  return (
    <DonationContext.Provider
      value={{
        donations,
        activeNgo,
        setActiveNgo,
        ngoProfiles: DEMO_NGO_PROFILES,
        disposalCostPerKg,
        setDisposalCostPerKg,
        wasteEntries,
        addWasteEntry,
        deleteWasteEntry,
        orgProfiles,
        updateOrgVerificationStatus,
        checkOrgVerification,
        traceChains,
        setTraceChains,
        addDonation,
        claimDonation,
        updateStatus,
        resetToSampleData,
        toast,
        showToast,
        closeToast
      }}
    >
      {children}
    </DonationContext.Provider>
  );
}

export function useDonations() {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error("useDonations must be used within a DonationProvider");
  }
  return context;
}
