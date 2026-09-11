import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wallet, ArrowRight, ShieldAlert, Building2, FileText, X } from 'lucide-react';
import { api } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet?: (wallet: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectWallet
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    wallets: any[];
    entities: any[];
    investigations: any[];
    transactions: any[];
  }>({ wallets: [], entities: [], investigations: [], transactions: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent TopBar
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ wallets: [], entities: [], investigations: [], transactions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.trim().toLowerCase();

        // 1. Fetch entities
        const allEntities = await api.getEntities();
        const matchedEntities = allEntities.filter(
          e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
        ).slice(0, 3);

        // 2. Fetch investigations
        const allCases = await api.getInvestigations();
        const matchedCases = allCases.filter(
          c => c.caseNumber.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.primaryWallet.toLowerCase().includes(q)
        ).slice(0, 3);

        // 3. Transactions
        const txData = await api.getTransactions({ search: q, limit: 3 });

        // 4. Quick wallet match
        const wallets = [];
        if (q.includes('demo') || q.startsWith('0x') || q.length > 5) {
          wallets.push({
            address: query.trim(),
            label: query.trim().toUpperCase() === 'DEMO_WALLET_001' ? 'Primary Suspicious Hub (Demo Subject)' : 'Screened Blockchain Address',
            network: 'Ethereum'
          });
        }

        setResults({
          wallets,
          entities: matchedEntities,
          investigations: matchedCases,
          transactions: txData.transactions || []
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-[#0d1322] shadow-2xl overflow-hidden flex flex-col">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            placeholder="Search wallet address, tx hash, entity or case ID... (e.g. DEMO_WALLET_001, TRX-10482)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-slate-500 font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">
            ESC to close
          </span>
        </div>

        {/* Results container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick presets if empty query */}
          {!query.trim() && (
            <div className="p-2 space-y-2">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Recommended Forensic Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (onSelectWallet) onSelectWallet('DEMO_WALLET_001');
                    navigate('/investigations');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-cyan-500/50 text-left transition-all group"
                >
                  <div>
                    <p className="text-xs font-mono font-semibold text-cyan-400">
                      DEMO_WALLET_001
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Primary Suspicious Aggregator
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => {
                    navigate('/investigations/case_trx_10482');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-cyan-500/50 text-left transition-all group"
                >
                  <div>
                    <p className="text-xs font-mono font-semibold text-white">
                      CASE #TRX-10482
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Active Multi-Hop Layering Probe
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {results.wallets.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider px-2">
                Wallets ({results.wallets.length})
              </span>
              {results.wallets.map((w, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (onSelectWallet) onSelectWallet(w.address);
                    navigate(`/wallet-intelligence?address=${encodeURIComponent(w.address)}`);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-medium text-white group-hover:text-cyan-400">
                        {w.address}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {w.label} • {w.network}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded bg-cyan-950/40">
                    Investigate
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.investigations.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider px-2">
                Active Cases ({results.investigations.length})
              </span>
              {results.investigations.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigate(`/investigations/${c.id}`);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded bg-blue-950/60 border border-blue-800/50 text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-medium text-white">
                        {c.caseNumber} — {c.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Target: {c.primaryWallet} • Risk: {c.riskScore}/100
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                    Open Dossier
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.entities.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider px-2">
                Entity / VASP Registry ({results.entities.length})
              </span>
              {results.entities.map((e, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigate('/vasp-attribution');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {e.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Category: {e.category} • Jurisdiction: {e.jurisdiction} • Risk: {e.riskLevel}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {e.confidence}
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.transactions.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider px-2">
                Transactions ({results.transactions.length})
              </span>
              {results.transactions.map((t, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigate(`/transaction-analysis?search=${encodeURIComponent(t.txHash)}`);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-400">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-medium text-white truncate max-w-md">
                        {t.txHash}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {t.amount} {t.asset} • {t.network} • {new Date(t.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Inspect
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
