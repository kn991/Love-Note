"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { FloatingDecorations } from "@/components/decorations/FloatingDecorations";
import { useAuth } from "@/lib/auth/context";

/** Authenticated chrome: soft header with the logo, who's signed in, logout. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-grad-petal">
      <FloatingDecorations />

      <header className="relative z-20 border-b border-border/70 bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-display text-xl text-cherry"
          >
            <span aria-hidden className="text-2xl">
              💌
            </span>
            lovenote
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-cherry-soft sm:inline">
              привет, <span className="font-semibold">{user.username}</span> 💕
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-cherry-soft transition-colors hover:text-cherry focus-visible:shadow-glow"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              выйти
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 py-8">
        {children}
      </main>
    </div>
  );
}
