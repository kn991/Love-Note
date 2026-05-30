"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye, Heart } from "lucide-react";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { ResponseCard } from "@/components/dashboard/ResponseCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  CuteButton,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { invitationsApi } from "@/lib/api/invitations";
import { errorMessage } from "@/lib/api/messages";
import { forRecipient } from "@/lib/ru/name";
import type { InvitationDetail, ResponsePublic } from "@/lib/api/types";

type InvState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; invite: InvitationDetail };

type RespState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; items: ResponsePublic[] };

export default function InvitationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [inv, setInv] = useState<InvState>(() =>
    Number.isFinite(id)
      ? { phase: "loading" }
      : { phase: "error", message: "Не нашли это приглашение 🥺" },
  );
  const [resp, setResp] = useState<RespState>({ phase: "loading" });
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadInvite = useCallback(
    (signal?: AbortSignal) => {
      if (!Number.isFinite(id)) return;
      invitationsApi
        .get(id, signal)
        .then((invite) => setInv({ phase: "ready", invite }))
        .catch((err) => {
          if (signal?.aborted) return;
          setInv({ phase: "error", message: errorMessage(err) });
        });
    },
    [id],
  );

  const loadResponses = useCallback(
    (signal?: AbortSignal) => {
      if (!Number.isFinite(id)) return;
      invitationsApi
        .responses(id, { per_page: 50 }, signal)
        .then((res) => setResp({ phase: "ready", items: res.items }))
        .catch((err) => {
          if (signal?.aborted) return;
          setResp({ phase: "error", message: errorMessage(err) });
        });
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadInvite(controller.signal);
    loadResponses(controller.signal);
    return () => controller.abort();
  }, [loadInvite, loadResponses]);

  const retryInvite = useCallback(() => {
    setInv({ phase: "loading" });
    loadInvite();
  }, [loadInvite]);

  const retryResponses = useCallback(() => {
    setResp({ phase: "loading" });
    loadResponses();
  }, [loadResponses]);

  async function runAction(
    name: string,
    fn: () => Promise<InvitationDetail>,
  ) {
    setBusy(name);
    try {
      const updated = await fn();
      setInv({ phase: "ready", invite: updated });
    } catch (err) {
      setInv({ phase: "error", message: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    setBusy("delete");
    try {
      await invitationsApi.remove(id);
      router.replace("/dashboard");
    } catch (err) {
      setInv({ phase: "error", message: errorMessage(err) });
      setBusy(null);
    }
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-cherry-soft transition-colors hover:text-cherry"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        к приглашениям
      </Link>

      {inv.phase === "loading" && <LoadingState />}

      {inv.phase === "error" && (
        <ErrorState description={inv.message} onRetry={retryInvite} />
      )}

      {inv.phase === "ready" && (
        <>
          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-display text-display text-cherry">
                  {forRecipient(inv.invite.girl_name)}
                </h1>
                {inv.invite.title && (
                  <p className="mt-1 text-cherry-soft">{inv.invite.title}</p>
                )}
              </div>
              <StatusBadge status={inv.invite.status} className="shrink-0" />
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-cherry-faint">
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-4 w-4" aria-hidden />
                {inv.invite.response_count} ответов
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" aria-hidden />
                {inv.invite.view_count} просмотров
              </span>
            </div>

            {/* public link */}
            <div className="mt-5 rounded-md border border-border bg-cream-deep/50 p-3">
              <p className="mb-1.5 text-tiny font-semibold text-cherry-faint">
                ССЫЛКА-ПРИГЛАШЕНИЕ
              </p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate text-sm text-cherry">
                  {inv.invite.public_url}
                </code>
                <CopyLinkButton url={inv.invite.public_url} />
                <a
                  href={inv.invite.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-cherry-soft transition-colors hover:text-cherry focus-visible:shadow-glow"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  открыть
                </a>
              </div>
            </div>

            {/* actions */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              {inv.invite.status === "archived" ? (
                <CuteButton
                  variant="secondary"
                  loading={busy === "unarchive"}
                  disabled={!!busy}
                  onClick={() =>
                    runAction("unarchive", () => invitationsApi.activate(id))
                  }
                >
                  Вернуть из архива 📤
                </CuteButton>
              ) : (
                <>
                  {inv.invite.is_active ? (
                    <CuteButton
                      variant="ghost"
                      loading={busy === "deactivate"}
                      disabled={!!busy}
                      onClick={() =>
                        runAction("deactivate", () =>
                          invitationsApi.deactivate(id),
                        )
                      }
                    >
                      Выключить
                    </CuteButton>
                  ) : (
                    <CuteButton
                      variant="secondary"
                      loading={busy === "activate"}
                      disabled={!!busy}
                      onClick={() =>
                        runAction("activate", () => invitationsApi.activate(id))
                      }
                    >
                      Включить 🌷
                    </CuteButton>
                  )}

                  <CuteButton
                    variant="ghost"
                    loading={busy === "archive"}
                    disabled={!!busy}
                    onClick={() =>
                      runAction("archive", () => invitationsApi.archive(id))
                    }
                  >
                    В архив
                  </CuteButton>
                </>
              )}

              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <CuteButton
                    variant="danger"
                    loading={busy === "delete"}
                    disabled={!!busy}
                    onClick={onDelete}
                  >
                    Точно удалить?
                  </CuteButton>
                  <CuteButton
                    variant="ghost"
                    disabled={!!busy}
                    onClick={() => setConfirmDelete(false)}
                  >
                    Отмена
                  </CuteButton>
                </div>
              ) : (
                <CuteButton
                  variant="danger"
                  disabled={!!busy}
                  onClick={() => setConfirmDelete(true)}
                >
                  Удалить
                </CuteButton>
              )}
            </div>
          </div>

          {/* responses */}
          <section className="mt-8">
            <h2 className="mb-4 font-display text-xl text-cherry">
              Ответы 💕
            </h2>

            {resp.phase === "loading" && <LoadingState />}

            {resp.phase === "error" && (
              <ErrorState description={resp.message} onRetry={retryResponses} />
            )}

            {resp.phase === "ready" && resp.items.length === 0 && (
              <EmptyState
                emoji="💌"
                title="Ответов пока нет"
                description="как только она ответит — всё появится здесь 🌸"
              />
            )}

            {resp.phase === "ready" && resp.items.length > 0 && (
              <ul className="flex flex-col gap-4">
                {resp.items.map((r, i) => (
                  <ResponseCard key={r.id} response={r} index={i} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
