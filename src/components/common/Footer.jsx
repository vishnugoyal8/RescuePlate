import React from 'react';
import { HeartHandshake, ShieldCheck, Heart } from 'lucide-react';

export function Footer({ setActiveTab }) {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-white">
                <HeartHandshake className="w-4 h-4 text-terracotta-400" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">RescuePlate</span>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              "Good food. Better futures."
              <br />
              A verified community food donation matching network engineered for Tech Yuva Build-A-Thon 2026 under Problem Statement PS-43.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Food-Waste Initiative &bull; Safety Verified Operations</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300">
              <li>
                <button onClick={() => setActiveTab('overview')} className="hover:text-white transition-colors">
                  Overview & Vision
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('hotel')} className="hover:text-white transition-colors">
                  Hotel Waste Intelligence
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('donor')} className="hover:text-white transition-colors">
                  Donor Hub & Matcher
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('ngo')} className="hover:text-white transition-colors">
                  NGO Portal (Claim Food)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('traceability')} className="hover:text-white transition-colors">
                  Traceability & Custody Timeline
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('verification')} className="hover:text-white transition-colors">
                  Organization KYC Registry
                </button>
              </li>
            </ul>
          </div>

          {/* Hackathon Specs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Buildathon PS-43 Note
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Designed with offline-first client architecture using browser persistence (localStorage). 
              Smart matching algorithms and real-time backend synchronization will follow in subsequent phases.
            </p>
            <div className="mt-4 p-2.5 rounded-lg bg-stone-800/80 border border-stone-700/60 text-[11px] text-stone-400">
              Local Data: <span className="text-emerald-400 font-mono">Active (Synced)</span>
            </div>
          </div>

        </div>

        <div className="pt-8 mt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 RescuePlate. Built for Tech Yuva Build-A-Thon.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" /> for community impact
          </p>
        </div>
      </div>
    </footer>
  );
}
