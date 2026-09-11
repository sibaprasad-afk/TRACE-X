import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  GitFork,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Layers,
  ChevronRight,
  Filter,
  Flame,
  Globe,
  Building2,
  ExternalLink,
  Search,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { GraphData } from '../types';
import { D3MoneyFlowGraph } from '../components/graph/D3MoneyFlowGraph';

export const MoneyFlowPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const addressParam = searchParams.get('address') || 'DEMO_WALLET_001';

  const [address, setAddress] = useState(addressParam);
  const [inputAddress, setInputAddress] = useState(addressParam);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [traceData, setTraceData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTrajectoryId, setSelectedTrajectoryId] = useState<string | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<string[] | null>(null);
  const [highlightedEdges, setHighlightedEdges] = useState<string[] | null>(null);
  const navigate = useNavigate();

  const loadFlow = async (target: string) => {
    setLoading(true);
    try {
      const [g, trace] = await Promise.all([
        api.getWalletGraph(target, 4, 'ALL'),
        api.traceMoneyFlow(target)
      ]);
      setGraph(g);
      setTraceData(trace);
      setSelectedNode(target);
      setSelectedTrajectoryId(null);
      setHighlightedNodes(null);
      setHighlightedEdges(null);
    } catch (err) {
      console.error('Failed to load money flow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAddress(addressParam);
    setInputAddress(addressParam);
    loadFlow(addressParam);
  }, [addressParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAddress.trim()) {
      setSearchParams({ address: inputAddress.trim() });
    }
  };

  const handleSelectTrajectory = (path: any) => {
    if (selectedTrajectoryId === path.id) {
      // Deselect
      setSelectedTrajectoryId(null);
      setHighlightedNodes(null);
      setHighlightedEdges(null);
    } else {
      setSelectedTrajectoryId(path.id);
      setHighlightedNodes(path.nodeSequence || []);
      setHighlightedEdges(path.edgeSequence || []);
      if (path.nodeSequence && path.nodeSequence.length > 0) {
        setSelectedNode(path.nodeSequence[path.nodeSequence.length - 1]);
      }
    }
  };

  const handleSelectSink = (sinkName: string) => {
    if (!graph) return;
    const found = graph.nodes.find(n => 
      n.label.toLowerCase().includes(sinkName.toLowerCase()) || 
      n.type === sinkName.toLowerCase() ||
      n.id.toLowerCase().includes(sinkName.toLowerCase())
    );
    if (found) {
      setSelectedNode(found.id);
      setHighlightedNodes([found.id, graph.metadata.centralNode]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#040711] select-none" id="money-flow-container">
      {/* Top Controls Header */}
      <div className="border-b border-slate-800/90 bg-[#090e1a]/95 px-5 py-2.5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                D3.js Force-Directed Engine
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                FORENSIC ROUTING
              </span>
            </div>
            <h1 className="text-sm font-bold text-white font-mono mt-0.5">
              Capital Flow Trajectories & Entity Interactions
            </h1>
          </div>
        </div>

        {/* Search / Target Input & Actions */}
        <div className="flex items-center space-x-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={inputAddress}
              onChange={e => setInputAddress(e.target.value)}
              placeholder="Search wallet / contract..."
              className="pl-8 pr-3 py-1 text-xs font-mono bg-slate-900/90 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 w-56"
            />
          </form>

          <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono border-l border-slate-800 pl-3">
            <span className="text-slate-400">Traced:</span>
            <span className="text-cyan-400 font-bold">{traceData?.totalTracedValue || '—'}</span>
          </div>

          <button
            onClick={() => navigate(`/investigations?wallet=${encodeURIComponent(address)}`)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all shadow-md"
          >
            <span>INVESTIGATION WORKSPACE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Area: D3 Force Directed Graph Canvas (Left) & Flow Pathways Drawer (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* D3 Graph Canvas */}
        <div className="flex-1 relative h-full min-w-0 overflow-hidden">
          <D3MoneyFlowGraph
            data={graph}
            selectedNodeId={selectedNode}
            highlightedPathNodeIds={highlightedNodes}
            highlightedPathEdgeIds={highlightedEdges}
            onSelectNode={nodeId => setSelectedNode(nodeId)}
            onInspectTx={txHash => navigate(`/transactions/${encodeURIComponent(txHash)}`)}
            className="w-full h-full"
          />
        </div>

        {/* Right Side: Flow Paths, Sinks & Forensic Intelligence */}
        <div className="w-80 xl:w-96 border-l border-slate-800/90 bg-[#080d18] p-4 overflow-y-auto space-y-4 text-xs font-mono shrink-0 scrollbar-thin scrollbar-thumb-slate-800 z-10">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white uppercase text-xs">
                Ranked Liquidity Pathways
              </h3>
              {selectedTrajectoryId && (
                <button
                  onClick={() => {
                    setSelectedTrajectoryId(null);
                    setHighlightedNodes(null);
                    setHighlightedEdges(null);
                  }}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                >
                  Clear Path
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Multi-hop disbursement trajectories prioritized by volume and risk. Click any trajectory to highlight its exact vector in D3.
            </p>
          </div>

          {/* Trajectory Cards */}
          <div className="space-y-2.5">
            {traceData?.paths?.map((p: any, i: number) => {
              const isSelected = selectedTrajectoryId === p.id;
              return (
                <div
                  key={p.id || i}
                  onClick={() => handleSelectTrajectory(p)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 select-none ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/70 shadow-lg shadow-cyan-950/30'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-cyan-400">
                        Trajectory #{i + 1}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                          HIGHLIGHTED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {p.hops} Hops
                    </span>
                  </div>

                  <div className="text-[11px] text-white font-bold flex items-center justify-between">
                    <span className="text-slate-400 font-normal">Dispatched Volume:</span>
                    <span className="text-cyan-300 font-mono">{p.totalAmount} ETH</span>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-slate-500">Origin:</span>
                      <span className="text-white truncate font-mono">{p.origin}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-slate-500">Terminal Sink:</span>
                      <span className="text-red-400 font-bold truncate font-mono">{p.destination}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Destination Class:</span>
                    <span
                      className={`font-bold ${
                        p.sinkType?.includes('Mixer')
                          ? 'text-red-400'
                          : p.sinkType?.includes('Bridge')
                          ? 'text-purple-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {p.sinkType}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sinks Summary */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Identified Liquidity Sinks
              </span>
              <span className="text-[9px] text-slate-500">Click to locate</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div
                onClick={() => handleSelectSink('mixer')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/20 border border-red-800/30 hover:border-red-600/50 cursor-pointer transition-all"
              >
                <span className="flex items-center gap-1.5 text-red-300">
                  <Flame className="w-3.5 h-3.5 text-red-400" /> Sigma Mixer
                </span>
                <span className="text-white font-bold">185.0 ETH</span>
              </div>
              <div
                onClick={() => handleSelectSink('bridge')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-purple-950/20 border border-purple-800/30 hover:border-purple-600/50 cursor-pointer transition-all"
              >
                <span className="flex items-center gap-1.5 text-purple-300">
                  <Globe className="w-3.5 h-3.5 text-purple-400" /> Nexus Bridge
                </span>
                <span className="text-white font-bold">95.4 ETH</span>
              </div>
              <div
                onClick={() => handleSelectSink('exchange')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 hover:border-emerald-600/50 cursor-pointer transition-all"
              >
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Kraken Exchange
                </span>
                <span className="text-white font-bold">211.9 ETH</span>
              </div>
            </div>
          </div>

          {/* Quick Forensic Info Note */}
          <div className="p-3.5 rounded-xl border border-slate-800/70 bg-slate-950/40 text-[10px] text-slate-400 space-y-1">
            <div className="text-white font-bold flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>D3 Interactive Navigation Guide</span>
            </div>
            <p>
              • Drag nodes to untangle interconnected clusters.
            </p>
            <p>
              • Toggle between Organic (force-directed) and Pipeline (left-to-right flow) modes.
            </p>
            <p>
              • Use mouse wheel or bottom controls to zoom and pan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

