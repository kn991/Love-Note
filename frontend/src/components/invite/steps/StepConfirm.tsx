"use client";

import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import { CuteButton } from "@/components/ui";
import type { PublicInvite } from "@/lib/invite/types";

export interface StepConfirmProps {
  invite: PublicInvite;
  onConfirm: () => void;
  onBack: () => void;
}

export function StepConfirm({ invite, onConfirm, onBack }: StepConfirmProps) {
  return (
    <InviteStepLayout
      avatarFallback="🥹"
      title="Подожди... ты правда сказала да? 🥹"
      subtitle={`${invite.girl_name}, это лучшая новость за сегодня`}
      onBack={onBack}
      footer={
        <CuteButton fullWidth size="lg" onClick={onConfirm}>
          да, конечно
        </CuteButton>
      }
    />
  );
}
