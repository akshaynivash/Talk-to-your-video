import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { getVideoGraph } from "../api/client";
import type { GraphData, GraphNodeType } from "../types";

const NODE_COLORS: Record<GraphNodeType, string> = {
  Video: "#93c5fd",
  Segment: "#e4e4e7",
  Entity: "#60a5fa",
  Topic: "#3b82f6",
};

const NODE_SIZES: Record<GraphNodeType, number> = {
  Video: 9,
  Segment: 6,
  Entity: 4,
  Topic: 4,
};

interface ForceNode {
  id: string;
  label: string;
  type: GraphNodeType;
  x?: number;
  y?: number;
}

interface KnowledgeGraphProps {
  videoId: string;
}

export function KnowledgeGraph({ videoId }: KnowledgeGraphProps) {
  const [data, setData] = useState<GraphData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  useEffect(() => {
    getVideoGraph(videoId).then(setData).catch(console.error);
  }, [videoId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDimensions({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-silver-500">
        <Loader2 size={16} className="animate-spin" />
        Loading graph&hellip;
      </div>
    );
  }

  if (data.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-silver-500">
        No graph data for this video yet.
      </div>
    );
  }

  const graphData = {
    nodes: data.nodes.map((n) => ({ ...n })),
    links: data.edges.map((e) => ({ ...e })),
  };

  return (
    <div ref={containerRef} className="h-full w-full">
      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        nodeLabel="label"
        nodeColor={(node) => NODE_COLORS[(node as ForceNode).type] ?? "#87878f"}
        nodeVal={(node) => NODE_SIZES[(node as ForceNode).type] ?? 4}
        linkColor={() => "rgba(147,197,253,0.25)"}
        linkWidth={1}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => "rgba(147,197,253,0.5)"}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as ForceNode;
          if (n.x === undefined || n.y === undefined) return;
          const fontSize = 10 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "rgba(228,228,231,0.85)";
          ctx.fillText(n.label, n.x, n.y + 7);
        }}
      />
    </div>
  );
}
