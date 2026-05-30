"use client";

import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import { CuteButton, CuteTextarea } from "@/components/ui";
import { ArrowRight } from "lucide-react";
import type { StepProps } from "@/components/invite/answers";

export function StepComment({
  answers,
  update,
  onNext,
  onBack,
  progress,
}: StepProps) {
  return (
    <InviteStepLayout
      avatarFallback="💭"
      title="Хочешь что-то добавить? 💭"
      subtitle="по желанию — но мне будет приятно"
      progress={progress}
      onBack={onBack}
      footer={
        <CuteButton
          fullWidth
          size="lg"
          onClick={onNext}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          дальше
        </CuteButton>
      }
    >
      <CuteTextarea
        rows={4}
        maxLength={1000}
        value={answers.comment}
        onChange={(e) => update({ comment: e.target.value })}
        placeholder="необязательно, но мне будет приятно…"
      />
    </InviteStepLayout>
  );
}
