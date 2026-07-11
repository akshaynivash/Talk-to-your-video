import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { colors, fontFamily } from "../theme";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const holdOpacity = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          opacity: holdOpacity,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentBright})`,
            marginBottom: 22,
            opacity,
          }}
        />
        <div style={{ fontFamily, fontSize: 40, fontWeight: 700, color: colors.silver, opacity }}>
          Talk to Your Video
        </div>
        <div style={{ fontFamily, fontSize: 18, color: colors.silverDim, marginTop: 10, opacity }}>
          Portfolio project — built end to end
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
