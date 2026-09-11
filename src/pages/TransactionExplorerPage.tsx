import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { TransactionDrawer } from '../components/common/TransactionDrawer';

export const TransactionExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInitial = searchParams.get('search') || '';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchInitial);
  const [networkFilter, setNetworkFilter] = useState('');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Drawer
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        search: searchTerm,
        network: networkFilter,
        suspicious: suspiciousOnly,
        limit,
        offset: page * limit
      });
      setTransactions(res.transactions);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, networkFilter, suspiciousOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchTransactions();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" id="transaction-explorer-container">
      {/* Slide-out Drawer */}
      <TransactionDrawer
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
            Ledger Forensics
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Cryptographic Transaction Explorer
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Institutional ledger indexing with automated threat flagging and counterparty linking
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tx hash, sender, recipient..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={networkFilter}
            onChange={e => {
              setNetworkFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="">All Networks</option>
            <option value="Ethereum">Ethereum</option>
            <option value="Polygon">Polygon</option>
            <option value="Bitcoin">Bitcoin</option>
            <option value="BNB Chain">BNB Chain</option>
          </select>

          <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={suspiciousOnly}
              onChange={e => {
                setSuspiciousOnly(e.target.checked);
                setPage(0);
              }}
              className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-950 cursor-pointer"
            />
            <span className="text-amber-400 font-semibold">Suspicious Only</span>
          </label>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-medium">Tx Hash</th>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">From</th>
                <th className="py-3 px-4 font-medium">To</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Network</th>
                <th className="py-3 px-4 font-medium">Risk Score</th>
                <th className="py-3 px-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.map(tx => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-bold text-white group-hover:text-cyan-400">
                    {(tx.txHash || '').substring(0, 14)}...
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-[120px] truncate">
                    {tx.fromAddress}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-[120px] truncate">
                    {tx.toAddress}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {tx.amount} <span className="text-cyan-400 font-normal">{tx.asset}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {tx.network}
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge score={tx.riskScore} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="px-2.5 py-1 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-[11px] transition-all"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Showing {transactions.length > 0 ? page * limit + 1 : 0} to{' '}
            {Math.min((page + 1) * limit, total)} of {total} records
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="p-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page + 1} of {Math.max(1, Math.ceil(total / limit))}
            </span>
            <button
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
