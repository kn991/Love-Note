"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FloatingDecorations } from "@/components/decorations/FloatingDecorations";
import { InviteFlow } from "@/components/invite/InviteFlow";
import {
  InviteStateScreen,
  type InviteStateKind,
} from "@/components/invite/InviteStateScreen";
import { LoadingState, ErrorState } from "@/components/ui";
import {
  getPublicInvite,
  postView,
  InviteNotFoundError,
} from "@/lib/invite/api";
import type { PublicInvite } from "@/lib/invite/types";

type Status =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "not_found" }
  | { phase: "ready"; invite: PublicInvite };

function edgeKind(invite: PublicInvite): InviteStateKind | null {
  if (invite.state === "expired") return "expired";
  if (invite.state === "inactive") return "inactive";
  if (invite.state === "answered") return "answered";
  if (invite.already_responded && !invite.allow_multiple_responses)
    return "answered";
  return null;
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>({ phase: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  const retry = () => {
    setStatus({ phase: "loading" });
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const invite = await getPublicInvite(token);
        if (active) setStatus({ phase: "ready", invite });
      } catch (err) {
        if (active)
          setStatus({
            phase: err instanceof InviteNotFoundError ? "not_found" : "error",
          });
      }
    })();
    return () => {
      active = false;
    };
  }, [token, reloadKey]);

  // Fire-and-forget view beacon once per token.
  useEffect(() => {
    void postView(token);
  }, [token]);

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-grad-petal">
      <FloatingDecorations />
      <div className="relative z-10 h-full overflow-y-auto">
        {status.phase === "loading" && (
          <div className="grid min-h-full place-items-center px-5 py-10">
            <LoadingState />
          </div>
        )}

        {status.phase === "error" && (
          <div className="grid min-h-full place-items-center px-5 py-10">
            <ErrorState onRetry={retry} />
          </div>
        )}

        {status.phase === "not_found" && <InviteStateScreen kind="not_found" />}

        {status.phase === "ready" &&
          (() => {
            const kind = edgeKind(status.invite);
            return kind ? (
              <InviteStateScreen kind={kind} />
            ) : (
              <InviteFlow token={token} invite={status.invite} />
            );
          })()}
      </div>
    </main>
  );
}
