import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { colors, fontFamily } from "../theme";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [10, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 22,
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentBright})`,
            transform: `scale(${logoScale})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${colors.accentGlow}`,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "16px solid transparent",
              borderBottom: "16px solid transparent",
              borderLeft: "26px solid white",
              marginLeft: 6,
            }}
          />
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 64,
            fontWeight: 700,
            color: colors.silver,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            letterSpacing: -1,
          }}
        >
          Talk to Your Video
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 24,
            color: colors.silverDim,
            opacity: taglineOpacity,
            marginTop: 14,
          }}
        >
          Ask questions about what's said — and what's shown.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
