import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { colors, fontFamily } from "../theme";

const fadeUp = (frame: number, start: number): React.CSSProperties => ({
  opacity: interpolate(frame, [start, start + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  transform: `translateY(${interpolate(frame, [start, start + 20], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })}px)`,
});

const badges = ["TRANSCRIPT", "VISION", "KNOWLEDGE GRAPH"];

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "0 120px" }}
      >
        <div style={{ fontFamily, fontSize: 34, color: colors.silverDim, textAlign: "center", ...fadeUp(frame, 0) }}>
          Most video Q&amp;A tools only understand the words.
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 44,
            fontWeight: 700,
            color: colors.silver,
            textAlign: "center",
            marginTop: 26,
            ...fadeUp(frame, 40),
          }}
        >
          This one understands <span style={{ color: colors.accentBright }}>what's on screen</span>, too.
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 46, ...fadeUp(frame, 75) }}>
          {badges.map((label) => (
            <div
              key={label}
              style={{
                fontFamily,
                fontSize: 15,
                letterSpacing: 2,
                color: colors.silverDim,
                padding: "10px 20px",
                borderRadius: 999,
                border: `1px solid ${colors.panelBorder}`,
                background: colors.panel,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
