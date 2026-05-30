import type { PublicInvite, RespondResult, ResponseCreate } from "./types";
import { resolveMockInvite } from "./mock";
import { API_CONFIGURED, ApiError, request } from "@/lib/api/client";

/**
 * Data layer for the public invite game.
 *
 * When `NEXT_PUBLIC_API_BASE_URL` is set, every call hits the real public
 * endpoints (API_CONTRACT §5) through the shared client. When it is unset the
 * layer falls back to mocked data so the flow can still be developed/reviewed
 * without a running backend — no component changes either way.
 */

/** Thrown for an unknown token so the UI can show the "no such invite" screen. */
export class InviteNotFoundError extends Error {
  constructor() {
    super("invite_not_found");
    this.name = "InviteNotFoundError";
  }
}

const MOCK_LATENCY_MS = 650;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getPublicInvite(token: string): Promise<PublicInvite> {
  if (!API_CONFIGURED) {
    await delay(MOCK_LATENCY_MS);
    const invite = resolveMockInvite(token);
    if (!invite) throw new InviteNotFoundError();
    return invite;
  }

  try {
    return await request<PublicInvite>(
      `/public/invite/${encodeURIComponent(token)}`,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw new InviteNotFoundError();
    }
    throw err;
  }
}

/** Fire-and-forget view beacon. Never throws to the caller. */
export async function postView(token: string): Promise<void> {
  if (!API_CONFIGURED) return;
  try {
    await request<void>(`/public/invite/${encodeURIComponent(token)}/view`, {
      method: "POST",
    });
  } catch {
    // best-effort only
  }
}

export async function postResponse(
  token: string,
  body: ResponseCreate,
): Promise<RespondResult> {
  if (!API_CONFIGURED) {
    await delay(MOCK_LATENCY_MS);
    const invite = resolveMockInvite(token);
    if (!invite) throw new InviteNotFoundError();
    return { ok: true, final_message: invite.final_message };
  }

  try {
    return await request<RespondResult>(
      `/public/invite/${encodeURIComponent(token)}/respond`,
      { method: "POST", body },
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw new InviteNotFoundError();
    }
    throw err;
  }
}
