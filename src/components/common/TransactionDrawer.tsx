import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, ArrowRight, ShieldAlert, GitCommit, Copy, Check } from 'lucide-react';
import { Transaction } from '../../types';
import { RiskBadge } from './RiskBadge';

interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onTraceInGraph?: (address: string) => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transaction,
  onClose,
  onTraceInGraph
}) => {
  const [copied, setCopied] = React.useState(false);
  const navigate = useNavigate();

  if (!transaction) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(transaction.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0d1322] border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                Cryptographic Forensic Record
              </span>
              <h3 className="text-sm font-bold text-white tracking-wide mt-0.5">
                Transaction Details
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Hash card */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Transaction Hash
                </span>
                <button
                  onClick={copyHash}
                  className="flex items-center space-x-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs font-mono text-slate-200 break-all select-all">
                {transaction.txHash}
              </p>
            </div>

            {/* Key stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Transfer Amount
                </span>
                <p className="text-base font-mono font-bold text-white mt-1">
                  {transaction.amount} <span className="text-xs text-cyan-400">{transaction.asset}</span>
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Risk Assessment
                </span>
                <div className="mt-1">
                  <RiskBadge score={transaction.riskScore} size="sm" />
                </div>
              </div>
            </div>

            {/* Counterparties */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Origin (From Address)
                </span>
                <div className="p-2.5 mt-1 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 truncate max-w-[280px]">
                    {transaction.fromAddress}
                  </span>
                  <button
                    onClick={() => {
                      navigate(`/wallet-intelligence?address=${encodeURIComponent(transaction.fromAddress)}`);
                      onClose();
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Profile <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Destination (To Address)
                </span>
                <div className="p-2.5 mt-1 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 truncate max-w-[280px]">
                    {transaction.toAddress}
                  </span>
                  <button
                    onClick={() => {
                      navigate(`/wallet-intelligence?address=${encodeURIComponent(transaction.toAddress)}`);
                      onClose();
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Profile <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Technical Metadata */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Cryptographic Execution Parameters
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-slate-200">{transaction.network}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-200">{new Date(transaction.timestamp).toUTCString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Execution Fee:</span>
                  <span className="text-slate-200">{transaction.fee} ETH</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Block Confirmation:</span>
                  <span className="text-emerald-400 font-semibold">{transaction.status}</span>
                </div>
              </div>
            </div>

            {/* Risk Indicators / Flags */}
            {transaction.flags && transaction.flags.length > 0 && (
              <div className="space-y-2 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Automated Threat Indicators
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {transaction.flags.map((flag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-red-950/40 border border-red-800/50 text-red-300"
                    >
                      {flag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-2">
          <button
            onClick={() => {
              if (onTraceInGraph) onTraceInGraph(transaction.fromAddress);
              navigate(`/investigations?wallet=${encodeURIComponent(transaction.fromAddress)}`);
              onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs tracking-wide transition-all shadow-md shadow-cyan-950/20"
          >
            <GitCommit className="w-4 h-4" />
            <span>OPEN SENDER IN GRAPH WORKSPACE</span>
          </button>

          <button
            onClick={() => {
              navigate(`/money-flow?address=${encodeURIComponent(transaction.toAddress)}`);
              onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all"
          >
            <span>TRACE RECIPIENT MONEY FLOW</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
