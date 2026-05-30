"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type Shape = "heart" | "petal" | "sparkle" | "dot";

interface Deco {
  shape: Shape;
  left: string;
  top: string;
  size: number;
  color: string;
  opacity: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
}

/** Deterministic layout (no Math.random) to avoid hydration mismatch. Sparse: 9 items. */
const ITEMS: Deco[] = [
  { shape: "heart", left: "6%", top: "14%", size: 26, color: "#FFB6C7", opacity: 0.55, delay: 0, duration: 15, drift: -16, rotate: -8 },
  { shape: "petal", left: "84%", top: "10%", size: 30, color: "#FFD6E0", opacity: 0.5, delay: 1.2, duration: 18, drift: 14, rotate: 10 },
  { shape: "sparkle", left: "20%", top: "72%", size: 20, color: "#FFE9B8", opacity: 0.6, delay: 0.6, duration: 13, drift: -12, rotate: 0 },
  { shape: "heart", left: "72%", top: "66%", size: 22, color: "#D9C7FF", opacity: 0.45, delay: 2.1, duration: 17, drift: -18, rotate: 6 },
  { shape: "dot", left: "46%", top: "8%", size: 12, color: "#FFB6C7", opacity: 0.4, delay: 0.3, duration: 12, drift: 10, rotate: 0 },
  { shape: "petal", left: "12%", top: "44%", size: 24, color: "#FFD6E0", opacity: 0.4, delay: 1.8, duration: 19, drift: 16, rotate: -12 },
  { shape: "sparkle", left: "90%", top: "48%", size: 18, color: "#FFE9B8", opacity: 0.5, delay: 1.0, duration: 14, drift: -10, rotate: 0 },
  { shape: "heart", left: "34%", top: "88%", size: 20, color: "#FFB6C7", opacity: 0.45, delay: 2.6, duration: 16, drift: -14, rotate: -6 },
  { shape: "dot", left: "62%", top: "30%", size: 10, color: "#D9C7FF", opacity: 0.4, delay: 0.9, duration: 11, drift: 8, rotate: 0 },
];

function Glyph({ shape, size, color }: { shape: Shape; size: number; color: string }) {
  const common = { width: size, height: size, fill: color };
  switch (shape) {
    case "heart":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M12 21s-7.5-4.6-10-9.2C.3 8.4 2 5 5.4 5c2 0 3.4 1.2 4.6 2.6C11.2 6.2 12.6 5 14.6 5 18 5 19.7 8.4 22 11.8 19.5 16.4 12 21 12 21z" />
        </svg>
      );
    case "petal":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M12 2c1.6 2.2 1.6 4.8 0 7-1.6-2.2-1.6-4.8 0-7zm0 20c-1.6-2.2-1.6-4.8 0-7 1.6 2.2 1.6 4.8 0 7zM2 12c2.2-1.6 4.8-1.6 7 0-2.2 1.6-4.8 1.6-7 0zm20 0c-2.2 1.6-4.8 1.6-7 0 2.2-1.6 4.8-1.6 7 0z" />
          <circle cx="12" cy="12" r="2.3" fill="#FFB6C7" />
        </svg>
      );
    case "sparkle":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
        </svg>
      );
    case "dot":
    default:
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export function FloatingDecorations({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {ITEMS.map((d, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: d.left, top: d.top, opacity: d.opacity }}
          initial={false}
          animate={
            reduce
              ? undefined
              : {
                  y: [0, d.drift, 0],
                  rotate: [d.rotate, d.rotate + 6, d.rotate],
                }
          }
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Glyph shape={d.shape} size={d.size} color={d.color} />
        </motion.div>
      ))}
    </div>
  );
}
