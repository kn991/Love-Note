/**
 * Shared HTTP client for the lovenote backend.
 *
 * - Sends the session cookie automatically (`credentials: "include"`).
 * - Injects the CSRF double-submit header on mutating requests by reading the
 *   non-httpOnly `lovenote_csrf` cookie.
 * - Normalises the backend error envelope (API_CONTRACT §1.3) into `ApiError`.
 *
 * The base URL is read from `NEXT_PUBLIC_API_BASE_URL` and already includes the
 * `/api` prefix (e.g. `http://localhost:5000/api`).
 */

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

/** True when the app is configured to talk to a real backend. */
export const API_CONFIGURED = Boolean(RAW_BASE);

export function apiBaseUrl(): string {
  if (!RAW_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set — cannot reach the backend.",
    );
  }
  return RAW_BASE;
}

const CSRF_COOKIE = "lovenote_csrf";
const MUTATING = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/** Shape of the backend error envelope. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Thrown for any non-2xx response; carries the backend `code` for UI mapping. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Field → first error message, for inline form errors (validation_error). */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [field, messages] of Object.entries(this.details)) {
      if (Array.isArray(messages) && messages.length) {
        out[field] = String(messages[0]);
      } else if (typeof messages === "string") {
        out[field] = messages;
      }
    }
    return out;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export interface RequestOptions {
  method?: string;
  /** JSON-serialisable request body. */
  body?: unknown;
  /** Extra query params. */
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${apiBaseUrl()}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Perform an API request. Returns parsed JSON, or `undefined` for 204 responses.
 * Throws `ApiError` on any non-2xx status (including network failures, which
 * surface as a synthetic `network_error`).
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  if (MUTATING.has(method)) {
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) headers["X-CSRF-Token"] = csrf;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, options.query), {
      method,
      credentials: "include",
      headers,
      body,
      signal: options.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, "network_error", "Network request failed");
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const envelope = data as ApiErrorBody | undefined;
    const error = envelope?.error;
    throw new ApiError(
      res.status,
      error?.code ?? "error",
      error?.message ?? res.statusText ?? "Request failed",
      error?.details ?? {},
    );
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
