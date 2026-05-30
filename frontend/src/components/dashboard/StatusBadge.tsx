import { cn } from "@/lib/cn";
import type { InvitationStatus } from "@/lib/api/types";

const COPY: Record<InvitationStatus, { label: string; className: string }> = {
  active: { label: "активно 🌷", className: "bg-mint text-success" },
  answered: { label: "ответили 💕", className: "bg-pink-soft text-strawberry-deep" },
  draft: { label: "черновик ✏️", className: "bg-cream-deep text-cherry-soft" },
  expired: { label: "истекло 🌙", className: "bg-lavender text-cherry" },
  archived: { label: "в архиве 📦", className: "bg-cream-deep text-cherry-faint" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: InvitationStatus;
  className?: string;
}) {
  const { label, className: tone } = COPY[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-tiny font-semibold",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
