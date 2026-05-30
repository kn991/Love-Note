"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FloatingDecorations } from "@/components/decorations/FloatingDecorations";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LoadingState } from "@/components/ui";
import { authApi } from "@/lib/api/auth";
import { AuthProvider } from "@/lib/auth/context";
import type { UserPublic } from "@/lib/api/types";

type Guard =
  | { phase: "checking" }
  | { phase: "authed"; user: UserPublic };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [guard, setGuard] = useState<Guard>({ phase: "checking" });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    (async () => {
      try {
        const user = await authApi.me(controller.signal);
        if (active) setGuard({ phase: "authed", user });
      } catch {
        if (controller.signal.aborted) return;
        // Any failure to confirm a session sends the visitor to login.
        router.replace("/login");
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [router]);

  if (guard.phase === "checking") {
    return (
      <main className="relative min-h-[100dvh] overflow-hidden bg-grad-petal">
        <FloatingDecorations />
        <div className="relative z-10 grid min-h-[100dvh] place-items-center px-5">
          <LoadingState message="Секунду, проверяем, что это ты 💕" />
        </div>
      </main>
    );
  }

  return (
    <AuthProvider initialUser={guard.user}>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
