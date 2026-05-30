"use client";

import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import { ChoiceGrid } from "@/components/invite/ChoiceGrid";
import { CuteButton, CuteTextarea } from "@/components/ui";
import { AVAILABILITY_SLOTS } from "@/lib/invite/constants";
import { ArrowRight } from "lucide-react";
import type { StepProps } from "@/components/invite/answers";

export function StepAvailability({
  answers,
  update,
  onNext,
  onBack,
  progress,
}: StepProps) {
  const toggle = (label: string) =>
    update({
      availabilitySlots: answers.availabilitySlots.includes(label)
        ? answers.availabilitySlots.filter((s) => s !== label)
        : [...answers.availabilitySlots, label],
    });

  const canContinue =
    answers.availabilitySlots.length > 0 || answers.availabilityText.trim().length > 0;

  return (
    <InviteStepLayout
      avatarFallback="🗓️"
      title="Когда ты свободна? 🗓️"
      subtitle="можно выбрать несколько вариантов"
      progress={progress}
      onBack={onBack}
      footer={
        <CuteButton
          fullWidth
          size="lg"
          disabled={!canContinue}
          onClick={onNext}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          дальше
        </CuteButton>
      }
    >
      <div className="space-y-4">
        <ChoiceGrid
          options={AVAILABILITY_SLOTS}
          multi
          isSelected={(l) => answers.availabilitySlots.includes(l)}
          onSelect={toggle}
        />
        <CuteTextarea
          rows={2}
          value={answers.availabilityText}
          onChange={(e) => update({ availabilityText: e.target.value })}
          placeholder="или напиши, когда тебе удобно…"
        />
      </div>
    </InviteStepLayout>
  );
}
