"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Sticker } from "./Sticker";

export interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  emoji = "🌸",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card/60 px-6 py-12 text-center",
        className,
      )}
    >
      <Sticker tone="pink" size="lg" rotate={-8}>
        <span aria-hidden>{emoji}</span>
      </Sticker>
      <h3 className="mt-1 font-display text-lg text-cherry">{title}</h3>
      {description && (
        <p className="max-w-prose text-cherry-soft">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
