import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { colors, fontFamily } from "../theme";

export const ChatDemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const userOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const typingOpacity = interpolate(frame, [30, 45, 60, 75], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const answerOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chipOpacity = interpolate(frame, [100, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 560, display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: 380,
              background: colors.accent,
              color: "#0a0a0f",
              fontFamily,
              fontSize: 18,
              fontWeight: 600,
              padding: "14px 18px",
              borderRadius: "18px 18px 4px 18px",
              opacity: userOpacity,
            }}
          >
            What's happening on screen right after the intro?
          </div>

          <div
            style={{
              alignSelf: "flex-start",
              fontFamily,
              fontSize: 16,
              color: colors.silverDim,
              opacity: typingOpacity,
            }}
          >
            ● ● ●
          </div>

          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: 420,
              background: colors.panel,
              border: `1px solid ${colors.panelBorder}`,
              color: colors.silver,
              fontFamily,
              fontSize: 17,
              lineHeight: 1.5,
              padding: "16px 20px",
              borderRadius: "18px 18px 18px 4px",
              opacity: answerOpacity,
            }}
          >
            A presenter walks on stage and gestures toward a title slide reading "Talk to Your Video."
            <div
              style={{
                display: "inline-block",
                marginTop: 10,
                fontSize: 13,
                color: colors.accentBright,
                border: `1px solid ${colors.accent}`,
                borderRadius: 999,
                padding: "3px 10px",
                opacity: chipOpacity,
              }}
            >
              0:42
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
