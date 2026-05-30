"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChoiceCard } from "@/components/ui";
import type { InviteOption } from "@/lib/invite/types";
import { cn } from "@/lib/cn";

export interface ChoiceGridProps {
  options: InviteOption[];
  isSelected: (label: string) => boolean;
  onSelect: (label: string) => void;
  multi?: boolean;
  columns?: 2 | 3;
  className?: string;
}

/** A grid of ChoiceCards with a soft staggered entrance (DESIGN_RULES §3.4). */
export function ChoiceGrid({
  options,
  isSelected,
  onSelect,
  multi = false,
  columns = 2,
  className,
}: ChoiceGridProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2",
        className,
      )}
    >
      {options.map((option, i) => (
        <motion.div
          key={option.label}
          className="h-full"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reduce ? 0 : i * 0.05,
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ChoiceCard
            emoji={option.emoji}
            label={option.label}
            multi={multi}
            selected={isSelected(option.label)}
            onSelect={() => onSelect(option.label)}
          />
        </motion.div>
      ))}
    </div>
  );
}
