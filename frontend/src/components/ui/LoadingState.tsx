"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Секунду, готовим что-то милое… 🌸",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-pink-soft shadow-sm">
        <Heart
          className="h-7 w-7 animate-spin-heart text-strawberry"
          fill="currentColor"
          aria-hidden
        />
      </span>
      <p className="max-w-prose text-cherry-soft">{message}</p>
    </div>
  );
}
