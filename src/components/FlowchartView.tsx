import React, { useState, useMemo } from 'react';
import { BookFlowchart, FlowchartNode } from '../types';
import { ZoomIn, ZoomOut, Maximize2, Compass, HelpCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FlowchartViewProps {
  flowchart: BookFlowchart;
  bookTitle: string;
}

export default function FlowchartView({ flowchart, bookTitle }: FlowchartViewProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null);
  const [collapsedTypes, setCollapsedTypes] = useState<string[]>([]);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter nodes based on manual collapse toggles
  const visibleNodes = useMemo(() => {
    return flowchart.nodes.filter(node => !collapsedTypes.includes(node.type));
  }, [flowchart.nodes, collapsedTypes]);

  const visibleEdges = useMemo(() => {
    return flowchart.edges.filter(edge => {
      const fromNode = flowchart.nodes.find(n => n.id === edge.from);
      const toNode = flowchart.nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return false;
      return !collapsedTypes.includes(fromNode.type) && !collapsedTypes.includes(toNode.type);
    });
  }, [flowchart.edges, flowchart.nodes, collapsedTypes]);

  // Layout node positions in a clean, professional dual-sided hierarchical columns layout.
  // Root node is on the left, Chapters in column 2, Concepts/Actions in column 3.
  const nodePositions = useMemo(() => {
    const rootNodes = visibleNodes.filter(n => n.type === 'root');
    const chapterNodes = visibleNodes.filter(n => n.type === 'chapter');
    const leafNodes = visibleNodes.filter(n => n.type !== 'root' && n.type !== 'chapter');

    const positions: { [id: string]: { x: number; y: number } } = {};

    // Center root nodes (Column 1)
    rootNodes.forEach((node, i) => {
      positions[node.id] = {
        x: 60,
        y: 260 + (i * 120),
      };
    });

    // Arrange Chapters (Column 2)
    const chapterHeight = 550;
    chapterNodes.forEach((node, i) => {
      const cy = chapterNodes.length > 1 
        ? 60 + (i * (chapterHeight / (chapterNodes.length - 1 || 1))) 
        : 260;
      positions[node.id] = {
        x: 320,
        y: cy,
      };
    });

    // Arrange Concepts & Actions (Column 3)
    const leafHeight = 560;
    leafNodes.forEach((node, i) => {
      // Find parent chapter from edges if possible, to sort closer
      const edgeToLeaf = visibleEdges.find(e => e.to === node.id);
      const parentChapterId = edgeToLeaf?.from;
      let targetY = 60 + (i * (leafHeight / (leafNodes.length - 1 || 1)));

      // If they have parents, adjust slightly towards parent's level
      if (parentChapterId && positions[parentChapterId]) {
        targetY = (targetY + positions[parentChapterId].y) / 2;
      }

      positions[node.id] = {
        x: 640,
        y: targetY,
      };
    });

    return positions;
  }, [visibleNodes, visibleEdges]);

  // Handle Drag / Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking on an interactive node, don't initiate pan dragging
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleTypeCollapse = (type: string) => {
    if (collapsedTypes.includes(type)) {
      setCollapsedTypes(collapsedTypes.filter(t => t !== type));
    } else {
      setCollapsedTypes([...collapsedTypes, type]);
      // If selected node was of that type, deselect it
      if (selectedNode?.type === type) {
        setSelectedNode(null);
      }
    }
  };

  const resetControls = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setCollapsedTypes([]);
    setSelectedNode(null);
  };

  // Node stylings based on type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'root':
        return 'border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF]';
      case 'chapter':
        return 'border-[#AE7AFF] bg-[#F5F0FF] text-[#5B21B6]';
      case 'concept':
        return 'border-[#22C55E] bg-[#F0FDF4] text-[#166534]';
      case 'action':
        return 'border-[#F97316] bg-[#FFF7ED] text-[#9A3412]';
      default:
        return 'border-[#64748B] bg-[#F8FAFC] text-[#334155]';
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden relative shadow-sm">
      {/* Flowchart Control Strip */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
          <h4 className="text-sm font-semibold text-slate-800">Concept Map: {bookTitle}</h4>
          <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">Interactive Canvas</span>
        </div>

        {/* Legend Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <button 
            onClick={() => toggleTypeCollapse('chapter')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1 ${
              collapsedTypes.includes('chapter') 
                ? 'bg-slate-100 border-slate-200 text-slate-400 line-through' 
                : 'bg-[#F5F0FF] border-[#E9D5FF] text-[#5B21B6] hover:bg-[#EBD5FF]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#AF57DB]" /> Chapters
          </button>
          <button 
            onClick={() => toggleTypeCollapse('concept')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1 ${
              collapsedTypes.includes('concept') 
                ? 'bg-slate-100 border-slate-200 text-slate-400 line-through' 
                : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534] hover:bg-[#DCFCE7]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Concepts
          </button>
          <button 
            onClick={() => toggleTypeCollapse('action')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1 ${
              collapsedTypes.includes('action') 
                ? 'bg-slate-100 border-slate-200 text-slate-400 line-through' 
                : 'bg-[#FFF7ED] border-[#FED7AA] text-[#9A3412] hover:bg-[#FFEDD5]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" /> Actions
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setZoom(Math.max(0.4, zoom - 0.15))}
            className="p-2 text-slate-600 hover:text-brand bg-slate-100/80 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono font-medium text-slate-500 w-12 text-center select-none bg-slate-50 py-1 border border-slate-100 rounded-md">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => setZoom(Math.min(1.8, zoom + 0.15))}
            className="p-2 text-slate-600 hover:text-brand bg-slate-100/80 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={resetControls}
            className="p-2 text-slate-600 hover:text-brand bg-slate-100/80 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
            title="Reset View"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative select-none">
        {/* Helper Tip */}
        <div className="absolute top-3 left-4 bg-slate-900/80 backdrop-blur text-[11px] text-white/90 px-3 py-1.5 rounded-full pointer-events-none z-10 flex items-center gap-1.5 shadow-sm">
          <Compass size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
          <span>Click to inspect concept nodes. Drag background to pan.</span>
        </div>

        {/* Flowchart canvas area */}
        <div 
          className={`flex-1 overflow-hidden relative cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          id="flowchart-canvas"
        >
          {/* SVG Connection Lines & Nodes Group */}
          <div 
            className="absolute transition-transform duration-75 origin-top-left"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              width: "1000px",
              height: "600px",
            }}
          >
            <svg 
              className="absolute inset-0 pointer-events-none"
              width="1000"
              height="600"
            >
              <defs>
                <marker 
                  id="arrow" 
                  viewBox="0 0 10 10" 
                  refX="18" 
                  refY="5" 
                  markerWidth="6" 
                  markerHeight="6" 
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#94A3B8" />
                </marker>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Draw Edges */}
              {visibleEdges.map((edge, index) => {
                const startPos = nodePositions[edge.from];
                const endPos = nodePositions[edge.to];
                if (!startPos || !endPos) return null;

                const isEdgeHighlighted = selectedNode && (selectedNode.id === edge.from || selectedNode.id === edge.to);

                // Curve coordinate calculations (Cubic Bezier curve from left-to-right columns)
                const cp1x = startPos.x + 130;
                const cp1y = startPos.y;
                const cp2x = endPos.x - 130;
                const cp2y = endPos.y;

                return (
                  <g key={`edge-${index}`}>
                    <path 
                      id={`path-${edge.from}-${edge.to}`}
                      d={`M ${startPos.x + 110} ${startPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPos.x} ${endPos.y}`}
                      fill="none"
                      stroke={isEdgeHighlighted ? "#2563EB" : "#CBD5E1"}
                      strokeWidth={isEdgeHighlighted ? 2.5 : 1.5}
                      markerEnd="url(#arrow)"
                      className="transition-colors duration-200"
                      strokeDasharray={edge.label ? "3,3" : "none"}
                    />
                    {edge.label && (
                      <text 
                        dy="-4"
                        fill={isEdgeHighlighted ? "#1E40AF" : "#64748B"}
                        fontSize="9"
                        fontWeight={isEdgeHighlighted ? "bold" : "normal"}
                        textAnchor="middle"
                        className="font-sans antialiased"
                      >
                        <textPath href={`#path-${edge.from}-${edge.to}`} startOffset="50%">
                          {edge.label}
                        </textPath>
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Draw Nodes */}
            {visibleNodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isNodeSelected = selectedNode?.id === node.id;
              const isTypeCollapsed = collapsedTypes.length > 0;

              return (
                <div
                  key={node.id}
                  className="absolute interactive-node"
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isNodeSelected ? 30 : 20
                  }}
                >
                  <button
                    onClick={() => setSelectedNode(node)}
                    className={`px-3 py-2.5 rounded-xl border-2 text-left w-[180px] max-w-full text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer ${getNodeColor(node.type)} ${
                      isNodeSelected 
                        ? 'scale-105 shadow-md border-brand ring-2 ring-brand-light/30' 
                        : 'hover:scale-102 hover:shadow'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="uppercase text-[8px] font-mono tracking-wider opacity-60">
                        {node.type}
                      </span>
                      {isNodeSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand animate-ping" />
                      )}
                    </div>
                    <p className="line-clamp-2 leading-relaxed text-slate-800 font-bold pr-1">
                      {node.label}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Inspector Drawer (Right hand sidebar in layout) */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
              className="w-full md:w-[280px] bg-white border-t md:border-t-0 md:border-l border-slate-200/60 p-5 flex flex-col justify-between shadow-lg md:shadow-none z-10 md:relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold tracking-wider ${getNodeColor(selectedNode.type)}`}>
                    {selectedNode.type}
                  </span>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer p-1 rounded-md hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug">
                    {selectedNode.label}
                  </h3>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="font-medium text-slate-500 uppercase tracking-wider text-[8px] mb-1.5">Node Synthesis</p>
                  {selectedNode.description}
                </div>

                {/* Inspect connections linked */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Connections in system</span>
                  <div className="text-xs space-y-1">
                    {flowchart.edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((edge, i) => {
                      const fromNode = flowchart.nodes.find(n => n.id === edge.from);
                      const toNode = flowchart.nodes.find(n => n.id === edge.to);
                      const isOutgoing = edge.from === selectedNode.id;

                      return (
                        <div key={i} className="flex items-center gap-1.5 text-slate-600 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100/50">
                          {isOutgoing ? (
                            <>
                              <span className="text-xs text-[#5B21B6] font-medium font-mono">➡</span>
                              <span className="truncate flex-1 font-semibold">{toNode?.label}</span>
                              {edge.label && <span className="text-[9px] text-slate-400 font-mono italic">({edge.label})</span>}
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-[#166534] font-medium font-mono">⬅</span>
                              <span className="truncate flex-1 font-semibold">{fromNode?.label}</span>
                              {edge.label && <span className="text-[9px] text-slate-400 font-mono italic">({edge.label})</span>}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <HelpCircle size={14} className="text-slate-400" />
                <span className="text-[10px] text-slate-400 leading-normal">
                  Explore other nodes to trace sequential relationships in the map.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
