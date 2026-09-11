import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  ShieldAlert,
  Activity,
  ArrowRight,
  TrendingUp,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  Wallet,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { InvestigationCase, Transaction } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';

export const DashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<{
    activeInvestigations: number;
    criticalHighRiskWallets: number;
    suspiciousTxs: number;
    fundsTraced: string;
    monitoredWallets: number;
  }>({
    activeInvestigations: 5,
    criticalHighRiskWallets: 4,
    suspiciousTxs: 38,
    fundsTraced: '1,198.4 ETH',
    monitoredWallets: 12
  });

  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Launcher State
  const [quickWallet, setQuickWallet] = useState('');
  const [quickNetwork, setQuickNetwork] = useState('Ethereum');
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [kpiData, caseData, txData] = await Promise.all([
        api.getKPIs(),
        api.getInvestigations(),
        api.getTransactions({ limit: 8 })
      ]);
      setKpis(kpiData);
      setCases(caseData);
      setRecentTxs(txData.transactions || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLaunchInvestigation = (walletToUse?: string) => {
    const target = walletToUse || quickWallet || 'DEMO_WALLET_001';
    navigate(`/investigations?wallet=${encodeURIComponent(target)}&network=${encodeURIComponent(quickNetwork)}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" id="dashboard-container">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
              Operational Command Center
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Blockchain Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time heuristic threat detection & multi-hop fund surveillance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboard}
            title="Refresh Feed"
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleLaunchInvestigation()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs tracking-wide shadow-md shadow-cyan-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ LAUNCH INVESTIGATION</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">Active Cases</span>
            <FolderKanban className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {kpis.activeInvestigations}
          </div>
          <p className="text-[11px] font-mono text-cyan-400 mt-1">Under forensic analysis</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">Critical/High Wallets</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-red-400">
            {kpis.criticalHighRiskWallets}
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Score ≥ 70 / 100</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">Suspicious Txs</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400">
            {kpis.suspiciousTxs}
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Flagged by heuristics</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">Funds Traced</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 truncate">
            {kpis.fundsTraced}
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Across 4 network chains</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">Monitored Targets</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-purple-400">
            {kpis.monitoredWallets}
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Active surveillance</p>
        </div>
      </div>

      {/* Quick Launcher Banner */}
      <div className="p-4 rounded-xl border border-cyan-900/40 bg-gradient-to-r from-cyan-950/30 to-slate-900/40 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-700/60 text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Rapid Forensic Screening
              </h3>
              <p className="text-xs text-slate-400">
                Execute behavioral feature extraction, graph clustering, and explainable risk calculation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="e.g. DEMO_WALLET_001 or 0x..."
              value={quickWallet}
              onChange={e => setQuickWallet(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLaunchInvestigation()}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
            />
            <select
              value={quickNetwork}
              onChange={e => setQuickNetwork(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-slate-300 focus:outline-none"
            >
              <option value="Ethereum">Ethereum</option>
              <option value="Polygon">Polygon</option>
              <option value="Bitcoin">Bitcoin</option>
            </select>
            <button
              onClick={() => handleLaunchInvestigation()}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all"
            >
              INVESTIGATE
            </button>
          </div>
        </div>
      </div>

      {/* Network Activity & Threat Volume Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Volume & Risk Contributors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Graph Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  Network Transaction Velocity
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real-time transaction volume & anomaly density
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                24H Window
              </span>
            </div>

            {/* Custom SVG Bar & Trend Chart */}
            <div className="h-44 w-full flex items-end justify-between gap-1 pt-4 px-2">
              {[45, 62, 38, 85, 94, 72, 110, 88, 140, 125, 160, 195, 145, 210, 180, 240, 215, 280].map((val, i) => {
                const isHigh = val > 170;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isHigh
                          ? 'bg-gradient-to-t from-red-950 to-red-500 hover:brightness-125'
                          : 'bg-gradient-to-t from-cyan-950 to-cyan-500 hover:brightness-125'
                      }`}
                      style={{ height: `${(val / 300) * 100}%` }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-white whitespace-nowrap pointer-events-none z-10 transition-opacity">
                      {val} ETH {isHigh ? '⚠️' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-2 mt-2">
              <span>00:00 UTC</span>
              <span>06:00 UTC</span>
              <span>12:00 UTC</span>
              <span>18:00 UTC</span>
              <span>CURRENT (PEAK ANOMALY)</span>
            </div>
          </div>

          {/* Active Investigations Table */}
          <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  Active Forensic Investigations
                </h3>
                <p className="text-[11px] text-slate-400">
                  Prioritized case dossiers currently under active review
                </p>
              </div>
              <button
                onClick={() => navigate('/cases')}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                View All Cases <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2 font-medium">Case Number</th>
                    <th className="pb-2 font-medium">Subject Wallet</th>
                    <th className="pb-2 font-medium">Risk Score</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Analyst</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {cases.slice(0, 5).map(c => (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-semibold text-white">
                        {c.caseNumber}
                      </td>
                      <td className="py-3 text-cyan-400 max-w-[150px] truncate">
                        {c.primaryWallet}
                      </td>
                      <td className="py-3">
                        <RiskBadge score={c.riskScore} size="sm" />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 text-slate-400">
                        {c.assignedAnalystName}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/investigations/${c.id}`)}
                          className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition-all"
                        >
                          Open Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Live Transaction Stream */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  Live Transaction Feed
                </h3>
                <p className="text-[11px] text-slate-400">
                  Streaming on-chain ledger activity
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {recentTxs.map(t => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/transaction-analysis?search=${encodeURIComponent(t.txHash)}`)}
                  className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-white">
                      {t.amount} {t.asset}
                    </span>
                    <RiskBadge score={t.riskScore} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1.5">
                    <span className="truncate max-w-[120px] text-slate-300">
                      From: {(t.fromAddress || '').substring(0, 8)}...
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="truncate max-w-[120px] text-slate-300">
                      To: {(t.toAddress || '').substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 pt-1.5 border-t border-slate-800/50">
                    <span>{t.network}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(t.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
