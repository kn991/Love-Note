"use client";

import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import { CuteButton } from "@/components/ui";
import { Send } from "lucide-react";
import type { InviteAnswers } from "@/components/invite/answers";
import type { PublicInvite } from "@/lib/invite/types";

export type EditTarget = "availability" | "food" | "place" | "vibe" | "comment";

export interface StepReviewProps {
  invite: PublicInvite;
  answers: InviteAnswers;
  onSubmit: () => void;
  onBack: () => void;
  onEdit: (target: EditTarget) => void;
  submitting: boolean;
  error: string | null;
  progress: { total: number; current: number };
}

function Row({
  emoji,
  label,
  value,
  onEdit,
}: {
  emoji: string;
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="text-xl leading-none" aria-hidden>
        {emoji}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-tiny font-semibold uppercase tracking-wide text-cherry-faint">
          {label}
        </p>
        <p className="text-cherry">{value || "—"}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-full px-2 py-1 text-sm text-strawberry transition-colors hover:text-strawberry-deep focus-visible:shadow-glow"
      >
        изменить
      </button>
    </li>
  );
}

export function StepReview({
  answers,
  onSubmit,
  onBack,
  onEdit,
  submitting,
  error,
  progress,
}: StepReviewProps) {
  const availability = [
    ...answers.availabilitySlots,
    answers.availabilityText.trim(),
  ]
    .filter(Boolean)
    .join(", ");
  const place = answers.placeIsCustom ? answers.placeCustom : answers.place;

  return (
    <InviteStepLayout
      avatarFallback="💕"
      title="Проверим, всё верно? 💕"
      subtitle="можно поправить что угодно"
      progress={progress}
      onBack={onBack}
      footer={
        <div className="flex flex-col gap-2">
          {error && (
            <p className="text-center text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <CuteButton
            fullWidth
            size="lg"
            loading={submitting}
            onClick={onSubmit}
            rightIcon={!submitting ? <Send className="h-4 w-4" /> : undefined}
          >
            {submitting ? "Отправляем" : "Отправить ответ 💌"}
          </CuteButton>
        </div>
      }
    >
      <ul className="divide-y divide-border rounded-xl border border-border bg-card/80 px-4 shadow-sm">
        <Row
          emoji="🗓️"
          label="когда"
          value={availability}
          onEdit={() => onEdit("availability")}
        />
        <Row
          emoji="🍴"
          label="еда"
          value={answers.food.join(", ")}
          onEdit={() => onEdit("food")}
        />
        <Row
          emoji="🌸"
          label="место"
          value={place}
          onEdit={() => onEdit("place")}
        />
        <Row
          emoji="✨"
          label="вайб"
          value={answers.vibe}
          onEdit={() => onEdit("vibe")}
        />
        <Row
          emoji="💭"
          label="комментарий"
          value={answers.comment}
          onEdit={() => onEdit("comment")}
        />
      </ul>
    </InviteStepLayout>
  );
}
