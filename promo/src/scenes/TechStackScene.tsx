import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { colors, fontFamily } from "../theme";

const stack = ["FastAPI", "LangGraph", "Neo4j", "Ollama", "React", "Celery"];

export const TechStackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div
          style={{
            fontFamily,
            fontSize: 30,
            fontWeight: 700,
            color: colors.silver,
            opacity: titleOpacity,
            marginBottom: 34,
            textAlign: "center",
          }}
        >
          Fully local. <span style={{ color: colors.accentBright }}>No API keys. No cloud costs.</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 620 }}>
          {stack.map((label, i) => {
            const o = interpolate(frame, [20 + i * 10, 36 + i * 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(frame, [20 + i * 10, 36 + i * 10], [14, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={label}
                style={{
                  fontFamily,
                  fontSize: 18,
                  fontWeight: 600,
                  color: colors.silver,
                  padding: "12px 22px",
                  borderRadius: 12,
                  border: `1px solid ${colors.panelBorder}`,
                  background: colors.panel,
                  opacity: o,
                  transform: `translateY(${y}px)`,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
