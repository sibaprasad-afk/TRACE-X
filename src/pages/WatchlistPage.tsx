import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Plus,
  Trash2,
  GitCommit,
  ExternalLink,
  ShieldAlert,
  Search,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { WatchlistEntry } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const WatchlistPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const navigate = useNavigate();

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const data = await api.getWatchlist();
      setWatchlist(data);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;

    try {
      const item = await api.addToWatchlist({
        walletAddress: newAddress.trim(),
        label: newLabel.trim() || `Subject ${(newAddress || '').substring(0, 8)}...`,
        network: 'Ethereum',
        priority: newPriority
      });
      setWatchlist(prev => [item, ...prev]);
      setNewAddress('');
      setNewLabel('');
    } catch (err: any) {
      alert(err.message || 'Failed to add to watchlist');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.removeFromWatchlist(id);
      setWatchlist(prev => prev.filter(w => w.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to remove from watchlist');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" id="watchlist-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
          Active Surveillance
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
          Continuous Watchlist & Target Surveillance
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Automated heuristic tripwires on high-risk wallets and money mule intermediaries
        </p>
      </div>

      {/* Add New Watchlist Target Form */}
      <form onSubmit={handleAdd} className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3">
        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-cyan-400" /> Enroll New Surveillance Target
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Wallet address (e.g. 0x... or DEMO_...)"
            value={newAddress}
            onChange={e => setNewAddress(e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <input
            type="text"
            placeholder="Investigation Label / Tag"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex gap-2">
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-slate-300 focus:outline-none cursor-pointer flex-1"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all shrink-0"
            >
              ENROLL
            </button>
          </div>
        </div>
      </form>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all font-mono"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                    {item.label}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Network: {item.network}
                  </span>
                </div>
                <RiskBadge category={item.priority} size="sm" />
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs text-cyan-400 truncate">
                {item.walletAddress}
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Alerts Triggered:</span>
                <span className="text-amber-400 font-bold">{item.alertCount} events</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => navigate(`/investigations?wallet=${encodeURIComponent(item.walletAddress)}`)}
                className="flex items-center space-x-1 text-cyan-400 hover:underline"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Inspect in Graph</span>
              </button>

              <button
                onClick={() => handleRemove(item.id)}
                title="Remove from watchlist"
                className="text-slate-500 hover:text-red-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
