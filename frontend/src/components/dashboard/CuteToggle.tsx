"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface CuteToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}

/** A soft pill switch used for the invitation create/edit toggles. */
export function CuteToggle({
  checked,
  onChange,
  label,
  description,
}: CuteToggleProps) {
  const reduce = useReducedMotion();
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-cherry">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-cherry-faint">
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors focus-visible:shadow-glow",
          checked ? "bg-grad-button" : "bg-border-strong/60",
        )}
      >
        <motion.span
          layout={!reduce}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn(
            "grid h-6 w-6 place-items-center rounded-full bg-card shadow-sm",
            checked ? "ml-auto" : "ml-0",
          )}
        >
          <span aria-hidden className="text-[11px]">
            {checked ? "💗" : ""}
          </span>
        </motion.span>
      </button>
    </label>
  );
}
