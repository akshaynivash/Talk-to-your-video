import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { colors, fontFamily } from "../theme";

const stages = ["Upload", "Transcribe", "Analyze Frames", "Build Graph"];

const cardStyle = (frame: number, start: number): React.CSSProperties => ({
  opacity: interpolate(frame, [start, start + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  transform: `translateY(${interpolate(frame, [start, start + 18], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })}px)`,
});

const nodes = [
  { x: 0, y: -60 },
  { x: -110, y: 20 },
  { x: 110, y: 20 },
  { x: -60, y: 110 },
  { x: 60, y: 110 },
  { x: 0, y: 0 },
];
const edges: [number, number][] = [
  [5, 0],
  [5, 1],
  [5, 2],
  [5, 3],
  [5, 4],
  [1, 3],
  [2, 4],
];

export const PipelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const stagesOpacity = interpolate(frame, [110, 130], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const graphOpacity = interpolate(frame, [115, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ opacity: stagesOpacity, display: "flex", gap: 26, alignItems: "center" }}>
          {stages.map((label, i) => (
            <React.Fragment key={label}>
              <div
                style={{
                  fontFamily,
                  color: colors.silver,
                  fontSize: 20,
                  fontWeight: 600,
                  padding: "22px 26px",
                  borderRadius: 16,
                  border: `1px solid ${colors.panelBorder}`,
                  background: colors.panel,
                  backdropFilter: "blur(10px)",
                  ...cardStyle(frame, i * 25),
                }}
              >
                {label}
              </div>
              {i < stages.length - 1 && (
                <div style={{ color: colors.accent, fontSize: 22, ...cardStyle(frame, i * 25 + 10) }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            opacity: graphOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg width={340} height={260} style={{ overflow: "visible" }}>
            <g transform="translate(170,120)">
              {edges.map(([a, b], i) => {
                const p1 = nodes[a];
                const p2 = nodes[b];
                const appear = interpolate(frame, [120 + i * 4, 128 + i * 4], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <line
                    key={i}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p1.x + (p2.x - p1.x) * appear}
                    y2={p1.y + (p2.y - p1.y) * appear}
                    stroke={colors.panelBorder}
                    strokeWidth={1.5}
                  />
                );
              })}
              {nodes.map((n, i) => {
                const s = interpolate(frame, [118 + i * 4, 128 + i * 4], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <circle
                    key={i}
                    cx={n.x}
                    cy={n.y}
                    r={i === 5 ? 10 : 7}
                    fill={i === 5 ? colors.accentBright : colors.accent}
                    opacity={s}
                  />
                );
              })}
            </g>
          </svg>
          <div style={{ fontFamily, color: colors.silverDim, fontSize: 18, marginTop: 8, opacity: graphOpacity }}>
            One unified knowledge graph
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
