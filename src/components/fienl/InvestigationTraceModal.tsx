import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, ArrowRight, ShieldAlert, CheckCircle2, Zap, Layers } from 'lucide-react';

interface InvestigationTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress?: string;
}

export const InvestigationTraceModal: React.FC<InvestigationTraceModalProps> = ({
  isOpen,
  onClose,
  initialAddress = ''
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [chain, setChain] = useState<'TRON - USDT' | 'Ethereum' | 'Bitcoin' | 'Solana' | 'Polygon' | 'Arbitrum'>('TRON - USDT');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLaunch = (targetAddress?: string, selectedChain?: string) => {
    const finalAddr = (targetAddress || address || 'DEMO_WALLET_001').trim();
    const finalChain = selectedChain || chain;
    onClose();
    navigate(`/investigations?wallet=${encodeURIComponent(finalAddr)}&network=${encodeURIComponent(finalChain.split(' ')[0])}`);
  };

  const sampleTraces = [
    {
      id: 'TX9_Qf1v',
      chain: 'TRON - USDT',
      tag: 'FLAGGED · 65 RISK',
      tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Laundered through mixer, settled on sanctioned entity',
      address: 'TX9_Qf1v_TRON_MIXER_CASE'
    },
    {
      id: 'TR7X_L24T',
      chain: 'TRON - USDT',
      tag: 'CLEAN · 0 RISK',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: '208 transfers analyzed, 0 sanctioned exposures detected',
      address: 'TR7X_L24T_CLEAN_CASE'
    },
    {
      id: 'DEMO_WALLET_001',
      chain: 'Ethereum',
      tag: 'HIGH-RISK HUB · 87 RISK',
      tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      description: 'Central aggregator connected to hoppers and mixers',
      address: 'DEMO_WALLET_001'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#09090b] border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-72 h-36 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-36 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest text-neutral-400 uppercase mb-2">
            <span>✳ TRACE X ENGINE</span>
            <span>·</span>
            <span>LIVE FORENSIC RECON</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Start An Investigation
          </h2>
          <p className="text-sm text-neutral-400 mt-1 font-sans">
            Paste any wallet or contract. Trace X traces the funds across chains, flags mixers and sanctions, and hands you a written investigation.
          </p>
        </div>

        {/* Chain Selector */}
        <div className="mb-4">
          <label className="block text-xs font-mono tracking-wider text-neutral-400 uppercase mb-2">
            Select Chain
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(['TRON - USDT', 'Ethereum', 'Bitcoin', 'Solana', 'Polygon', 'Arbitrum'] as const).map(c => (
              <button
                key={c}
                onClick={() => setChain(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  chain === c
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="mb-6">
          <label className="block text-xs font-mono tracking-wider text-neutral-400 uppercase mb-2">
            Wallet Address, Transaction, or Entity
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 flex items-center bg-neutral-900/90 border border-neutral-700/80 focus-within:border-white rounded-xl px-3 py-2 transition-all">
              <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Paste TRON, EVM, BTC, or SOL address..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLaunch()}
                className="w-full bg-transparent border-none text-white text-sm font-mono placeholder-neutral-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleLaunch()}
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono font-semibold text-xs tracking-wider transition-all whitespace-nowrap shadow-lg shadow-white/5 cursor-pointer"
            >
              <span>RUN TRACE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Curated Pre-Run Cases */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
              Or Explore Verified Live Traces
            </span>
            <span className="text-[11px] font-mono text-neutral-500">1-click inspect</span>
          </div>

          <div className="space-y-2">
            {sampleTraces.map(st => (
              <div
                key={st.id}
                onClick={() => handleLaunch(st.address, st.chain)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer gap-2"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {st.id}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                      {st.chain}
                    </span>
                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${st.tagColor}`}>
                      {st.tag}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">
                    {st.description}
                  </p>
                </div>

                <div className="flex items-center space-x-1 text-xs font-mono text-neutral-400 group-hover:text-white transition-colors shrink-0">
                  <span>Trace now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
