"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ProgressHeartsProps {
  total: number;
  /** Number of completed steps (1-based count of filled hearts). */
  current: number;
  className?: string;
}

/** Soft heart-based progress indicator — never a corporate progress bar. */
export function ProgressHearts({
  total,
  current,
  className,
}: ProgressHeartsProps) {
  const reduce = useReducedMotion();
  const filled = Math.max(0, Math.min(current, total));

  return (
    <div
      className={cn("flex items-center justify-center gap-1.5", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={filled}
      aria-label={`Шаг ${filled} из ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isOn = i < filled;
        return (
          <motion.span
            key={i}
            initial={false}
            animate={
              reduce ? undefined : isOn ? { scale: [1, 1.3, 1] } : { scale: 1 }
            }
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors duration-200",
                isOn ? "text-strawberry" : "text-blush/50",
              )}
              fill={isOn ? "currentColor" : "transparent"}
              strokeWidth={2}
            />
          </motion.span>
        );
      })}
    </div>
  );
}
