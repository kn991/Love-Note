"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NO_DODGE_LINES } from "@/lib/invite/constants";

/**
 * The playful "нет" button (DESIGN_RULES §5.1). It dodges within a bounded area
 * on hover/tap, swaps to a funny line, and shrinks a little after each dodge —
 * but never disappears and never blocks the huge "да" above it. On touch (no
 * hover) the first tap is the dodge. Under reduced motion it only swaps the
 * line instead of moving, so it stays fair.
 */
export function NoButton() {
  const reduce = useReducedMotion();
  const [dodges, setDodges] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const label =
    dodges === 0
      ? "нет 😭"
      : NO_DODGE_LINES[(dodges - 1) % NO_DODGE_LINES.length];
  const scale = Math.max(0.72, 1 - dodges * 0.08);

  function dodge() {
    setDodges((d) => d + 1);
    if (reduce) return;
    setOffset({
      x: (Math.random() * 2 - 1) * 110,
      y: -8 + Math.random() * 34,
    });
  }

  return (
    <motion.button
      type="button"
      onMouseEnter={dodge}
      onClick={dodge}
      animate={{ x: offset.x, y: offset.y, scale }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="rounded-full px-5 py-2.5 text-lg font-semibold text-cherry-soft underline-offset-4 hover:text-cherry focus-visible:shadow-glow"
    >
      {label}
    </motion.button>
  );
}
