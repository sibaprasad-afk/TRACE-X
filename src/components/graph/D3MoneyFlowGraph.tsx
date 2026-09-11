import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Flame,
  Globe,
  Building2,
  Sparkles,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Play,
  Pause,
  Filter,
  Eye,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Sliders
} from 'lucide-react';
import { GraphData, GraphNode, GraphEdge } from '../../types';

export interface D3Node extends d3.SimulationNodeDatum, GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  radius?: number;
}

export interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: string | D3Node;
  target: string | D3Node;
  amount: number;
  asset: string;
  timestamp: string;
  risk: number;
  type: 'transfer' | 'bridge' | 'interaction' | 'mixer_deposit';
  isSuspicious?: boolean;
  txHash: string;
}

interface D3MoneyFlowGraphProps {
  data: GraphData | null;
  selectedNodeId?: string | null;
  highlightedPathNodeIds?: string[] | null;
  highlightedPathEdgeIds?: string[] | null;
  onSelectNode?: (nodeId: string) => void;
  onInspectTx?: (txHash: string) => void;
  className?: string;
}

export const D3MoneyFlowGraph: React.FC<D3MoneyFlowGraphProps> = ({
  data,
  selectedNodeId,
  highlightedPathNodeIds = null,
  highlightedPathEdgeIds = null,
  onSelectNode,
  onInspectTx,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Layout mode & filter state
  const [layoutMode, setLayoutMode] = useState<'ORGANIC' | 'DIRECTED'>('ORGANIC');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH_RISK'>('ALL');
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [chargeStrength, setChargeStrength] = useState<number>(-340);
  const [showControls, setShowControls] = useState<boolean>(false);

  // Tooltip & Inspector State
  const [hoveredNode, setHoveredNode] = useState<D3Node | null>(null);
  const [hoveredLink, setHoveredLink] = useState<D3Link | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState<boolean>(false);

  // Dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 600
  });

  // Track container dimensions with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 50) {
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Filtered nodes and edges based on filters
  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (!data || !data.nodes || data.nodes.length === 0) {
      return { filteredNodes: [], filteredEdges: [] };
    }

    let edges = data.edges.slice();
    let nodes = data.nodes.slice();

    if (riskFilter === 'HIGH_RISK') {
      edges = edges.filter(e => e.risk >= 70 || e.isSuspicious);
      const activeNodeIds = new Set<string>();
      edges.forEach(e => {
        activeNodeIds.add(e.source.toLowerCase());
        activeNodeIds.add(e.target.toLowerCase());
      });
      // Always include central node
      if (data.metadata?.centralNode) {
        activeNodeIds.add(data.metadata.centralNode.toLowerCase());
      }
      nodes = nodes.filter(n => activeNodeIds.has(n.id.toLowerCase()) || n.isSubject || n.risk >= 70);
    }

    if (minAmount > 0) {
      edges = edges.filter(e => e.amount >= minAmount);
    }

    return { filteredNodes: nodes, filteredEdges: edges };
  }, [data, riskFilter, minAmount]);

  // Determine node visual characteristics
  const getNodeVisual = useCallback((node: GraphNode) => {
    let radius = 18;
    let fill = '#0f172a';
    let stroke = '#38bdf8';
    let label = node.label || node.id.substring(0, 8);

    if (node.isSubject) {
      radius = 26;
      fill = '#083344';
      stroke = '#22d3ee';
    } else if (node.type === 'mixer') {
      radius = 24;
      fill = '#450a0a';
      stroke = '#ef4444';
    } else if (node.type === 'bridge') {
      radius = 22;
      fill = '#3b0764';
      stroke = '#c084fc';
    } else if (node.type === 'exchange') {
      radius = 22;
      fill = '#022c22';
      stroke = '#34d399';
    } else if (node.risk >= 75) {
      radius = 20;
      fill = '#3f1115';
      stroke = '#f87171';
    } else if (node.risk >= 45) {
      radius = 18;
      fill = '#2e1c0c';
      stroke = '#fbbf24';
    }

    return { radius, fill, stroke, label };
  }, []);

  // Initialize and run D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current || !gRef.current || filteredNodes.length === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    // Setup Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    // Deep clone data for D3 mutation
    const nodes: D3Node[] = filteredNodes.map(n => {
      const v = getNodeVisual(n);
      return {
        ...n,
        radius: v.radius,
        // Preserve previous positions if any to avoid jarring jumps
        x: simulationRef.current?.nodes().find(prev => prev.id === n.id)?.x ?? (centerX + (Math.random() - 0.5) * 200),
        y: simulationRef.current?.nodes().find(prev => prev.id === n.id)?.y ?? (centerY + (Math.random() - 0.5) * 200)
      };
    });

    const nodeIds = new Set(nodes.map(n => n.id.toLowerCase()));
    const validEdges = filteredEdges.filter(e =>
      nodeIds.has(e.source.toLowerCase()) && nodeIds.has(e.target.toLowerCase())
    );

    const links: D3Link[] = validEdges.map(e => ({
      ...e,
      source: e.source.toLowerCase(),
      target: e.target.toLowerCase()
    }));

    // Stop old simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Configure Forces
    const linkForce = d3.forceLink<D3Node, D3Link>(links)
      .id(d => d.id.toLowerCase())
      .distance(d => {
        if (d.type === 'mixer_deposit' || d.type === 'bridge') return 180;
        return Math.max(90, 160 - Math.min(80, d.amount * 2));
      })
      .strength(0.65);

    const collideForce = d3.forceCollide<D3Node>()
      .radius(d => (d.radius || 20) + 24)
      .iterations(2);

    const chargeForce = d3.forceManyBody<D3Node>()
      .strength(chargeStrength);

    const centerForce = d3.forceCenter(centerX, centerY);

    const simulation = d3.forceSimulation<D3Node, D3Link>(nodes)
      .force('link', linkForce)
      .force('charge', chargeForce)
      .force('center', centerForce)
      .force('collide', collideForce);

    // Apply directional X/Y forces if DIRECTED mode is active
    if (layoutMode === 'DIRECTED') {
      const central = (data?.metadata?.centralNode || '').toLowerCase();
      simulation
        .force('x', d3.forceX<D3Node>(d => {
          const lowerId = d.id.toLowerCase();
          if (lowerId === central || d.isSubject) return centerX;
          // Inflows to left
          const isInflow = links.some(l => {
            const tgt = typeof l.target === 'object' ? l.target.id.toLowerCase() : l.target;
            const src = typeof l.source === 'object' ? l.source.id.toLowerCase() : l.source;
            return tgt === central && src === lowerId;
          });
          if (isInflow) return width * 0.22;

          // Outflow Sinks to far right
          if (d.type === 'mixer' || d.type === 'bridge' || d.type === 'exchange') {
            return width * 0.82;
          }
          // Intermediaries to mid-right
          return width * 0.65;
        }).strength(0.85))
        .force('y', d3.forceY<D3Node>(centerY).strength(0.2));
    }

    // D3 Node Drag Behavior
    const dragBehavior = d3.drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        // Release fixed position unless desired
        d.fx = null;
        d.fy = null;
      });

    // Tick Handler - updates DOM elements
    simulation.on('tick', () => {
      // 1. Update Edge Lines
      g.selectAll<SVGLineElement, D3Link>('.d3-edge')
        .attr('x1', d => (typeof d.source === 'object' ? d.source.x || 0 : 0))
        .attr('y1', d => (typeof d.source === 'object' ? d.source.y || 0 : 0))
        .attr('x2', d => (typeof d.target === 'object' ? d.target.x || 0 : 0))
        .attr('y2', d => (typeof d.target === 'object' ? d.target.y || 0 : 0));

      // 2. Update Edge Amount Pill Badges
      g.selectAll<SVGGElement, D3Link>('.d3-edge-label-group')
        .attr('transform', d => {
          const sx = typeof d.source === 'object' ? d.source.x || 0 : 0;
          const sy = typeof d.source === 'object' ? d.source.y || 0 : 0;
          const tx = typeof d.target === 'object' ? d.target.x || 0 : 0;
          const ty = typeof d.target === 'object' ? d.target.y || 0 : 0;
          return `translate(${(sx + tx) / 2}, ${(sy + ty) / 2})`;
        });

      // 3. Update Animated Flow Particles (if active)
      if (showParticles) {
        const progress = (Date.now() % 2400) / 2400;
        g.selectAll<SVGCircleElement, D3Link>('.d3-flow-particle')
          .attr('cx', d => {
            const sx = typeof d.source === 'object' ? d.source.x || 0 : 0;
            const tx = typeof d.target === 'object' ? d.target.x || 0 : 0;
            return sx + (tx - sx) * progress;
          })
          .attr('cy', d => {
            const sy = typeof d.source === 'object' ? d.source.y || 0 : 0;
            const ty = typeof d.target === 'object' ? d.target.y || 0 : 0;
            return sy + (ty - sy) * progress;
          });
      }

      // 4. Update Node Groups
      g.selectAll<SVGGElement, D3Node>('.d3-node-group')
        .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Render / Bind Elements
    // ----------------------------------------------------
    // Clear previous elements
    g.selectAll('*').remove();

    // 1. Edges Layer
    const edgeGroup = g.append('g').attr('class', 'edges-layer');
    const labelGroup = g.append('g').attr('class', 'labels-layer');
    const particleGroup = g.append('g').attr('class', 'particles-layer');

    // Edges
    edgeGroup.selectAll<SVGLineElement, D3Link>('.d3-edge')
      .data(links, d => d.id)
      .join('line')
      .attr('class', 'd3-edge cursor-pointer transition-opacity duration-200')
      .attr('stroke', d => {
        const isPathHighlighted = highlightedPathEdgeIds?.includes(d.id);
        if (isPathHighlighted) return '#38bdf8';
        if (d.isSuspicious || d.risk >= 70) return '#ef4444';
        if (d.type === 'mixer_deposit') return '#dc2626';
        if (d.type === 'bridge') return '#a855f7';
        return '#334155';
      })
      .attr('stroke-width', d => {
        const isPathHighlighted = highlightedPathEdgeIds?.includes(d.id);
        const baseWidth = Math.max(1.4, Math.min(5, Math.log2(d.amount + 1) * 1.6));
        return isPathHighlighted ? baseWidth + 2 : baseWidth;
      })
      .attr('stroke-dasharray', d => (d.isSuspicious || d.risk >= 70 ? '5,4' : 'none'))
      .attr('marker-end', d => {
        if (highlightedPathEdgeIds?.includes(d.id)) return 'url(#arrow-cyan)';
        if (d.isSuspicious || d.risk >= 70) return 'url(#arrow-red)';
        if (d.type === 'bridge') return 'url(#arrow-purple)';
        return 'url(#arrow-slate)';
      })
      .attr('opacity', d => {
        if (highlightedPathEdgeIds && highlightedPathEdgeIds.length > 0) {
          return highlightedPathEdgeIds.includes(d.id) ? 1.0 : 0.15;
        }
        return 0.75;
      })
      .on('mouseenter', (event, d) => {
        setHoveredLink(d);
        setTooltipPos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', () => setHoveredLink(null))
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onInspectTx && d.txHash) onInspectTx(d.txHash);
      });

    // Edge Labels (Amounts)
    const edgeLabels = labelGroup.selectAll<SVGGElement, D3Link>('.d3-edge-label-group')
      .data(links, d => d.id)
      .join('g')
      .attr('class', 'd3-edge-label-group pointer-events-none select-none')
      .attr('opacity', d => {
        if (highlightedPathEdgeIds && highlightedPathEdgeIds.length > 0) {
          return highlightedPathEdgeIds.includes(d.id) ? 1.0 : 0.2;
        }
        return 0.85;
      });

    edgeLabels.append('rect')
      .attr('x', -24)
      .attr('y', -8)
      .attr('width', 48)
      .attr('height', 16)
      .attr('rx', 4)
      .attr('fill', '#050811')
      .attr('stroke', d => (d.isSuspicious || d.risk >= 70 ? '#7f1d1d' : '#1e293b'))
      .attr('stroke-width', 0.8);

    edgeLabels.append('text')
      .attr('y', 3.5)
      .attr('text-anchor', 'middle')
      .attr('fill', d => (d.isSuspicious || d.risk >= 70 ? '#fca5a5' : '#94a3b8'))
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '600')
      .text(d => `${d.amount} ${d.asset}`);

    // Flow Particles
    if (showParticles) {
      particleGroup.selectAll<SVGCircleElement, D3Link>('.d3-flow-particle')
        .data(links.filter(l => l.amount > 0.5), d => d.id)
        .join('circle')
        .attr('class', 'd3-flow-particle pointer-events-none')
        .attr('r', d => (d.isSuspicious || d.risk >= 70 ? 3.5 : 2.5))
        .attr('fill', d => {
          if (highlightedPathEdgeIds?.includes(d.id)) return '#38bdf8';
          if (d.isSuspicious || d.risk >= 70) return '#f87171';
          if (d.type === 'bridge') return '#c084fc';
          return '#67e8f9';
        })
        .attr('opacity', 0.9);
    }

    // 2. Nodes Layer
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');

    const nodeElements = nodeGroup.selectAll<SVGGElement, D3Node>('.d3-node-group')
      .data(nodes, d => d.id)
      .join('g')
      .attr('class', 'd3-node-group cursor-pointer select-none')
      .attr('opacity', d => {
        if (highlightedPathNodeIds && highlightedPathNodeIds.length > 0) {
          return highlightedPathNodeIds.map(id => id.toLowerCase()).includes(d.id.toLowerCase())
            ? 1.0
            : 0.2;
        }
        return 1.0;
      })
      .call(dragBehavior)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onSelectNode) onSelectNode(d.id);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        setTooltipPos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', () => setHoveredNode(null));

    // Outer Target Pulse Ring for Subject
    nodeElements.each(function(d) {
      const el = d3.select(this);
      const isSelected = selectedNodeId?.toLowerCase() === d.id.toLowerCase();
      const isHighlightedPath = highlightedPathNodeIds?.map(id => id.toLowerCase()).includes(d.id.toLowerCase());

      if (d.isSubject || isSelected || isHighlightedPath) {
        el.append('circle')
          .attr('class', 'pulse-ring')
          .attr('r', (d.radius || 20) + 7)
          .attr('fill', 'none')
          .attr('stroke', isSelected ? '#22d3ee' : d.isSubject ? '#06b6d4' : '#38bdf8')
          .attr('stroke-width', 1.8)
          .attr('stroke-dasharray', '4 3')
          .attr('opacity', 0.85);
      }

      // Risk score gauge ring
      const riskColor = d.risk >= 85 ? '#ef4444' : d.risk >= 70 ? '#f97316' : d.risk >= 40 ? '#eab308' : '#10b981';
      el.append('circle')
        .attr('r', (d.radius || 20) + 3)
        .attr('fill', 'none')
        .attr('stroke', riskColor)
        .attr('stroke-width', 2)
        .attr('opacity', 0.65);

      // Main Node Circle Body
      const visual = getNodeVisual(d);
      el.append('circle')
        .attr('r', d.radius || 20)
        .attr('fill', visual.fill)
        .attr('stroke', isSelected ? '#22d3ee' : visual.stroke)
        .attr('stroke-width', isSelected ? 3.5 : 2);

      // Node Label Text with Dark Outline
      el.append('text')
        .attr('y', (d.radius || 20) + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f1f5f9')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', '700')
        .attr('stroke', '#020617')
        .attr('stroke-width', '3px')
        .attr('paint-order', 'stroke fill')
        .text(visual.label);

      // Node Risk Badge under text
      el.append('rect')
        .attr('x', -18)
        .attr('y', (d.radius || 20) + 21)
        .attr('width', 36)
        .attr('height', 12)
        .attr('rx', 3)
        .attr('fill', d.risk >= 70 ? '#7f1d1d' : d.risk >= 40 ? '#78350f' : '#064e3b');

      el.append('text')
        .attr('y', (d.radius || 20) + 30)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '8px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`${d.risk} PTS`);
    });

    simulationRef.current = simulation;

    // Optional particle animation interval
    let particleInterval: NodeJS.Timeout | null = null;
    if (showParticles) {
      particleInterval = setInterval(() => {
        if (!isPaused && simulationRef.current) {
          const progress = (Date.now() % 2400) / 2400;
          g.selectAll<SVGCircleElement, D3Link>('.d3-flow-particle')
            .attr('cx', d => {
              const sx = typeof d.source === 'object' ? d.source.x || 0 : 0;
              const tx = typeof d.target === 'object' ? d.target.x || 0 : 0;
              return sx + (tx - sx) * progress;
            })
            .attr('cy', d => {
              const sy = typeof d.source === 'object' ? d.source.y || 0 : 0;
              const ty = typeof d.target === 'object' ? d.target.y || 0 : 0;
              return sy + (ty - sy) * progress;
            });
        }
      }, 40);
    }

    return () => {
      simulation.stop();
      if (particleInterval) clearInterval(particleInterval);
    };
  }, [
    filteredNodes,
    filteredEdges,
    dimensions.width,
    dimensions.height,
    layoutMode,
    chargeStrength,
    showParticles,
    selectedNodeId,
    highlightedPathNodeIds,
    highlightedPathEdgeIds,
    getNodeVisual,
    onSelectNode,
    onInspectTx
  ]);

  // Pause / Resume simulation
  const togglePause = () => {
    if (!simulationRef.current) return;
    if (isPaused) {
      simulationRef.current.alpha(0.3).restart();
      setIsPaused(false);
    } else {
      simulationRef.current.stop();
      setIsPaused(true);
    }
  };

  // Zoom controls
  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(280)
      .call(zoomBehaviorRef.current.scaleBy, factor);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    if (simulationRef.current) {
      simulationRef.current.alpha(0.4).restart();
      setIsPaused(false);
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Find currently selected node object
  const activeSelectedNode = useMemo(() => {
    if (!selectedNodeId || !data) return null;
    return data.nodes.find(n => n.id.toLowerCase() === selectedNodeId.toLowerCase()) || null;
  }, [selectedNodeId, data]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#040711] select-none ${className}`}
      id="d3-money-flow-graph-container"
    >
      {/* Background forensic coordinates grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Top Left Floating Legend & Quick Stats */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-[#090e1a]/90 backdrop-blur-md border border-slate-800/90 rounded-xl px-3 py-2 text-xs font-mono shadow-xl">
        <div className="flex items-center space-x-1.5 pr-2.5 border-r border-slate-800 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-white">D3 Forensic Engine</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>Target Hub</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span>Mixer Sinks</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            <span>Bridges</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Exchanges</span>
          </span>
        </div>
      </div>

      {/* Top Right Forensic Simulation Controls Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
        {/* Layout Mode Toggle */}
        <div className="bg-[#090e1a]/90 backdrop-blur-md border border-slate-800/90 rounded-xl p-1 flex items-center space-x-1 shadow-xl text-xs font-mono">
          <button
            onClick={() => setLayoutMode('ORGANIC')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              layoutMode === 'ORGANIC'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Free Force-Directed Cluster Layout"
          >
            ORGANIC
          </button>
          <button
            onClick={() => setLayoutMode('DIRECTED')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              layoutMode === 'DIRECTED'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Directed Flow Pipeline: Inflows (Left) → Hub → Sinks (Right)"
          >
            PIPELINE FLOW
          </button>
        </div>

        {/* Filter High Risk Button */}
        <button
          onClick={() => setRiskFilter(r => (r === 'ALL' ? 'HIGH_RISK' : 'ALL'))}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono shadow-xl backdrop-blur-md transition-all ${
            riskFilter === 'HIGH_RISK'
              ? 'bg-red-950/80 border-red-500/60 text-red-300'
              : 'bg-[#090e1a]/90 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
          title="Filter to high-risk transactions and mixer paths only"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>{riskFilter === 'HIGH_RISK' ? 'CRITICAL ONLY' : 'ALL FLOWS'}</span>
        </button>

        {/* Physics Sliders Dropdown Toggle */}
        <button
          onClick={() => setShowControls(!showControls)}
          className={`p-2 rounded-xl border text-xs font-mono shadow-xl backdrop-blur-md transition-all ${
            showControls
              ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
              : 'bg-[#090e1a]/90 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
          title="Adjust physics & flow particle streaming"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Pause / Resume Simulation */}
        <button
          onClick={togglePause}
          className="p-2 rounded-xl border border-slate-800 bg-[#090e1a]/90 text-slate-300 hover:text-white hover:border-slate-700 shadow-xl backdrop-blur-md transition-all"
          title={isPaused ? 'Resume Force Simulation' : 'Freeze Node Positions'}
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Reset / Center */}
        <button
          onClick={handleResetZoom}
          className="p-2 rounded-xl border border-slate-800 bg-[#090e1a]/90 text-slate-300 hover:text-white hover:border-slate-700 shadow-xl backdrop-blur-md transition-all"
          title="Reset Center & Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Physics Settings Dropdown Drawer */}
      {showControls && (
        <div className="absolute top-14 right-3 z-20 w-72 bg-[#090e1a]/95 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl space-y-3.5 text-xs font-mono text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white uppercase text-[11px]">Simulation Parameters</span>
            <button
              onClick={() => setShowControls(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Node Repulsion Charge:</span>
              <span className="text-cyan-400 font-bold">{chargeStrength}</span>
            </div>
            <input
              type="range"
              min="-800"
              max="-100"
              step="20"
              value={chargeStrength}
              onChange={e => setChargeStrength(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Min Transfer Amount:</span>
              <span className="text-amber-400 font-bold">{minAmount} ETH</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={minAmount}
              onChange={e => setMinAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Streaming Capital Particles</span>
            <button
              onClick={() => setShowParticles(p => !p)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                showParticles
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {showParticles ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Zoom Navigation Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-1 bg-[#090e1a]/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-xl">
        <button
          onClick={() => handleZoom(1.25)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          title="Fit & Center View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Primary SVG Canvas for D3 Rendering */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      >
        <defs>
          {/* Arrow markers */}
          <marker
            id="arrow-cyan"
            viewBox="0 0 10 10"
            refX="28"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>

          <marker
            id="arrow-red"
            viewBox="0 0 10 10"
            refX="26"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
          </marker>

          <marker
            id="arrow-purple"
            viewBox="0 0 10 10"
            refX="26"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
          </marker>

          <marker
            id="arrow-slate"
            viewBox="0 0 10 10"
            refX="24"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#475569" />
          </marker>
        </defs>

        {/* Dynamic Zoom & Pan Group Layer */}
        <g ref={gRef} id="d3-viewport-container" />
      </svg>

      {/* Interactive Node Hover Tooltip */}
      {hoveredNode && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 w-64 bg-[#080d1a]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs font-mono text-slate-200"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-white truncate">{hoveredNode.label}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                hoveredNode.type === 'mixer'
                  ? 'bg-red-950 text-red-300 border border-red-800/50'
                  : hoveredNode.type === 'bridge'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                  : hoveredNode.type === 'exchange'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {hoveredNode.type}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Address:</span>
              <span className="text-slate-300 truncate max-w-[130px]">{hoveredNode.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Risk Score:</span>
              <span
                className={`font-bold ${
                  hoveredNode.risk >= 70 ? 'text-red-400' : hoveredNode.risk >= 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {hoveredNode.risk} / 100 ({hoveredNode.riskCategory})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Network:</span>
              <span className="text-white font-medium">{hoveredNode.network}</span>
            </div>
            {hoveredNode.balance !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-400">Balance:</span>
                <span className="text-cyan-400 font-bold">{hoveredNode.balance} ETH</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Edge Hover Tooltip */}
      {hoveredLink && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 w-56 bg-[#080d1a]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs font-mono text-slate-200"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-white">Transfer Vector</span>
            <span className="text-[10px] text-cyan-400 font-bold">
              {hoveredLink.amount} {hoveredLink.asset}
            </span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-400">
            <div>
              <span className="text-slate-500">Tx Hash: </span>
              <span className="text-slate-300 truncate">{hoveredLink.txHash?.substring(0, 16)}...</span>
            </div>
            <div>
              <span className="text-slate-500">Risk Level: </span>
              <span className={hoveredLink.risk >= 70 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {hoveredLink.risk} PTS {hoveredLink.isSuspicious && '• SUSPICIOUS'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Timestamp: </span>
              <span className="text-slate-300">{new Date(hoveredLink.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Forensic Entity Detail Card (When a Node is Selected) */}
      {activeSelectedNode && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm w-full bg-[#080d18]/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl text-xs font-mono text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  activeSelectedNode.risk >= 70 ? 'bg-red-500' : 'bg-cyan-400'
                }`}
              />
              <span className="font-bold text-white text-sm">{activeSelectedNode.label}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                activeSelectedNode.type === 'mixer'
                  ? 'bg-red-950 text-red-300 border border-red-800/60'
                  : activeSelectedNode.type === 'bridge'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {activeSelectedNode.type}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] mb-3">
            <div className="flex items-center justify-between text-slate-400">
              <span>Address:</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-white truncate max-w-[170px]">{activeSelectedNode.id}</span>
                <button
                  onClick={() => copyAddress(activeSelectedNode.id)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Risk Evaluation:</span>
              <span
                className={`font-bold ${
                  activeSelectedNode.risk >= 70
                    ? 'text-red-400'
                    : activeSelectedNode.risk >= 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {activeSelectedNode.risk} / 100 ({activeSelectedNode.riskCategory})
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Observed Balance:</span>
              <span className="text-white font-bold">{activeSelectedNode.balance ?? '—'} ETH</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Forensic Investigation Pivot</span>
            <a
              href={`/investigations?wallet=${encodeURIComponent(activeSelectedNode.id)}`}
              className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-[11px] font-bold transition-colors"
            >
              <span>INSPECT DOSSIER</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
