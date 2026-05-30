"use client";

import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import { ChoiceGrid } from "@/components/invite/ChoiceGrid";
import { CuteButton } from "@/components/ui";
import { ArrowRight } from "lucide-react";
import type { StepProps } from "@/components/invite/answers";

export function StepVibe({
  invite,
  answers,
  update,
  onNext,
  onBack,
  progress,
}: StepProps) {
  return (
    <InviteStepLayout
      avatarFallback="✨"
      title="Какой вайб свидания? ✨"
      subtitle="чтобы всё было как ты любишь"
      progress={progress}
      onBack={onBack}
      footer={
        <CuteButton
          fullWidth
          size="lg"
          disabled={!answers.vibe}
          onClick={onNext}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          дальше
        </CuteButton>
      }
    >
      <ChoiceGrid
        options={invite.activity_options}
        isSelected={(l) => answers.vibe === l}
        onSelect={(l) => update({ vibe: l })}
      />
    </InviteStepLayout>
  );
}
