"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  BaseEdge,
  EdgeProps,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

interface TimelineViewProps {
  currentSymptom: string;
}

// Timeline event node component
function TimelineEventNode({ data }: { data: any }) {
  const isToday = data.isToday;
  const daysAgo = data.daysAgo;
  const nodeType = data.nodeType;

  const EVENT_COLORS: Record<string, {bg: string, border: string, text: string}> = {
    symptom: {
      bg: "bg-chain-symptom/10",
      border: "border-chain-symptom",
      text: "text-chain-symptom",
    },
    trigger: {
      bg: "bg-chain-mechanism/10",
      border: "border-chain-mechanism",
      text: "text-chain-mechanism",
    },
    crisis: {
      bg: "bg-chain-active/10",
      border: "border-chain-active",
      text: "text-chain-active",
    },
  };

  const colors = EVENT_COLORS[nodeType] || EVENT_COLORS.trigger;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", visualDuration: 0.4, bounce: 0.2 }}
      role="article"
      aria-label={`${isToday ? "Today" : `${daysAgo} days ago`}: ${data.event}`}
      className={`relative rounded-xl border-2 ${colors.border} ${colors.bg} bg-bg-elevated p-4 shadow-lg transition-all ${
        isToday
          ? "shadow-[0_0_20px_rgba(240,200,122,0.4)]"
          : ""
      }`}
      style={{ width: "240px", minHeight: "160px" }}
    >
      {/* Date badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wide ${isToday ? "text-chain-active" : colors.text}`}>
          {isToday ? "TODAY" : `${daysAgo}d ago`}
        </span>
        <span className="text-xl">{data.icon}</span>
      </div>

      {/* Event title */}
      <h3 className="text-sm font-semibold leading-[1.3] text-text-primary">
        {data.event}
      </h3>

      {/* Description */}
      <p className="mt-2 text-xs leading-[1.4] text-text-secondary">
        {data.description}
      </p>

      {/* Trigger badge */}
      {data.trigger && (
        <div className={`mt-3 rounded-full px-2 py-1 text-[10px] font-medium ${colors.bg} ${colors.text}`}>
          {data.trigger}
        </div>
      )}

      {/* Today glow */}
      {isToday && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
          className="pointer-events-none absolute inset-0 -m-2 rounded-xl bg-chain-active/20 blur-xl"
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}

// Custom animated edge with particle
function AnimatedTimelineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Base edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: "var(--color-chain-connection)",
          strokeWidth: 2.5,
        }}
      />

      {/* Animated particle */}
      <circle r="5" fill="var(--color-chain-active)">
        <animateMotion dur="4s" repeatCount="indefinite" path={edgePath} />
      </circle>

      {/* Edge label */}
      {data?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 12}
          fill="var(--color-text-tertiary)"
          fontSize="11px"
          fontWeight="500"
          textAnchor="middle"
          className="pointer-events-none select-none"
        >
          {data.label}
        </text>
      )}
    </>
  );
}

const nodeTypes = {
  timelineEvent: TimelineEventNode,
};

const edgeTypes = {
  animatedTimeline: AnimatedTimelineEdge,
};

// Dagre layout for timeline (left to right)
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", ranksep: 200, nodesep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 240, height: 180 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 120,
        y: nodeWithPosition.y - 90,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function TimelineFlowInner({ currentSymptom }: TimelineViewProps) {
  const { fitView } = useReactFlow();

  // Mock timeline data - events over the past few weeks
  const timelineEvents = [
    {
      id: "event-1",
      daysAgo: 21,
      icon: "🌡️",
      event: "Cold weather front arrived",
      description: "Temperature dropped from 72°F to 45°F overnight",
      trigger: "Temperature",
      nodeType: "trigger",
    },
    {
      id: "event-2",
      daysAgo: 18,
      icon: "💧",
      event: "Reduced water intake",
      description: "Busy work week, hydration decreased to ~4 glasses/day",
      trigger: "Hydration",
      nodeType: "trigger",
    },
    {
      id: "event-3",
      daysAgo: 14,
      icon: "😴",
      event: "Poor sleep quality",
      description: "Average 5 hours/night due to project deadline",
      trigger: "Sleep",
      nodeType: "trigger",
    },
    {
      id: "event-4",
      daysAgo: 7,
      icon: "🫁",
      event: "Sinus congestion started",
      description: "Upper respiratory symptoms, nasal blockage",
      trigger: "Breathing",
      nodeType: "symptom",
    },
    {
      id: "event-5",
      daysAgo: 0,
      icon: "⚠️",
      event: currentSymptom,
      description: "Current crisis symptoms manifesting",
      trigger: "Crisis",
      nodeType: "crisis",
      isToday: true,
    },
  ];

  const initialNodes: Node[] = timelineEvents.map((event) => ({
    id: event.id,
    type: "timelineEvent",
    position: { x: 0, y: 0 }, // Will be overridden by dagre
    data: event,
  }));

  const initialEdges: Edge[] = timelineEvents.slice(0, -1).map((event, index) => {
    const nextEvent = timelineEvents[index + 1];
    const daysDiff = event.daysAgo - nextEvent.daysAgo;

    return {
      id: `edge-${event.id}-${nextEvent.id}`,
      source: event.id,
      target: nextEvent.id,
      type: "animatedTimeline",
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 24,
        height: 24,
        color: "var(--color-chain-connection)",
      },
      style: {
        stroke: "var(--color-chain-connection)",
        strokeWidth: 2.5,
      },
      data: {
        label: `${daysDiff}d later`,
      },
    };
  });

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  const [nodes, _setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, _setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Auto-fit on mount with larger padding so everything is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.3, duration: 800 });
    }, 200);
    return () => clearTimeout(timer);
  }, [fitView]);

  return (
    <div className="relative h-[700px] w-full rounded-xl border border-chain-connection/20 bg-bg-elevated overflow-hidden">
      {/* Header overlay */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-6 top-6 z-10 rounded-lg bg-bg-surface/95 px-4 py-3 backdrop-blur-sm border border-chain-connection/20 shadow-lg"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-chain-active">
          Temporal Analysis
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Events leading to current symptom
        </p>
      </motion.div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.4}
        maxZoom={1.2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="var(--color-chain-connection)"
          style={{ opacity: 0.2 }}
        />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-6 right-6 z-10 flex gap-4 rounded-lg bg-bg-surface/95 px-4 py-3 backdrop-blur-sm border border-chain-connection/20 shadow-lg"
        role="region"
        aria-label="Chart legend"
      >
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 rounded bg-chain-connection" aria-hidden="true" />
          <span className="text-xs text-text-tertiary">Causal link</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chain-active animate-pulse" aria-hidden="true" />
          <span className="text-xs text-text-tertiary">Flow</span>
        </div>
      </motion.div>

      {/* Pattern insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-20 right-6 z-10 max-w-xs rounded-lg bg-chain-root/10 px-4 py-3 backdrop-blur-sm border border-chain-root/30"
        role="region"
        aria-label="Pattern insight"
      >
        <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-chain-root mb-1">
          Pattern Detected
        </h3>
        <p className="text-xs leading-relaxed text-text-secondary">
          Crisis correlates with breathing issues from 1 week ago, tracing back to dehydration during cold front.
        </p>
      </motion.div>
    </div>
  );
}

export function TimelineView({ currentSymptom }: TimelineViewProps) {
  return (
    <ReactFlowProvider>
      <TimelineFlowInner currentSymptom={currentSymptom} />
    </ReactFlowProvider>
  );
}
