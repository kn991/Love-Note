"use client";

import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import { ChoiceGrid } from "@/components/invite/ChoiceGrid";
import { CuteButton } from "@/components/ui";
import { ArrowRight } from "lucide-react";
import type { StepProps } from "@/components/invite/answers";

export function StepFood({
  invite,
  answers,
  update,
  onNext,
  onBack,
  progress,
}: StepProps) {
  const toggle = (label: string) =>
    update({
      food: answers.food.includes(label)
        ? answers.food.filter((f) => f !== label)
        : [...answers.food, label],
    });

  return (
    <InviteStepLayout
      avatarFallback="🍴"
      title="Что будем есть? 🍴"
      subtitle="выбирай сколько хочешь"
      progress={progress}
      onBack={onBack}
      footer={
        <CuteButton
          fullWidth
          size="lg"
          disabled={answers.food.length === 0}
          onClick={onNext}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          дальше
        </CuteButton>
      }
    >
      <ChoiceGrid
        options={invite.food_options}
        columns={3}
        multi
        isSelected={(l) => answers.food.includes(l)}
        onSelect={toggle}
      />
    </InviteStepLayout>
  );
}
