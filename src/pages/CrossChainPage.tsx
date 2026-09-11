import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export const CrossChainPage: React.FC = () => {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const data = await api.getCrossChainTransfers();
      setTransfers(data);
    } catch (err) {
      console.error('Failed to load cross-chain data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" id="cross-chain-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
            Bridge Surveillance
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Cross-Chain Liquidity & Bridge Transit Intelligence
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Tracking asset transit across Ethereum, Polygon, Bitcoin, BNB Chain, and Solana
          </p>
        </div>

        <button
          onClick={loadTransfers}
          className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Network Hops Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Bridges Monitored</span>
          <p className="text-2xl font-mono font-bold text-white mt-1">4 Protocols</p>
          <p className="text-xs text-cyan-400 font-mono mt-0.5">Nexus, Stargate, Portal, Synapse</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase text-slate-400">Correlated Cross-Chain Hops</span>
          <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">{transfers.length} Events</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">99.2% Timing Correlation Confidence</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Cross-Chain Volume</span>
          <p className="text-2xl font-mono font-bold text-purple-400 mt-1">195.4 ETH Eq.</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Inter-network liquidity jumps</p>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <h3 className="text-sm font-bold text-white font-mono">
            Cross-Chain Correlated Transfers
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-medium">Source Chain & Tx</th>
                <th className="py-3 px-4 font-medium">Bridge Protocol</th>
                <th className="py-3 px-4 font-medium">Target Chain & Recipient</th>
                <th className="py-3 px-4 font-medium">Dispatched Volume</th>
                <th className="py-3 px-4 font-medium">Transit Delay</th>
                <th className="py-3 px-4 font-medium">Correlation Confidence</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transfers.map(tr => (
                <tr key={tr.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{tr.sourceNetwork}</div>
                    <span className="text-[10px] text-slate-400">{(tr.sourceTxHash || '').substring(0, 14)}...</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 font-semibold">
                      {tr.bridgeProtocol}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{tr.destinationNetwork}</div>
                    <span className="text-[10px] text-slate-400">{(tr.destinationAddress || '').substring(0, 14)}...</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {tr.amount} <span className="text-cyan-400 font-normal">{tr.asset}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {tr.transitDurationMinutes} min
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-semibold text-[11px]">
                      {tr.correlationConfidence}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/investigations?wallet=${encodeURIComponent(tr.destinationAddress)}`)}
                      className="px-2.5 py-1 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-[11px] transition-all"
                    >
                      Trace Destination
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
