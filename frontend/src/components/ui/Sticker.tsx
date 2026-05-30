"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Tone = "pink" | "lavender" | "butter" | "mint" | "cream";

const tones: Record<Tone, string> = {
  pink: "bg-pink-soft",
  lavender: "bg-lavender",
  butter: "bg-butter",
  mint: "bg-mint",
  cream: "bg-cream-deep",
};

export interface StickerProps {
  children: ReactNode;
  tone?: Tone;
  /** Tilt in degrees, e.g. -6. */
  rotate?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-9 w-9 text-lg",
  md: "h-12 w-12 text-2xl",
  lg: "h-16 w-16 text-3xl",
};

/** A cute peel-off sticker: tilted, soft-shadowed, wiggles on hover. */
export function Sticker({
  children,
  tone = "pink",
  rotate = -6,
  size = "md",
  className,
}: StickerProps) {
  return (
    <motion.span
      style={{ rotate }}
      whileHover={{ rotate: rotate + 8, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 320, damping: 14 }}
      className={cn(
        "inline-grid place-items-center rounded-full shadow-sm ring-2 ring-card/70 leading-none",
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </motion.span>
  );
}
