"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ChoiceCardProps {
  emoji?: string;
  label: string;
  description?: string;
  selected?: boolean;
  /** Multi-select shows a persistent checkmark badge when chosen. */
  multi?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function ChoiceCard({
  emoji,
  label,
  description,
  selected = false,
  multi = false,
  onSelect,
  className,
}: ChoiceCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg p-4 text-center",
        "border-[1.5px] transition-colors duration-200 focus-visible:shadow-glow",
        selected
          ? "border-blush bg-pink-soft shadow-glow"
          : "border-border bg-card shadow-sm hover:border-border-strong",
        className,
      )}
    >
      {selected && (
        <motion.span
          initial={reduce ? false : { scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 16 }}
          className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-strawberry text-card shadow-sm"
          aria-hidden
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
      )}

      {emoji && (
        <motion.span
          className="text-3xl leading-none"
          animate={
            reduce
              ? undefined
              : selected
                ? { scale: [1, 1.25, 1] }
                : { scale: 1 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-hidden
        >
          {emoji}
        </motion.span>
      )}

      <span className="font-semibold text-cherry">{label}</span>
      {description && (
        <span className="text-tiny font-normal text-cherry-soft">
          {description}
        </span>
      )}
    </motion.button>
  );
}
