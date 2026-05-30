"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { InvitationCard } from "@/components/dashboard/InvitationCard";
import {
  CuteButton,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { invitationsApi } from "@/lib/api/invitations";
import { errorMessage } from "@/lib/api/messages";
import type { InvitationListItem } from "@/lib/api/types";

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; items: InvitationListItem[] };

export default function DashboardHome() {
  const [state, setState] = useState<State>({ phase: "loading" });

  const load = useCallback((signal?: AbortSignal) => {
    invitationsApi
      .list({ include_archived: true }, signal)
      .then((res) => setState({ phase: "ready", items: res.items }))
      .catch((err) => {
        if (signal?.aborted) return;
        setState({ phase: "error", message: errorMessage(err) });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const retry = useCallback(() => {
    setState({ phase: "loading" });
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-display text-cherry">
            Мои приглашения
          </h1>
          <p className="mt-1 text-cherry-soft">
            собери милое свидание и поделись ссылкой 💌
          </p>
        </div>
        <Link href="/dashboard/new" className="shrink-0">
          <CuteButton leftIcon={<Plus className="h-4 w-4" aria-hidden />}>
            Создать
          </CuteButton>
        </Link>
      </div>

      {state.phase === "loading" && <LoadingState />}

      {state.phase === "error" && (
        <ErrorState description={state.message} onRetry={retry} />
      )}

      {state.phase === "ready" && state.items.length === 0 && (
        <EmptyState
          emoji="🌸"
          title="Пока пусто"
          description="Создай первое приглашение — это займёт минутку 💕"
          action={
            <Link href="/dashboard/new">
              <CuteButton leftIcon={<Plus className="h-4 w-4" aria-hidden />}>
                Создать приглашение
              </CuteButton>
            </Link>
          }
        />
      )}

      {state.phase === "ready" && state.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {state.items.map((invite, i) => (
            <InvitationCard key={invite.id} invite={invite} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
