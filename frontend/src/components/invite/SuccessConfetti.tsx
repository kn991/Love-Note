"use client";

import { motion, useReducedMotion } from "framer-motion";

const PIECES = [
  { emoji: "💕", x: "12%", delay: 0, dur: 5.5, drift: -16 },
  { emoji: "🌸", x: "28%", delay: 0.8, dur: 6.4, drift: 14 },
  { emoji: "✨", x: "46%", delay: 0.3, dur: 5.0, drift: -10 },
  { emoji: "💗", x: "64%", delay: 1.2, dur: 6.8, drift: 18 },
  { emoji: "🌷", x: "80%", delay: 0.5, dur: 5.8, drift: -14 },
  { emoji: "💖", x: "90%", delay: 1.6, dur: 6.0, drift: 12 },
];

/** A subtle rain of petals/hearts for the success screen. Multi-keyframe → tween. */
export function SuccessConfetti() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {PIECES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-[-10%] text-2xl"
          style={{ left: p.x }}
          initial={{ y: "-10%", opacity: 0, rotate: 0 }}
          animate={{
            y: ["-10%", "110%"],
            x: [0, p.drift, 0],
            opacity: [0, 0.9, 0.9, 0],
            rotate: [0, p.drift > 0 ? 25 : -25, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}
