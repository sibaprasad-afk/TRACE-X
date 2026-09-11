import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Clock,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { InvestigationCase } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';

export const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // New Case Form
  const [caseName, setCaseName] = useState('');
  const [primaryWallet, setPrimaryWallet] = useState('');
  const [network, setNetwork] = useState('Ethereum');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [notes, setNotes] = useState('');

  const navigate = useNavigate();

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await api.getInvestigations();
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim() || !primaryWallet.trim()) return;

    try {
      const created = await api.createCase({
        caseName: caseName.trim(),
        primaryWallet: primaryWallet.trim(),
        network,
        priority,
        notes: notes.trim()
      });
      setCases(prev => [created, ...prev]);
      setShowModal(false);
      setCaseName('');
      setPrimaryWallet('');
      setNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to create case');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" id="cases-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
            Case Management
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Cryptocurrency Fraud Case Files
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Centralized dossier management and evidence repository for forensic analysts
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all shadow-md shadow-cyan-950/30"
        >
          <Plus className="w-4 h-4" />
          <span>NEW CASE FILE</span>
        </button>
      </div>

      {/* Cases Table */}
      <div className="rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3.5 px-4 font-medium">Case Number</th>
                <th className="py-3.5 px-4 font-medium">Case Title</th>
                <th className="py-3.5 px-4 font-medium">Primary Subject Wallet</th>
                <th className="py-3.5 px-4 font-medium">Network</th>
                <th className="py-3.5 px-4 font-medium">Risk Score</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium">Analyst</th>
                <th className="py-3.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {cases.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">
                    {c.caseNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white max-w-[200px] truncate">
                    {c.title || c.caseName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-[140px] truncate">
                    {c.primaryWallet}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {c.network}
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge score={c.riskScore} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {c.assignedAnalystName}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/investigations/${c.id}?wallet=${encodeURIComponent(c.primaryWallet)}`)}
                      className="px-3 py-1 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-[11px] transition-all"
                    >
                      Open Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Case Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090e1a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create New Forensic Case</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation Flashloan Drain Phase 2"
                  value={caseName}
                  onChange={e => setCaseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subject Wallet Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DEMO_WALLET_001 or 0x..."
                  value={primaryWallet}
                  onChange={e => setPrimaryWallet(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Network</label>
                  <select
                    value={network}
                    onChange={e => setNetwork(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Ethereum">Ethereum</option>
                    <option value="Polygon">Polygon</option>
                    <option value="Bitcoin">Bitcoin</option>
                    <option value="BNB Chain">BNB Chain</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Forensic Notes / Referral Source</label>
                <textarea
                  rows={3}
                  placeholder="Initial heuristic context or referral notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold tracking-wider"
                >
                  CREATE CASE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
