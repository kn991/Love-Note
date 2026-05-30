"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import { ChoiceGrid } from "@/components/invite/ChoiceGrid";
import { CuteButton, CuteInput } from "@/components/ui";
import { PLACE_CUSTOM_LABEL } from "@/lib/invite/constants";
import { ArrowRight } from "lucide-react";
import type { StepProps } from "@/components/invite/answers";
import type { InviteOption } from "@/lib/invite/types";

export function StepPlace({
  invite,
  answers,
  update,
  onNext,
  onBack,
  progress,
}: StepProps) {
  const reduce = useReducedMotion();

  const options: InviteOption[] = [
    ...invite.place_options,
    { emoji: "💭", label: PLACE_CUSTOM_LABEL },
  ];

  const select = (label: string) => {
    const isCustom = label === PLACE_CUSTOM_LABEL;
    update({ place: label, placeIsCustom: isCustom });
  };

  const canContinue = answers.placeIsCustom
    ? answers.placeCustom.trim().length > 0
    : answers.place.length > 0;

  return (
    <InviteStepLayout
      avatarFallback="🌸"
      title="Куда пойдём? 🌸"
      subtitle="выбери место или предложи своё"
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
          options={options}
          isSelected={(l) => answers.place === l}
          onSelect={select}
        />
        <AnimatePresence initial={false}>
          {answers.placeIsCustom && (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <CuteInput
                autoFocus
                value={answers.placeCustom}
                onChange={(e) => update({ placeCustom: e.target.value })}
                placeholder="например, на крышу с видом на закат 🌇"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </InviteStepLayout>
  );
}
