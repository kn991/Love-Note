"use client";

import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import { CuteButton } from "@/components/ui";
import { NoButton } from "@/components/invite/NoButton";
import type { PublicInvite } from "@/lib/invite/types";

export interface StepIntroProps {
  invite: PublicInvite;
  onYes: () => void;
}

export function StepIntro({ invite, onYes }: StepIntroProps) {
  return (
    <InviteStepLayout
      avatarUrl={invite.avatar_url ?? undefined}
      avatarFallback="💌"
      title={`${invite.girl_name}, ${invite.title} 💌`}
      subtitle={invite.greeting_message}
    >
      <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-4">
        <CuteButton fullWidth size="lg" onClick={onYes}>
          да 💕
        </CuteButton>
        <div className="relative grid h-14 w-full place-items-center">
          <NoButton />
        </div>
      </div>
    </InviteStepLayout>
  );
}
