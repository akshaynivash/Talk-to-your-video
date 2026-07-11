import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../theme";

const Orb: React.FC<{
  size: number;
  top: string;
  left: string;
  color: string;
  driftX?: number;
  driftY?: number;
  delay?: number;
}> = ({ size, top, left, color, driftX = 30, driftY = 20, delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = (frame + delay) / 90;
  const x = Math.sin(t) * driftX;
  const y = Math.cos(t * 0.8) * driftY;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(80px)",
        opacity: 0.55,
        transform: `translate(${x}px, ${y}px)`,
      }}
    />
  );
};

export const Background: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Orb size={520} top="-120px" left="-80px" color="rgba(91,156,246,0.45)" />
      <Orb
        size={420}
        top="58%"
        left="68%"
        color="rgba(190,190,205,0.18)"
        delay={40}
        driftX={-25}
        driftY={30}
      />
      <Orb
        size={360}
        top="8%"
        left="58%"
        color="rgba(91,156,246,0.22)"
        delay={70}
        driftX={20}
        driftY={-25}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};
