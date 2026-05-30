"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import { CuteButton } from "@/components/ui";
import { SuccessConfetti } from "@/components/invite/SuccessConfetti";

export interface StepSuccessProps {
  finalMessage: string;
}

export function StepSuccess({ finalMessage }: StepSuccessProps) {
  const reduce = useReducedMotion();
  const router = useRouter();

  return (
    <div className="relative min-h-full">
      <SuccessConfetti />
      <InviteStepLayout
        avatarFallback={
          <motion.span
            initial={reduce ? false : { scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 14 }}
          >
            🎉
          </motion.span>
        }
        title="Ответ отправлен 💌"
        subtitle="теперь он точно улыбается как дурак 😌💕"
        footer={
          <CuteButton
            fullWidth
            size="lg"
            variant="secondary"
            onClick={() => router.push("/")}
          >
            на главную
          </CuteButton>
        }
      >
        <p className="mx-auto max-w-prose text-balance font-accent text-3xl leading-snug text-strawberry">
          «{finalMessage}»
        </p>
      </InviteStepLayout>
    </div>
  );
}
