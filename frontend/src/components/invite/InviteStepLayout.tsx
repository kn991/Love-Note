"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProgressHearts } from "@/components/ui/ProgressHearts";

export interface InviteStepLayoutProps {
  title: ReactNode;
  subtitle?: ReactNode;
  avatarUrl?: string;
  /** Shown when no avatar (or it fails) — usually an emoji or a single letter. */
  avatarFallback?: ReactNode;
  progress?: { total: number; current: number };
  onBack?: () => void;
  /** Action buttons row, pinned under the content. */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * The shared frame for every step of the public invite mini-game.
 * Fills its parent's height (`min-h-full`), so the parent must set the height —
 * the real invite page wraps this in a `min-h-[100dvh]` container.
 */
export function InviteStepLayout({
  title,
  subtitle,
  avatarUrl,
  avatarFallback = "💌",
  progress,
  onBack,
  footer,
  children,
  className,
}: InviteStepLayoutProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "relative z-10 mx-auto flex min-h-full w-full max-w-step flex-col px-5 py-6",
        className,
      )}
    >
      {/* top bar: back + progress */}
      <div className="flex h-8 items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-cherry-soft transition-colors hover:text-cherry focus-visible:shadow-glow"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            назад
          </button>
        ) : (
          <span />
        )}
        {progress && (
          <ProgressHearts total={progress.total} current={progress.current} />
        )}
      </div>

      {/* centered content */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="flex flex-1 flex-col items-center justify-center gap-5 py-6 text-center"
      >
        {/* avatar */}
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-pink-soft text-3xl shadow-md ring-4 ring-card">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden>{avatarFallback}</span>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-balance font-display text-display text-cherry">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto max-w-prose text-cherry-soft">{subtitle}</p>
          )}
        </div>

        {children && <div className="w-full pt-1">{children}</div>}
      </motion.div>

      {footer && <div className="flex flex-col gap-3 pt-2">{footer}</div>}
    </div>
  );
}
