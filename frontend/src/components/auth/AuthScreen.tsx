"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingDecorations } from "@/components/decorations/FloatingDecorations";
import { Sticker } from "@/components/ui/Sticker";

export interface AuthScreenProps {
  emoji: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Footer row, e.g. a link to the other auth page. */
  footer?: ReactNode;
}

/** Soft, animated frame shared by the login & register pages. */
export function AuthScreen({
  emoji,
  title,
  subtitle,
  children,
  footer,
}: AuthScreenProps) {
  const reduce = useReducedMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-grad-petal">
      <FloatingDecorations />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-step flex-col justify-center px-5 py-10">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Link href="/" aria-label="lovenote">
            <Sticker tone="pink" size="lg" rotate={-8}>
              <span aria-hidden>{emoji}</span>
            </Sticker>
          </Link>
          <h1 className="text-balance font-display text-display text-cherry">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto max-w-prose text-cherry-soft">{subtitle}</p>
          )}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="rounded-2xl border border-border bg-card/80 p-6 shadow-md backdrop-blur-sm"
        >
          {children}
        </motion.div>

        {footer && (
          <p className="mt-6 text-center text-sm text-cherry-soft">{footer}</p>
        )}
      </div>
    </main>
  );
}
