"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable (insecure context) — ignore silently
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:shadow-glow",
        copied
          ? "border-success bg-mint text-success"
          : "border-border bg-card text-cherry-soft hover:text-cherry",
      )}
      aria-live="polite"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden />
          скопировано
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden />
          копировать
        </>
      )}
    </button>
  );
}
