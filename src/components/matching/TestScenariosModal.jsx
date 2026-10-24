import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Info,
  Award,
  Layers,
  QrCode,
  Lock
} from 'lucide-react';
import { runMatchingTestSuite } from '../../utils/matchingTestScenarios';
import { runDonorImpactTestSuite } from '../../utils/donorImpact.test';
import { runWasteTraceabilityTestSuite } from '../../utils/wasteTraceability.test';
import { runClientAuthTestSuite } from '../../utils/authClientScenarios';

export function TestScenariosModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('matching'); // 'matching' | 'impact' | 'waste' | 'auth'
  const [matchResults, setMatchResults] = useState(() => runMatchingTestSuite());
  const [donorResults, setDonorResults] = useState(() => runDonorImpactTestSuite());
  const [wasteResults, setWasteResults] = useState(() => runWasteTraceabilityTestSuite());
  const [authResults, setAuthResults] = useState(() => runClientAuthTestSuite());
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setMatchResults(runMatchingTestSuite());
      setDonorResults(runDonorImpactTestSuite());
      setWasteResults(runWasteTraceabilityTestSuite());
      setAuthResults(runClientAuthTestSuite());
      setIsRunning(false);
    }, 300);
  };

  const currentResults = 
    activeTab === 'matching' 
      ? matchResults 
      : activeTab === 'impact' 
      ? donorResults 
      : activeTab === 'waste'
      ? wasteResults
      : authResults;

  const totalCount = matchResults.length + donorResults.length + wasteResults.length + authResults.length;
  const totalPassed = 
    matchResults.filter(t => t.passed).length + 
    donorResults.filter(t => t.passed).length + 
    wasteResults.filter(t => t.passed).length +
    authResults.filter(t => t.passed).length;
  const allPassed = totalPassed === totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-forest-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-terracotta-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Verification Suite & Test Engine</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  allPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-red-500/20 text-red-300'
                }`}>
                  {totalPassed} / {totalCount} Passing
                </span>
              </div>
              <p className="text-xs text-forest-200">
                Automated Verification of Matching, Impact, Waste Intelligence, and Role-Based Access Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 bg-forest-800 hover:bg-forest-700 text-terracotta-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-forest-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Re-run All Tests'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-forest-300 hover:text-white p-1 rounded-lg hover:bg-forest-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subnavigation Bar for Test Types */}
        <div className="bg-canvas-subtle border-b border-stone-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-stone-200/80 rounded-xl text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('matching')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'matching' ? 'bg-white text-forest-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Matching (6)</span>
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'impact' ? 'bg-white text-forest-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-forest-700" />
              <span>Impact (8)</span>
            </button>
            <button
              onClick={() => setActiveTab('waste')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'waste' ? 'bg-white text-forest-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span>Waste & Trace (7)</span>
            </button>
            <button
              onClick={() => setActiveTab('auth')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'auth' ? 'bg-white text-forest-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Auth & RBAC (10)</span>
            </button>
          </div>

          <span className="text-[11px] text-stone-500 font-mono hidden md:inline">
            Node runner: npm test (31 tests)
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-stone-700">
          
          <div className="p-3.5 rounded-2xl bg-canvas-subtle border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
            <div>
              {activeTab === 'matching' ? (
                <span><strong>Matching Engine Verification:</strong> Validates distance calculations, capacity overflows, expired food rejections, unreachable transit windows, and cold chain handling constraints.</span>
              ) : activeTab === 'impact' ? (
                <span><strong>Donor Impact & Transition Verification:</strong> Confirms that ONLY Delivered donations contribute to verified impact, incomplete batches are excluded from rescued counts, disposal cost scaling works, and invalid lifecycle transitions are blocked.</span>
              ) : activeTab === 'waste' ? (
                <span><strong>Waste Intelligence, KYC Gating & Traceability:</strong> Validates Mass-Balance reconciliation ($S = P - S$), invalid input rejection, role-based verification gating (Pending/Rejected blocked), Genesis SHA-256 block linkage, and instant tamper detection.</span>
              ) : (
                <span><strong>Secure Role-Based Access Control (RBAC):</strong> Validates bcrypt password hashing, input validation, role isolation (donor vs. NGO permissions), session restoration via HttpOnly cookies, cross-organization data isolation, and server authorization.</span>
              )}
            </div>
          </div>

          {/* Test Cards List */}
          <div className="space-y-3">
            {currentResults.map((scenario) => {
              const { passed } = scenario;

              return (
                <div
                  key={scenario.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    passed ? 'bg-white border-stone-200/90 shadow-2xs' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {scenario.id}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm">
                        {scenario.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        passed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800'
                      }`}>
                        {passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertOctagon className="w-3.5 h-3.5 text-red-600" />}
                        <span>{passed ? 'PASS' : 'FAIL'}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 mt-2">
                    {scenario.description}
                  </p>

                  {/* Matching specific details */}
                  {scenario.evaluation && (
                    <div className="mt-2 text-xs">
                      {scenario.evaluation.isEligible ? (
                        <div className="p-2.5 bg-forest-50/70 rounded-xl border border-forest-200/70 text-forest-900">
                          <strong>Outcome:</strong> Eligible (Score: {scenario.evaluation.score}/100) &bull; {scenario.evaluation.reasons[0]}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200 text-stone-800 font-medium">
                          <strong>Exclusion:</strong> {scenario.evaluation.exclusionReasons[0]}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Impact & Waste & Auth specific details */}
                  {scenario.details && !scenario.evaluation && (
                    <div className="mt-2 p-2.5 bg-canvas-subtle rounded-xl border border-stone-200 text-xs text-stone-800 font-mono">
                      {scenario.details}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Close Test Suite
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
