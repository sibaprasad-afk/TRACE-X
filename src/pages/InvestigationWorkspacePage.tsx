import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  GitCommit,
  Layers,
  Sparkles,
  Bot,
  Building2,
  FileDown,
  Eye,
  RefreshCw,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Flame,
  Globe,
  PanelRight
} from 'lucide-react';
import { api } from '../services/api';
import { InvestigationResult, GraphNode } from '../types';
import { InteractiveGraphCanvas } from '../components/graph/InteractiveGraphCanvas';
import { RiskGauge } from '../components/common/RiskGauge';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { StagedLoadingModal } from '../components/common/StagedLoadingModal';
import { TransactionDrawer } from '../components/common/TransactionDrawer';

export const InvestigationWorkspacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: caseIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const walletParam = searchParams.get('wallet') || 'DEMO_WALLET_001';
  const networkParam = searchParams.get('network') || 'Ethereum';

  const [walletAddress, setWalletAddress] = useState(walletParam);
  const [network, setNetwork] = useState(networkParam);

  // Investigation Result State
  const [data, setData] = useState<InvestigationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStagedModal, setShowStagedModal] = useState(false);
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);

  // Graph state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [currentHops, setCurrentHops] = useState(3);
  const [currentFilter, setCurrentFilter] = useState('ALL');

  // Right Panel Tabs & Visibility
  const [activeTab, setActiveTab] = useState<'WALLET' | 'RISK' | 'FRAUD' | 'AI_DOSSIER' | 'ENTITY'>('WALLET');
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  // Bottom Timeline toggle
  const [timelineExpanded, setTimelineExpanded] = useState(true);

  // Transaction drawer
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [selectedTxObj, setSelectedTxObj] = useState<any | null>(null);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Execute Analysis
  const executeAnalysis = async (targetWallet: string, targetNetwork = 'Ethereum', showModal = true) => {
    if (showModal) {
      setPendingAddress(targetWallet);
      setShowStagedModal(true);
    }
    setLoading(true);

    try {
      const res = await api.analyzeWallet(targetWallet, targetNetwork);
      setData(res);
      setSelectedNodeId(res.wallet.address);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeAnalysis(walletParam, networkParam, true);
  }, [walletParam, networkParam]);

  const handleCopyWallet = () => {
    if (!data?.wallet.address) return;
    navigator.clipboard.writeText(data.wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleInspectTx = async (hash: string) => {
    try {
      const tx = await api.getTransaction(hash);
      setSelectedTxObj(tx);
    } catch {
      // fallback
      setSelectedTxObj({
        txHash: hash,
        amount: 24.5,
        asset: 'ETH',
        network: 'Ethereum',
        timestamp: new Date().toISOString(),
        fromAddress: data?.wallet.address || '0xSender',
        toAddress: '0xRecipient',
        riskScore: 78,
        status: 'CONFIRMED'
      });
    }
  };

  const handleWatchWallet = async () => {
    if (!data?.wallet.address) return;
    try {
      await api.addToWatchlist({
        walletAddress: data.wallet.address,
        network: data.wallet.network,
        label: `Watchlist: ${data.wallet.address.substring(0, 10)}...`,
        priority: data.wallet.riskScore >= 70 ? 'HIGH' : 'MEDIUM'
      });
      alert(`Wallet ${data.wallet.address.substring(0, 10)}... has been added to the Active Watchlist.`);
    } catch (err: any) {
      alert(err.message || 'Error watching wallet');
    }
  };

  const handleExportDossier = async () => {
    if (!data?.wallet.address) return;
    try {
      const report = await api.createReport({
        subjectWallet: data.wallet.address,
        network: data.wallet.network,
        caseName: `Forensic Report on ${data.wallet.address.substring(0, 10)}...`
      });
      navigate(`/reports/${report.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to export dossier');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#060913] select-none" id="investigation-workspace">
      {/* 8-Stage Loading Pipeline Modal */}
      <StagedLoadingModal
        isOpen={showStagedModal}
        address={pendingAddress || walletAddress}
        network={network}
        onComplete={() => setShowStagedModal(false)}
      />

      {/* Transaction Slide-out Drawer */}
      <TransactionDrawer
        transaction={selectedTxObj}
        onClose={() => setSelectedTxObj(null)}
        onTraceInGraph={addr => {
          executeAnalysis(addr, network, true);
        }}
      />

      {/* Top Header Bar */}
      <div className="border-b border-slate-800 bg-[#090e1a]/95 backdrop-blur-md px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4 z-10">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Case ID: {caseIdParam || 'TRX-10482'}
              </span>
              <StatusBadge status="UNDER_INVESTIGATION" />
            </div>

            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-base font-bold font-mono text-white">
                {data?.wallet.address || walletAddress}
              </span>

              <button
                onClick={handleCopyWallet}
                title="Copy Address"
                className="text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {data?.wallet.network || network}
              </span>
            </div>
          </div>
        </div>

        {/* Header Right: Risk & Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60">
            <span className="text-xs font-mono text-slate-400">Risk Assessment:</span>
            <RiskBadge score={data?.risk.score || 87} category={data?.risk.category || 'CRITICAL'} size="md" />
          </div>

          <button
            onClick={() => setSidePanelOpen(p => !p)}
            title={sidePanelOpen ? 'Hide Intelligence Panel' : 'Show Intelligence Panel'}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              sidePanelOpen
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <PanelRight className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{sidePanelOpen ? 'INTELLIGENCE ON' : 'INTELLIGENCE OFF'}</span>
          </button>

          <button
            onClick={handleWatchWallet}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-cyan-500/50 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>WATCH</span>
          </button>

          <button
            onClick={handleExportDossier}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all shadow-md shadow-cyan-950/30"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>EXPORT DOSSIER</span>
          </button>

          <button
            onClick={() => executeAnalysis(walletAddress, network, true)}
            title="Re-run Forensic Pipeline"
            className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Workspace Body: Split between Graph (Left) and Tabbed Intelligence (Right) */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Left: Interactive Graph Container */}
        <div className="flex-1 flex flex-col relative h-full min-w-0 overflow-hidden">
          <div className="flex-1 relative min-h-0 min-w-0 overflow-hidden">
            <InteractiveGraphCanvas
              data={data?.graph || null}
              selectedNodeId={selectedNodeId}
              onSelectNode={nodeId => {
                setSelectedNodeId(nodeId);
              }}
              currentHops={currentHops}
              currentFilter={currentFilter}
              onHopsChange={h => {
                setCurrentHops(h);
                if (data?.wallet.address) {
                  api.getWalletGraph(data.wallet.address, h, currentFilter).then(g => {
                    setData(prev => prev ? { ...prev, graph: g } : null);
                  });
                }
              }}
              onFilterChange={f => {
                setCurrentFilter(f);
                if (data?.wallet.address) {
                  api.getWalletGraph(data.wallet.address, currentHops, f).then(g => {
                    setData(prev => prev ? { ...prev, graph: g } : null);
                  });
                }
              }}
              className="w-full h-full"
            />
          </div>

          {/* Bottom Panel: Collapsible Timeline */}
          <div
            className={`border-t border-slate-800 bg-[#090e1a]/95 transition-all duration-300 flex flex-col min-w-0 max-w-full overflow-hidden shrink-0 ${
              timelineExpanded ? 'h-48' : 'h-8'
            }`}
          >
            <div
              onClick={() => setTimelineExpanded(!timelineExpanded)}
              className="px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono cursor-pointer hover:bg-slate-800/40 text-slate-400 select-none shrink-0"
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Investigation Timeline & Fund Velocity ({data?.timeline.length || 0} Events)
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[10px]">
                <span>Click event to inspect transaction</span>
                {timelineExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </div>
            </div>

            {timelineExpanded && (
              <div className="flex-1 overflow-x-auto p-3 flex items-center space-x-4 scrollbar-thin scrollbar-thumb-slate-800 min-w-0 max-w-full">
                {data?.timeline.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => handleInspectTx(evt.txHash)}
                    className="shrink-0 w-64 p-3 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all text-xs font-mono"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400">
                        {new Date(evt.timestamp).toLocaleDateString()}
                      </span>
                      <RiskBadge score={evt.risk} size="sm" />
                    </div>
                    <p className="font-bold text-white truncate text-[11px]">
                      {evt.event}
                    </p>
                    <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-bold">{evt.amount} {evt.asset}</span>
                      <span className="text-slate-400 truncate max-w-[100px]">{(evt.txHash || '').substring(0, 10)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Tabbed Intelligence Workspace */}
        {sidePanelOpen && (
        <div className="w-80 xl:w-96 border-l border-slate-800 bg-[#080d18] flex flex-col h-full shrink-0 shadow-2xl min-w-0 z-10">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 text-[11px] font-mono font-medium overflow-x-auto">
            <button
              onClick={() => setActiveTab('WALLET')}
              className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'WALLET'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Metrics
            </button>
            <button
              onClick={() => setActiveTab('RISK')}
              className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'RISK'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk ({data?.risk.score || 0})
            </button>
            <button
              onClick={() => setActiveTab('FRAUD')}
              className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'FRAUD'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Findings ({data?.fraudFindings.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('AI_DOSSIER')}
              className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'AI_DOSSIER'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Dossier
            </button>
            <button
              onClick={() => setActiveTab('ENTITY')}
              className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'ENTITY'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              VASP
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono scrollbar-thin scrollbar-thumb-slate-800">
            {/* TAB 1: WALLET INTELLIGENCE */}
            {activeTab === 'WALLET' && data && (
              <div className="space-y-4">
                {/* Financial Summary */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Balance & Ledger Turnover
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 text-[10px]">Net Balance</span>
                      <p className="text-base font-bold text-white">
                        {data.wallet.balance} <span className="text-xs text-cyan-400">ETH</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Net Flow</span>
                      <p className={`text-base font-bold ${data.wallet.netFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.wallet.netFlow >= 0 ? `+${data.wallet.netFlow}` : data.wallet.netFlow} ETH
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Total Inflow</span>
                      <p className="text-sm font-bold text-emerald-400">
                        {data.wallet.totalReceived} ETH
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Total Outflow</span>
                      <p className="text-sm font-bold text-cyan-400">
                        {data.wallet.totalSent} ETH
                      </p>
                    </div>
                  </div>
                </div>

                {/* Velocity & Behavioral Archetypes */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Velocity & Behavioral Metrics
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Forwarding Ratio:</span>
                      <span className="text-white font-bold">{(data.wallet.forwardingRatio * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Avg Time To Forward:</span>
                      <span className="text-amber-400 font-bold">{data.wallet.averageTimeToForwardMinutes.toFixed(1)} min</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Rapid Movement Events:</span>
                      <span className="text-red-400 font-bold">{data.wallet.rapidMovementCount} occurrences</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Burst Execution Events:</span>
                      <span className="text-white font-bold">{data.wallet.burstCount}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Counterparties:</span>
                      <span className="text-white font-bold">{data.wallet.counterpartyCount} entities</span>
                    </div>
                  </div>
                </div>

                {/* Behavioral Archetype Tags */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Behavior Archetypes Classified
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.wallet.behaviorProfile.map((b, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-[10px]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EXPLAINABLE RISK BREAKDOWN */}
            {activeTab === 'RISK' && data && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                  <RiskGauge score={data.risk.score} category={data.risk.category} size={110} />
                  <p className="text-xs text-slate-300 text-center mt-3 leading-relaxed">
                    {data.risk.summary}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Additive Risk Factors ({data.risk.factors.length})
                  </span>
                  {data.risk.factors.map((rf, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">
                          {rf.factor}
                        </span>
                        <span className="text-red-400 font-bold font-mono">
                          +{rf.weight} PTS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {rf.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FRAUD FINDINGS */}
            {activeTab === 'FRAUD' && data && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Detected Threat Patterns ({data.fraudFindings.length})
                  </span>
                  <span className="text-[10px] text-red-400 font-semibold">
                    100% Heuristic Proof
                  </span>
                </div>

                {data.fraudFindings.map(ff => (
                  <div
                    key={ff.id}
                    className="p-3.5 rounded-xl border border-red-900/40 bg-red-950/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-300 text-xs flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        {ff.patternName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                        {ff.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {ff.description}
                    </p>

                    <div className="pt-2 border-t border-red-900/30 text-[10px] text-slate-400">
                      <span className="text-slate-300 font-semibold">Evidence:</span> {ff.evidence}
                    </div>

                    {ff.affectedTransactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[9px] pt-1">
                        <span className="text-slate-400">Affected Txs:</span>
                        {ff.affectedTransactions.map((tx, i) => (
                          <span
                            key={i}
                            onClick={() => handleInspectTx(tx)}
                            className="px-1.5 py-0.2 rounded bg-slate-900 text-cyan-400 hover:underline cursor-pointer"
                          >
                            {(tx || '').substring(0, 8)}...
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: AI INTELLIGENCE DOSSIER */}
            {activeTab === 'AI_DOSSIER' && data && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg border border-cyan-800/60 bg-cyan-950/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">
                      Forensic Intelligence Engine
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {data.aiIntelligence.generatedBy}
                  </span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                      Executive Summary
                    </h4>
                    <p className="text-slate-300 p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      {data.aiIntelligence.executiveSummary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                      Fund Flow Analysis
                    </h4>
                    <p className="text-slate-300 p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      {data.aiIntelligence.fundFlowSummary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                      Key Findings
                    </h4>
                    <ul className="space-y-1 text-slate-300">
                      {data.aiIntelligence.keyFindings.map((f, i) => (
                        <li key={i} className="flex items-start space-x-2 p-1.5 rounded bg-slate-900/30">
                          <span className="text-cyan-400">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                      Recommended Next Analytical Steps
                    </h4>
                    <ul className="space-y-1 text-slate-300">
                      {data.aiIntelligence.recommendedSteps.map((step, i) => (
                        <li key={i} className="flex items-start space-x-2 p-1.5 rounded bg-slate-900/30">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ENTITY / VASP ATTRIBUTION */}
            {activeTab === 'ENTITY' && data && (
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Entity & VASP Attribution
                </span>

                {data.attribution.isAttributed && data.attribution.entity ? (
                  <div className="p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {data.attribution.entity.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Category: {data.attribution.entity.category}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-emerald-900/40 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jurisdiction:</span>
                        <span className="text-slate-200">{data.attribution.entity.jurisdiction}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="text-emerald-400 font-bold">{data.attribution.attributionConfidence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risk Level:</span>
                        <span className="text-amber-400">{data.attribution.entity.riskLevel}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 pt-2 border-t border-emerald-900/40">
                      {data.attribution.note}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
                    <p className="text-slate-300 text-xs">
                      No direct confirmed exchange match on this immediate subject wallet.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Connected Counterparties exhibit exposure to <span className="text-cyan-400">Sigma Mixer Protocol</span> and <span className="text-purple-400">Nexus Bridge</span>.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
            <button
              onClick={() => {
                if (selectedNodeId) {
                  executeAnalysis(selectedNodeId, network, true);
                }
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs tracking-wider transition-all"
            >
              <GitCommit className="w-4 h-4" />
              <span>TRACE FROM SELECTED NODE</span>
            </button>

            <button
              onClick={() => navigate(`/transaction-analysis?search=${encodeURIComponent(data?.wallet.address || '')}`)}
              className="w-full flex items-center justify-center space-x-2 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition-all"
            >
              <span>VIEW TRANSACTION LEDGER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
