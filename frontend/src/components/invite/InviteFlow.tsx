"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { postResponse } from "@/lib/invite/api";
import type { PublicInvite, ResponseCreate } from "@/lib/invite/types";
import { EMPTY_ANSWERS, type InviteAnswers } from "./answers";
import { StepIntro } from "./steps/StepIntro";
import { StepConfirm } from "./steps/StepConfirm";
import { StepAvailability } from "./steps/StepAvailability";
import { StepFood } from "./steps/StepFood";
import { StepPlace } from "./steps/StepPlace";
import { StepVibe } from "./steps/StepVibe";
import { StepComment } from "./steps/StepComment";
import { StepReview, type EditTarget } from "./steps/StepReview";
import { StepSuccess } from "./steps/StepSuccess";

const STEP = {
  intro: 0,
  confirm: 1,
  availability: 2,
  food: 3,
  place: 4,
  vibe: 5,
  comment: 6,
  review: 7,
  success: 8,
} as const;

/** The six question screens carry the heart progress (availability → review). */
const PROGRESS_TOTAL = 6;
const progressFor = (step: number) => ({
  total: PROGRESS_TOTAL,
  current: step - STEP.availability + 1,
});

const EDIT_STEP: Record<EditTarget, number> = {
  availability: STEP.availability,
  food: STEP.food,
  place: STEP.place,
  vibe: STEP.vibe,
  comment: STEP.comment,
};

function buildResponse(answers: InviteAnswers): ResponseCreate {
  return {
    availability: {
      slots: answers.availabilitySlots,
      text: answers.availabilityText.trim(),
    },
    food_preference: answers.food,
    place_preference: answers.placeIsCustom
      ? answers.placeCustom.trim()
      : answers.place,
    place_is_custom: answers.placeIsCustom,
    activity_preference: answers.vibe,
    vibe: answers.vibe,
    comment: answers.comment.trim(),
  };
}

export function InviteFlow({
  token,
  invite,
}: {
  token: string;
  invite: PublicInvite;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<number>(STEP.intro);
  const [answers, setAnswers] = useState<InviteAnswers>(EMPTY_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalMessage, setFinalMessage] = useState(invite.final_message);

  const update = useCallback(
    (patch: Partial<InviteAnswers>) => setAnswers((a) => ({ ...a, ...patch })),
    [],
  );
  const next = useCallback(() => setStep((s) => s + 1), []);
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await postResponse(token, buildResponse(answers));
      setFinalMessage(result.final_message);
      setStep(STEP.success);
    } catch {
      setError("Не получилось отправить — попробуй ещё раз 🥺");
    } finally {
      setSubmitting(false);
    }
  }, [token, answers]);

  const content = useMemo(() => {
    const shared = { invite, answers, update, onNext: next, onBack: back };
    switch (step) {
      case STEP.intro:
        return (
          <StepIntro key="intro" invite={invite} onYes={next} />
        );
      case STEP.confirm:
        return (
          <StepConfirm
            key="confirm"
            invite={invite}
            onConfirm={next}
            onBack={back}
          />
        );
      case STEP.availability:
        return (
          <StepAvailability
            key="availability"
            {...shared}
            progress={progressFor(step)}
          />
        );
      case STEP.food:
        return (
          <StepFood key="food" {...shared} progress={progressFor(step)} />
        );
      case STEP.place:
        return (
          <StepPlace key="place" {...shared} progress={progressFor(step)} />
        );
      case STEP.vibe:
        return (
          <StepVibe key="vibe" {...shared} progress={progressFor(step)} />
        );
      case STEP.comment:
        return (
          <StepComment key="comment" {...shared} progress={progressFor(step)} />
        );
      case STEP.review:
        return (
          <StepReview
            key="review"
            invite={invite}
            answers={answers}
            onSubmit={submit}
            onBack={back}
            onEdit={(target) => setStep(EDIT_STEP[target])}
            submitting={submitting}
            error={error}
            progress={progressFor(step)}
          />
        );
      case STEP.success:
        return <StepSuccess key="success" finalMessage={finalMessage} />;
      default:
        return null;
    }
  }, [
    step,
    invite,
    answers,
    update,
    next,
    back,
    submit,
    submitting,
    error,
    finalMessage,
  ]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        className="min-h-full"
        initial={false}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
