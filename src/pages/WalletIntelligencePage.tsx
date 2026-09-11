import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Search,
  ArrowRight,
  TrendingUp,
  Activity,
  Clock,
  ShieldAlert,
  GitCommit,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { WalletProfile } from '../types';
import { RiskGauge } from '../components/common/RiskGauge';
import { RiskBadge } from '../components/common/RiskBadge';

export const WalletIntelligencePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const addressParam = searchParams.get('address') || 'DEMO_WALLET_001';

  const [addressInput, setAddressInput] = useState(addressParam);
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadProfile = async (target: string) => {
    setLoading(true);
    try {
      const res = await api.analyzeWallet(target);
      setProfile(res.wallet);
    } catch (err) {
      console.error('Failed to load wallet profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile(addressParam);
  }, [addressParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      loadProfile(addressInput.trim());
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" id="wallet-intelligence-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
          Forensic Profiling
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
          Wallet Behavioral Intelligence & Archetypes
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Deep behavioral velocity, holding delta analysis, and clustering classification
        </p>
      </div>

      {/* Search Bar & Demo Quick Switcher */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter wallet address to extract behavioral archetype..."
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all"
          >
            ANALYZE WALLET
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
          <span className="text-slate-400">Presets:</span>
          {['DEMO_WALLET_001', '0x8888888888882e3b2e3b2e3b2e3b2e3b2e3b2e3b', '0x40ec5b33f54e08337052b7eee04b23333addf4e1'].map(w => (
            <button
              key={w}
              onClick={() => {
                setAddressInput(w);
                loadProfile(w);
              }}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 transition-all"
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {profile && (
        <div className="space-y-6">
          {/* Top Profile Summary Card */}
          <div className="p-6 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold font-mono text-white">
                      {profile.address}
                    </span>
                    <RiskBadge score={profile.riskScore} category={profile.riskCategory} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Network: {profile.network} • Observed Transactions: {profile.transactionCount} • Counterparties: {profile.counterpartyCount}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/investigations?wallet=${encodeURIComponent(profile.address)}`)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all"
              >
                <GitCommit className="w-4 h-4" />
                <span>OPEN INVESTIGATION WORKSPACE</span>
              </button>
            </div>

            {/* Financial Velocity Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Net Balance</span>
                <p className="text-lg font-mono font-bold text-white mt-0.5">
                  {profile.balance} <span className="text-xs text-cyan-400">{profile.currency}</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Total Received</span>
                <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                  {profile.totalReceived} {profile.currency}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Total Sent</span>
                <p className="text-lg font-mono font-bold text-cyan-400 mt-0.5">
                  {profile.totalSent} {profile.currency}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Forwarding Velocity</span>
                <p className="text-lg font-mono font-bold text-amber-400 mt-0.5">
                  {profile.averageTimeToForwardMinutes} min avg
                </p>
              </div>
            </div>
          </div>

          {/* Behavioral Archetype Classifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Classified Behavioral Archetypes
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.behaviorProfile.map((archetype, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-cyan-800/40 bg-cyan-950/20 text-xs font-mono w-full"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">
                        {archetype}
                      </span>
                      <span className="text-[10px] text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800">
                        CONFIRMED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Wallet demonstrates characteristic on-chain indicators matching this algorithmic taxonomy.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Heuristic Ratios Card */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Mathematical Ratios & Thresholds
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Forwarding Ratio:</span>
                  <span className="font-bold text-white">{(profile.forwardingRatio * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Rapid Movement Events:</span>
                  <span className="font-bold text-red-400">{profile.rapidMovementCount} detected</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Burst Execution Occurrences:</span>
                  <span className="font-bold text-white">{profile.burstCount}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Dormant-to-Active Ratio:</span>
                  <span className="font-bold text-amber-400">{profile.dormantToActiveScore}/100</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Average Transaction Size:</span>
                  <span className="font-bold text-white">{profile.averageTransactionAmount?.toFixed(2) || '24.0'} ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
