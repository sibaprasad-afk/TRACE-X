import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Filter,
  Layers,
  Info,
  ShieldAlert,
  Flame,
  Globe,
  Building2,
  Sparkles
} from 'lucide-react';
import { GraphData, GraphNode, GraphEdge } from '../../types';

interface InteractiveGraphCanvasProps {
  data: GraphData | null;
  selectedNodeId?: string | null;
  onSelectNode: (nodeId: string) => void;
  onFilterChange?: (filter: string) => void;
  onHopsChange?: (hops: number) => void;
  currentHops?: number;
  currentFilter?: string;
  className?: string;
}

export const InteractiveGraphCanvas: React.FC<InteractiveGraphCanvasProps> = ({
  data,
  selectedNodeId,
  onSelectNode,
  onFilterChange,
  onHopsChange,
  currentHops = 3,
  currentFilter = 'ALL',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 620 });

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Node drag state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Hover state
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Node positions map { id: { x, y } }
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Dynamic container resize tracking
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 50) {
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Layout calculation
  useEffect(() => {
    if (!data || data.nodes.length === 0) return;

    const w = dimensions.width || 800;
    const h = dimensions.height || 550;
    const centerX = Math.round(w / 2);
    const centerY = Math.round(h / 2);

    const newPos = new Map<string, { x: number; y: number }>();
    const centralId = (data.metadata?.centralNode || data.nodes[0]?.id || '').toLowerCase();
    const subjectNode = data.nodes.find(n => n.id.toLowerCase() === centralId) || data.nodes[0];

    // Place subject node at center
    if (subjectNode) {
      newPos.set(subjectNode.id.toLowerCase(), { x: centerX, y: centerY });
    }

    // Group remaining nodes by type or distance
    const otherNodes = data.nodes.filter(n => n.id.toLowerCase() !== subjectNode?.id.toLowerCase());

    let leftCount = 0;
    let rightCount = 0;
    let farRightCount = 0;

    otherNodes.forEach((node) => {
      const lowerId = node.id.toLowerCase();
      // Check if node is sender to subject
      const isSender = data.edges.some(e => e.source.toLowerCase() === lowerId && e.target.toLowerCase() === centralId);
      const isMixerOrBridge = node.type === 'mixer' || node.type === 'bridge' || node.type === 'exchange';

      let x = centerX;
      let y = centerY;

      if (isSender) {
        // Place in arc on left
        const totalSenders = otherNodes.filter(n => data.edges.some(e => e.source.toLowerCase() === n.id.toLowerCase() && e.target.toLowerCase() === centralId)).length || 1;
        const angle = -Math.PI / 2.3 + ((leftCount + 0.5) / Math.max(1, totalSenders)) * (Math.PI * 0.86);
        const radius = Math.min(260, Math.max(160, w * 0.28)) + (leftCount % 2) * 35;
        x = centerX - Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * radius;
        leftCount++;
      } else if (isMixerOrBridge) {
        // Place on far right
        const totalExits = otherNodes.filter(n => n.type === 'mixer' || n.type === 'bridge' || n.type === 'exchange').length || 1;
        const angle = -Math.PI / 3 + ((farRightCount + 0.5) / Math.max(1, totalExits)) * (2 * Math.PI / 3);
        const radius = Math.min(320, Math.max(200, w * 0.35));
        x = centerX + Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * radius;
        farRightCount++;
      } else {
        // Intermediate layer
        const angle = -Math.PI / 2.5 + ((rightCount + 0.5) / Math.max(1, otherNodes.length - leftCount - farRightCount)) * (2 * Math.PI / 2.5);
        const radius = Math.min(200, Math.max(130, w * 0.22)) + (rightCount % 2) * 30;
        x = centerX + Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * radius;
        rightCount++;
      }

      newPos.set(lowerId, { x, y });
    });

    setPositions(newPos);
  }, [data, dimensions.width, dimensions.height]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(z => Math.max(0.4, Math.min(2.5, z * zoomFactor)));
  };

  // Drag canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !draggedNodeId) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    if (draggedNodeId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        // Convert screen clientX/Y to transformed canvas coordinates
        const canvasX = (e.clientX - rect.left - pan.x) / zoom;
        const canvasY = (e.clientY - rect.top - pan.y) / zoom;
        setPositions(prev => {
          const next = new Map(prev);
          next.set(draggedNodeId.toLowerCase(), { x: canvasX, y: canvasY });
          return next;
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const fitView = () => {
    setZoom(0.85);
    setPan({ x: 20, y: 10 });
  };

  // Node color helper
  const getNodeVisual = (node: GraphNode) => {
    if (node.isSubject) {
      return {
        fill: '#0f172a',
        stroke: '#06b6d4',
        borderWidth: 3,
        radius: 26,
        glow: 'rgba(6, 182, 212, 0.6)',
        iconColor: '#06b6d4'
      };
    }
    if (node.type === 'mixer') {
      return {
        fill: '#450a0a',
        stroke: '#ef4444',
        borderWidth: 2.5,
        radius: 24,
        glow: 'rgba(239, 68, 68, 0.6)',
        iconColor: '#f87171'
      };
    }
    if (node.type === 'bridge') {
      return {
        fill: '#2e1065',
        stroke: '#a855f7',
        borderWidth: 2,
        radius: 22,
        glow: 'rgba(168, 85, 247, 0.4)',
        iconColor: '#c084fc'
      };
    }
    if (node.type === 'exchange') {
      return {
        fill: '#022c22',
        stroke: '#10b981',
        borderWidth: 2,
        radius: 22,
        glow: 'rgba(16, 185, 129, 0.4)',
        iconColor: '#34d399'
      };
    }

    // Regular wallet by risk
    if (node.risk >= 70) {
      return {
        fill: '#451a03',
        stroke: '#f97316',
        borderWidth: 2,
        radius: 19,
        glow: 'rgba(249, 115, 22, 0.3)',
        iconColor: '#fb923c'
      };
    }

    return {
      fill: '#1e293b',
      stroke: '#475569',
      borderWidth: 1.5,
      radius: 18,
      glow: 'transparent',
      iconColor: '#94a3b8'
    };
  };

  if (!data || data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center border border-slate-800 rounded-xl bg-[#0a0f1d] p-8 text-center text-slate-500">
        <Layers className="w-10 h-10 mb-3 text-slate-600" />
        <p className="text-sm font-semibold text-slate-300">No Graph Data Available</p>
        <p className="text-xs text-slate-500 mt-1">Initiate a wallet screening to construct forensic topology.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full overflow-hidden rounded-xl border border-slate-800 bg-[#070b14] select-none cursor-grab active:cursor-grabbing ${className}`}
      id="trace-x-interactive-graph"
    >
      {/* Background Subtle Tech Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Hops Selector */}
        <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 uppercase">
            Hops:
          </span>
          {[1, 2, 3, 4, 5, 6].map(h => (
            <button
              key={h}
              onClick={() => onHopsChange && onHopsChange(h)}
              className={`px-2 py-0.5 text-xs font-mono font-semibold rounded transition-all ${
                currentHops === h
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        {/* Filter Selector */}
        <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 shadow-lg backdrop-blur-md">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {['ALL', 'INCOMING', 'OUTGOING', 'SUSPICIOUS', 'HIGH_VALUE'].map(f => (
            <button
              key={f}
              onClick={() => onFilterChange && onFilterChange(f)}
              className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded transition-all ${
                currentFilter === f
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport Zoom / Reset Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setZoom(z => Math.min(2.5, z * 1.2))}
          title="Zoom In"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z * 0.8))}
          title="Zoom Out"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={fitView}
          title="Fit to Screen"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          title="Reset View"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas with Viewport Group */}
      <svg
        width="100%"
        height="100%"
        className="w-full h-full block"
      >
        <defs>
          {/* Arrow markers */}
          <marker
            id="arrow-normal"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
          </marker>

          <marker
            id="arrow-suspicious"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#f87171" />
          </marker>
        </defs>

        {/* Viewport Transform Group for Zoom & Pan */}
        <g id="viewport-group" transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. Render Edges */}
          <g id="edges-group">
            {data.edges.map(edge => {
              const p1 = positions.get(edge.source.toLowerCase());
              const p2 = positions.get(edge.target.toLowerCase());
              if (!p1 || !p2) return null;

              const isSuspicious = edge.isSuspicious || edge.risk >= 70;
              const strokeColor = isSuspicious ? '#ef4444' : '#334155';
              const strokeWidth = Math.max(1.2, Math.min(4, Math.log10(edge.amount + 1) * 2));

              // Midpoint for label
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <g key={edge.id} className="transition-opacity duration-200">
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isSuspicious ? '4,3' : 'none'}
                    markerEnd={isSuspicious ? 'url(#arrow-suspicious)' : 'url(#arrow-normal)'}
                    opacity={0.75}
                  />

                  {/* Amount label */}
                  <rect
                    x={midX - 22}
                    y={midY - 8}
                    width="44"
                    height="16"
                    rx="3"
                    fill="#070b14"
                    stroke={isSuspicious ? '#7f1d1d' : '#1e293b'}
                    strokeWidth="0.8"
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    textAnchor="middle"
                    fill={isSuspicious ? '#fca5a5' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {edge.amount} {edge.asset}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 2. Render Nodes */}
          <g id="nodes-group">
            {data.nodes.map(node => {
              const pos = positions.get(node.id.toLowerCase());
              if (!pos) return null;

              const visual = getNodeVisual(node);
              const isSelected = selectedNodeId?.toLowerCase() === node.id.toLowerCase();

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={e => {
                    e.stopPropagation();
                    setDraggedNodeId(node.id);
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    onSelectNode(node.id);
                  }}
                  onMouseEnter={e => {
                    setHoveredNode(node);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer group"
                >
                  {/* Subtle highlight ring for subject or selected */}
                  {(isSelected || node.isSubject) && (
                    <circle
                      r={visual.radius + 6}
                      fill="none"
                      stroke={isSelected ? '#22d3ee' : '#06b6d4'}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      opacity="0.85"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={visual.radius}
                    fill={visual.fill}
                    stroke={isSelected ? '#22d3ee' : visual.stroke}
                    strokeWidth={isSelected ? 3.5 : visual.borderWidth}
                  />

                  {/* Node center Icon/Badge */}
                  <g transform="translate(-7, -7)" className="pointer-events-none">
                    {node.type === 'mixer' && <Flame size={14} className="text-red-400" />}
                    {node.type === 'bridge' && <Globe size={14} className="text-purple-400" />}
                    {node.type === 'exchange' && <Building2 size={14} className="text-emerald-400" />}
                    {node.isSubject && <Sparkles size={14} className="text-cyan-400" />}
                  </g>

                  {/* Label text with crisp dark outline */}
                  <text
                    y={visual.radius + 14}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none"
                    stroke="#020617"
                    strokeWidth="2.5"
                    paintOrder="stroke fill"
                  >
                    {node.label}
                  </text>

                  {/* Risk pill underneath */}
                  <rect
                    x="-18"
                    y={visual.radius + 20}
                    width="36"
                    height="12"
                    rx="3"
                    fill={node.risk >= 70 ? '#7f1d1d' : node.risk >= 40 ? '#78350f' : '#064e3b'}
                  />
                  <text
                    y={visual.radius + 29}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.risk} PTS
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* MiniMap in bottom left */}
      <div className="absolute bottom-4 left-4 z-20 w-36 h-28 rounded-lg border border-slate-800 bg-[#090e1a]/90 backdrop-blur-md p-2 hidden sm:block shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
          <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase">
            Topological Map
          </span>
          <span className="text-[9px] font-mono text-cyan-400">
            {data.nodes.length}N • {data.edges.length}E
          </span>
        </div>
        <div className="w-full h-20 relative bg-slate-950/50 rounded overflow-hidden">
          {data.nodes.map(n => {
            const p = positions.get(n.id.toLowerCase());
            if (!p) return null;
            const sx = (p.x / dimensions.width) * 100;
            const sy = (p.y / dimensions.height) * 100;
            return (
              <div
                key={`mini_${n.id}`}
                className={`absolute w-1.5 h-1.5 rounded-full -translate-x-0.5 -translate-y-0.5 ${
                  n.isSubject
                    ? 'bg-cyan-400 ring-1 ring-cyan-200'
                    : n.type === 'mixer'
                    ? 'bg-red-500'
                    : n.type === 'bridge'
                    ? 'bg-purple-400'
                    : 'bg-slate-500'
                }`}
                style={{ left: `${Math.max(5, Math.min(95, sx))}%`, top: `${Math.max(5, Math.min(95, sy))}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Legend in bottom right */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 shadow-lg backdrop-blur-md text-[10px] font-mono text-slate-300">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-1 ring-cyan-200" />
          <span>Subject</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Mixer / High Risk</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span>Bridge</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Exchange</span>
        </div>
      </div>

      {/* Tooltip on hover */}
      {hoveredNode && (
        <div
          className="pointer-events-none fixed z-50 transform -translate-x-1/2 -translate-y-full -mt-3 p-2.5 rounded-lg border border-slate-700 bg-slate-950/95 shadow-2xl text-xs font-mono"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="font-bold text-white mb-0.5">{hoveredNode.label}</div>
          <div className="text-slate-400 text-[11px] truncate max-w-xs">{hoveredNode.id}</div>
          <div className="mt-1 flex items-center justify-between gap-3 text-[10px] pt-1 border-t border-slate-800">
            <span className="text-slate-400">Risk Score:</span>
            <span className={`font-bold ${hoveredNode.risk >= 70 ? 'text-red-400' : 'text-emerald-400'}`}>
              {hoveredNode.risk} / 100 ({hoveredNode.riskCategory})
            </span>
          </div>
          {hoveredNode.balance !== undefined && (
            <div className="flex items-center justify-between gap-3 text-[10px]">
              <span className="text-slate-400">Balance:</span>
              <span className="text-white">{hoveredNode.balance} ETH</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
