import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface StagedLoadingModalProps {
  isOpen: boolean;
  address: string;
  network?: string;
  onComplete?: () => void;
}

const STAGES = [
  { id: 1, text: 'CONNECTING TO DATA PROVIDER', sub: 'Establishing RPC gateway & indexing nodes' },
  { id: 2, text: 'LOADING TRANSACTIONS', sub: 'Fetching chronological ledger blocks' },
  { id: 3, text: 'BUILDING WALLET PROFILE', sub: 'Calculating balances, in/out volume, counterparties' },
  { id: 4, text: 'ANALYZING BEHAVIOR', sub: 'Evaluating velocity, holding delta, and forwarding ratios' },
  { id: 5, text: 'DETECTING PATTERNS', sub: 'Evaluating fan-in/fan-out, burst activity, and layering' },
  { id: 6, text: 'BUILDING TRANSACTION GRAPH', sub: 'Computing multi-hop nodes, edges, and centrality' },
  { id: 7, text: 'CALCULATING RISK', sub: 'Running deterministic additive scoring matrix' },
  { id: 8, text: 'GENERATING INTELLIGENCE', sub: 'Synthesizing forensic findings and dossier narrative' }
];

export const StagedLoadingModal: React.FC<StagedLoadingModalProps> = ({
  isOpen,
  address,
  network = 'Ethereum',
  onComplete
}) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      return;
    }

    let stageIdx = 0;
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < STAGES.length) {
        setCurrentStage(stageIdx);
      } else {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 400);
        }
      }
    }, 450); // fast, responsive 3.6s total transition

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-[#0d1322] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Cpu className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Executing Forensic Pipeline
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Target: {address && address.length > 22 ? `${address.substring(0, 10)}...${address.substring(address.length - 8)}` : (address || 'N/A')} • {network}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            {Math.round(((currentStage + 1) / STAGES.length) * 100)}%
          </span>
        </div>

        {/* Stages list */}
        <div className="space-y-2.5">
          {STAGES.map((stage, idx) => {
            const isDone = idx < currentStage;
            const isCurrent = idx === currentStage;
            const isUpcoming = idx > currentStage;

            return (
              <div
                key={stage.id}
                className={`flex items-start space-x-3 p-2 rounded-lg border transition-all duration-300 ${
                  isCurrent
                    ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
                    : isDone
                    ? 'border-slate-800/50 bg-slate-900/40 text-slate-400'
                    : 'border-transparent text-slate-600 opacity-60'
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono">
                      {stage.id}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono tracking-wider font-semibold ${isCurrent ? 'text-cyan-300' : ''}`}>
                      {stage.text}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {stage.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom micro indicator */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Determinism: 100% On-Chain Evidence</span>
          <span>Security Protocol: Encrypted</span>
        </div>
      </div>
    </div>
  );
};
