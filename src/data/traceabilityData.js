/**
 * Initial Cryptographic Traceability Audit Chains for RescuePlate (PS-43)
 * Demonstrates local tamper-evident event blocks from Creation to Delivery.
 */

import { createGenesisTraceEvent, appendTraceEvent } from '../utils/cryptoTraceability';
import { INITIAL_DONATIONS } from './sampleDonations';

export function buildInitialTraceabilityChains() {
  const chains = {};

  INITIAL_DONATIONS.forEach((donation) => {
    let chain = [createGenesisTraceEvent(donation)];

    // Event 2: Packed
    chain = appendTraceEvent(
      chain,
      "Packed",
      donation.donorOrg || "Kitchen Dispatch Team",
      "Kitchen Supervisor",
      {
        packagingType: donation.storageCondition === "Hot & Insulated" 
          ? "Insulated Thermocol & Foil Food-Grade Boxes" 
          : "Sanitized Food Containers",
        temperatureVerified: donation.storageCondition.includes("Refrigerated") ? "3.8°C" : "Ambient Clean",
        hygieneInspector: donation.contactName
      },
      new Date(new Date(donation.createdAt).getTime() + 15 * 60 * 1000).toISOString()
    );

    // If Claimed, add Handover & Pickup events
    if (donation.status === 'Claimed' || donation.status === 'Picked Up' || donation.status === 'Delivered') {
      const claimTime = donation.claimedAt || new Date(new Date(donation.createdAt).getTime() + 30 * 60 * 1000).toISOString();
      chain = appendTraceEvent(
        chain,
        "Handover Confirmed",
        donation.claimedBy || "Verified Partner NGO",
        "Courier Logistics",
        {
          courierVehicle: "Climate-Controlled Cargo Van (Simulated)",
          dispatchConfirmedByDonor: true,
          pickupWindowObserved: true
        },
        claimTime
      );
    }

    // If Picked Up, add In-Transit event
    if (donation.status === 'Picked Up' || donation.status === 'Delivered') {
      const pickupTime = donation.pickedUpAt || new Date(new Date(donation.createdAt).getTime() + 60 * 60 * 1000).toISOString();
      chain = appendTraceEvent(
        chain,
        "Picked Up",
        donation.claimedBy || "Verified Partner NGO",
        "Volunteer Courier",
        {
          custodyTransferred: true,
          courierId: "COURIER-DL-2026",
          sealIntact: true
        },
        pickupTime
      );
    }

    // If Delivered, add Final Delivery event
    if (donation.status === 'Delivered') {
      const deliveryTime = donation.deliveredAt || new Date(new Date(donation.createdAt).getTime() + 90 * 60 * 1000).toISOString();
      chain = appendTraceEvent(
        chain,
        "Delivered",
        donation.claimedBy || "Verified Partner NGO",
        "Shelter Intake Officer",
        {
          finalRecipient: "Community Dining Hall",
          safeTemperatureConfirmed: true,
          mealsServedEst: donation.quantity,
          deliverySignOff: "Verified Complete"
        },
        deliveryTime
      );
    }

    chains[donation.id] = chain;
  });

  return chains;
}
