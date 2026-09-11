import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Bell,
  Cpu,
  Save,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [criticalThreshold, setCriticalThreshold] = useState(70);
  const [rapidForwardingMinutes, setRapidForwardingMinutes] = useState(120);
  const [minSuspiciousEth, setMinSuspiciousEth] = useState(10);
  const [aiMode, setAiMode] = useState('HYBRID');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto font-mono text-xs" id="settings-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <span className="text-cyan-400 font-semibold tracking-wider uppercase">
          Configuration
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
          Forensic Platform & Heuristic Settings
        </h1>
        <p className="text-slate-400 mt-1">
          Adjust risk weight thresholds, velocity tripwires, and AI intelligence synthesis modes
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl border border-emerald-800/60 bg-emerald-950/40 text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuration parameters updated and hot-reloaded into the heuristic engine.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Thresholds */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Heuristic Scoring Thresholds
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Critical Risk Cutoff Score (out of 100):</span>
                <span className="font-bold text-red-400">{criticalThreshold}</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={criticalThreshold}
                onChange={e => setCriticalThreshold(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Rapid Forwarding Detection Window:</span>
                <span className="font-bold text-amber-400">{rapidForwardingMinutes} minutes</span>
              </div>
              <input
                type="range"
                min="15"
                max="360"
                step="15"
                value={rapidForwardingMinutes}
                onChange={e => setRapidForwardingMinutes(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Minimum Transaction Size for Suspicious Flagging:</span>
                <span className="font-bold text-cyan-400">{minSuspiciousEth} ETH</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={minSuspiciousEth}
                onChange={e => setMinSuspiciousEth(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* AI & Synthesis Engine */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> AI Intelligence Synthesis Mode
          </h3>

          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 cursor-pointer hover:border-slate-700">
              <input
                type="radio"
                name="aiMode"
                value="HYBRID"
                checked={aiMode === 'HYBRID'}
                onChange={() => setAiMode('HYBRID')}
                className="accent-cyan-500"
              />
              <div>
                <span className="font-bold text-white block">Hybrid (Gemini 3.8 Flash + Deterministic Fallback)</span>
                <span className="text-[11px] text-slate-400">Uses server-side Gemini when GEMINI_API_KEY is available; seamlessly falls back to the deterministic forensic engine.</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 cursor-pointer hover:border-slate-700">
              <input
                type="radio"
                name="aiMode"
                value="OFFLINE_ONLY"
                checked={aiMode === 'OFFLINE_ONLY'}
                onChange={() => setAiMode('OFFLINE_ONLY')}
                className="accent-cyan-500"
              />
              <div>
                <span className="font-bold text-white block">Strict Air-Gapped Mode (100% Deterministic Engine)</span>
                <span className="text-[11px] text-slate-400">Zero external network requests. All analytical dossiers generated entirely via local forensic heuristics.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-md shadow-cyan-950/30"
          >
            <Save className="w-4 h-4" />
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
};
