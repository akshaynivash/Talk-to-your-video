import { motion } from "framer-motion";

interface Panel {
  className: string;
  rotate: [number, number];
  float: [number, number, number];
  duration: number;
  delay?: number;
}

const PANELS: Panel[] = [
  {
    className: "left-[3%] top-[10%] h-40 w-40 rounded-[2rem]",
    rotate: [-8, -14],
    float: [0, -20, 0],
    duration: 14,
  },
  {
    className: "right-[4%] top-[14%] h-56 w-56 rounded-[2.5rem]",
    rotate: [10, 16],
    float: [0, 24, 0],
    duration: 18,
    delay: 0.6,
  },
  {
    className: "left-[8%] top-[62%] h-32 w-32 rounded-3xl",
    rotate: [6, -4],
    float: [0, 16, 0],
    duration: 12,
    delay: 1.1,
  },
  {
    className: "right-[6%] top-[66%] h-44 w-44 rounded-[2.25rem]",
    rotate: [-12, -20],
    float: [0, -18, 0],
    duration: 16,
    delay: 0.3,
  },
  {
    className: "left-[2%] top-[38%] h-24 w-24 rounded-2xl",
    rotate: [4, 12],
    float: [0, 14, 0],
    duration: 10,
    delay: 0.9,
  },
];

export function FloatingShapes() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {PANELS.map((panel, i) => (
        <motion.div
          key={i}
          className={`absolute border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.01]
                      shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${panel.className}`}
          animate={{ rotate: panel.rotate, y: panel.float }}
          transition={{
            duration: panel.duration,
            delay: panel.delay,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
