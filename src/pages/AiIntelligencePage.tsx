import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  RefreshCw,
  FileDown,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { InvestigationResult } from '../types';

export const AiIntelligencePage: React.FC = () => {
  const [address, setAddress] = useState('DEMO_WALLET_001');
  const [intelData, setIntelData] = useState<InvestigationResult['aiIntelligence'] | null>(null);
  const [walletMetrics, setWalletMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadAiReport = async (target: string) => {
    setLoading(true);
    try {
      const res = await api.analyzeWallet(target);
      setIntelData(res.aiIntelligence);
      setWalletMetrics(res.wallet);
    } catch (err) {
      console.error('Failed to load AI intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAiReport(address);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" id="ai-intelligence-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
              Automated Forensic Synthesis
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {intelData?.generatedBy || 'GEMINI_LLM'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            AI Forensic Intelligence Dossier
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Machine-synthesized investigative brief for compliance officers and financial crime prosecutors
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadAiReport(address)}
            className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate(`/investigations?wallet=${encodeURIComponent(address)}`)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all"
          >
            OPEN IN GRAPH
          </button>
        </div>
      </div>

      {/* Target Subject Card */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Subject Target:</span>
            <p className="text-sm font-bold text-white">{address}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-slate-400 text-[10px]">Turnover:</span>
            <p className="font-bold text-white">{walletMetrics?.totalReceived || 732.45} ETH</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">Risk Score:</span>
            <p className="font-bold text-red-400">{walletMetrics?.riskScore || 87} / 100</p>
          </div>
        </div>
      </div>

      {/* Structured Sections */}
      {intelData && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 1. Executive Summary
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed p-4 rounded-lg bg-slate-950/60 border border-slate-800">
              {intelData.executiveSummary}
            </p>
          </div>

          {/* Key Findings */}
          <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider">
              2. Key Findings & Empirical Observations
            </h3>
            <div className="space-y-2">
              {intelData.keyFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 text-xs font-mono text-slate-300 flex items-start space-x-3"
                >
                  <span className="text-cyan-400 font-bold shrink-0">0{idx + 1}.</span>
                  <span className="leading-relaxed">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Behavioral Assessment & Fund Flow Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
              <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider">
                3. Behavioral Assessment
              </h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                {intelData.behavioralAssessment}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
              <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider">
                4. Fund Flow & Liquidity Sinks
              </h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                {intelData.fundFlowSummary}
              </p>
            </div>
          </div>

          {/* Timeline Summary & Risk Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
              <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider">
                5. Chronological Velocity
              </h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                {intelData.timelineSummary}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
              <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider">
                6. Risk Scoring Explanation
              </h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                {intelData.riskExplanation}
              </p>
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider">
              7. Recommended Analytical & Legal Actions
            </h3>
            <div className="space-y-2">
              {intelData.recommendedSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-emerald-900/40 bg-emerald-950/20 text-xs font-mono text-emerald-300 flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
