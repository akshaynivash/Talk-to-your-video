import { motion } from "framer-motion";

const ORBS = [
  {
    className: "left-[-10%] top-[-10%] h-[36rem] w-[36rem] bg-accent-dim/25",
    animate: { x: [0, 60, -30, 0], y: [0, 50, 90, 0] },
    duration: 26,
  },
  {
    className: "right-[-15%] top-[5%] h-[42rem] w-[42rem] bg-accent/15",
    animate: { x: [0, -70, 30, 0], y: [0, 60, -40, 0] },
    duration: 32,
  },
  {
    className: "left-[20%] top-[45%] h-[30rem] w-[30rem] bg-silver-400/8",
    animate: { x: [0, 40, -50, 0], y: [0, -30, 30, 0] },
    duration: 24,
  },
  {
    className: "right-[10%] bottom-[-10%] h-[34rem] w-[34rem] bg-accent-dim/12",
    animate: { x: [0, -40, 20, 0], y: [0, -50, 20, 0] },
    duration: 30,
  },
];

export function FloatingOrbs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[100px] ${orb.className}`}
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
