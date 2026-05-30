"use client";

import { cn } from "@/lib/cn";
import { Sticker } from "./Sticker";
import { CuteButton } from "./CuteButton";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Ой, что-то пошло не так 🥺",
  description = "Попробуем ещё раз?",
  onRetry,
  retryLabel = "Повторить",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card/60 px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <Sticker tone="cream" size="lg" rotate={6}>
        <span aria-hidden>🥺</span>
      </Sticker>
      <h3 className="mt-1 font-display text-lg text-cherry">{title}</h3>
      {description && (
        <p className="max-w-prose text-cherry-soft">{description}</p>
      )}
      {onRetry && (
        <CuteButton variant="secondary" onClick={onRetry} className="mt-2">
          {retryLabel}
        </CuteButton>
      )}
    </div>
  );
}
