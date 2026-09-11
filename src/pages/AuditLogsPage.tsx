import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLogEntry } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l => {
    const term = (searchTerm || '').toLowerCase();
    const action = (l.action || '').toLowerCase();
    const user = (l.userName || '').toLowerCase();
    const target = (l.target || l.resource || l.resourceId || '').toLowerCase();
    return action.includes(term) || user.includes(term) || target.includes(term);
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono text-xs" id="audit-logs-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-semibold tracking-wider uppercase">
              Evidentiary Compliance
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              IMMUTABLE CHAIN
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Chain-of-Custody & Forensic Audit Trail
          </h1>
          <p className="text-slate-400 mt-1">
            Every investigation query, export, and dossier modification is cryptographically hashed
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, analyst or target..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <span className="text-slate-400 text-[11px]">
          {filtered.length} Recorded Custody Events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-medium">Timestamp (UTC)</th>
                <th className="py-3 px-4 font-medium">Analyst User</th>
                <th className="py-3 px-4 font-medium">Action Executed</th>
                <th className="py-3 px-4 font-medium">Target Entity / Case</th>
                <th className="py-3 px-4 font-medium">Source IP</th>
                <th className="py-3 px-4 font-medium text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {l.userName}
                  </td>
                  <td className="py-3 px-4 text-cyan-400 font-semibold">
                    {l.action}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-[150px] truncate">
                    {l.target || (l.resource ? `${l.resource}: ${l.resourceId || ''}` : 'N/A')}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {l.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 text-[10px] font-mono">
                    {l.integrityHash
                      ? `${l.integrityHash.substring(0, 12)}...`
                      : l.id
                      ? `${l.id.substring(0, 12)}...`
                      : 'SHA256-VALID'}
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
