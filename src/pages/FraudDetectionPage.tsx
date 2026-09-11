import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Globe,
  Clock,
  Layers,
  GitFork,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { FraudFinding, RiskBreakdown } from '../types';
import { RiskGauge } from '../components/common/RiskGauge';
import { RiskBadge } from '../components/common/RiskBadge';

export const FraudDetectionPage: React.FC = () => {
  const [address, setAddress] = useState('DEMO_WALLET_001');
  const [findings, setFindings] = useState<FraudFinding[]>([]);
  const [risk, setRisk] = useState<RiskBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadFraudReport = async (target: string) => {
    setLoading(true);
    try {
      const res = await api.analyzeWallet(target);
      setFindings(res.fraudFindings);
      setRisk(res.risk);
    } catch (err) {
      console.error('Failed to load fraud detection:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFraudReport(address);
  }, []);

  const getThreatIcon = (pattern: string) => {
    if (pattern.includes('Mixer')) return <Flame className="w-5 h-5 text-red-400" />;
    if (pattern.includes('Bridge')) return <Globe className="w-5 h-5 text-purple-400" />;
    if (pattern.includes('Movement') || pattern.includes('Burst')) return <Clock className="w-5 h-5 text-amber-400" />;
    if (pattern.includes('Fan')) return <GitFork className="w-5 h-5 text-cyan-400" />;
    return <ShieldAlert className="w-5 h-5 text-red-400" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" id="fraud-detection-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
            Heuristic Forensic Engine
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Cryptocurrency Fraud & Laundering Detection
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Automated detection across 8 threat vectors with deterministic evidence logs
          </p>
        </div>

        <button
          onClick={() => navigate(`/investigations?wallet=${encodeURIComponent(address)}`)}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all"
        >
          OPEN INVESTIGATION GRAPH
        </button>
      </div>

      {/* Top Overview & Overall Risk Gauge */}
      {risk && (
        <div className="p-6 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <RiskGauge score={risk.score} category={risk.category} size={130} />
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">
                Subject Profile Evaluated:
              </span>
              <h3 className="text-lg font-mono font-bold text-white">
                {address}
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {risk.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-2 text-xs font-mono text-right shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="flex justify-between md:justify-end gap-3">
              <span className="text-slate-400">Total Threat Vectors:</span>
              <span className="text-white font-bold">{findings.length} Flagged</span>
            </div>
            <div className="flex justify-between md:justify-end gap-3">
              <span className="text-slate-400">Confidence Rating:</span>
              <span className="text-emerald-400 font-bold">100% On-Chain</span>
            </div>
            <div className="flex justify-between md:justify-end gap-3">
              <span className="text-slate-400">Audit Status:</span>
              <span className="text-cyan-400 font-bold">Verified Heuristic</span>
            </div>
          </div>
        </div>
      )}

      {/* 8 Threat Vectors Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-mono text-white">
            Forensic Findings Dossier
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {findings.length} Confirmed Patterns
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {findings.map((finding, idx) => (
            <div
              key={finding.id}
              className="p-5 rounded-xl border border-red-900/40 bg-[#0c1220]/90 backdrop-blur-sm space-y-3 hover:border-red-700/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/60">
                    {getThreatIcon(finding.patternName)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">
                      0{idx + 1} {finding.patternName}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Confidence: {finding.confidence}
                    </span>
                  </div>
                </div>
                <RiskBadge category={finding.severity} size="sm" />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {finding.description}
              </p>

              <div className="p-3 rounded-lg border border-red-950 bg-slate-950/60 text-[11px] font-mono text-slate-400 space-y-1">
                <span className="text-slate-200 font-semibold block">Empirical Evidence:</span>
                <p>{finding.evidence}</p>
              </div>

              {finding.affectedTransactions.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 gap-2">
                  <span>Affected Cryptographic Hashes:</span>
                  <div className="flex gap-1.5">
                    {finding.affectedTransactions.map((tx, i) => (
                      <span
                        key={i}
                        onClick={() => navigate(`/transaction-analysis?search=${encodeURIComponent(tx)}`)}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        {(tx || '').substring(0, 8)}...
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
