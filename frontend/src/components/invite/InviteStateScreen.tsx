"use client";

import { InviteStepLayout } from "@/components/invite/InviteStepLayout";

export type InviteStateKind = "not_found" | "expired" | "inactive" | "answered";

const COPY: Record<
  InviteStateKind,
  { emoji: string; title: string; subtitle: string }
> = {
  not_found: {
    emoji: "🥺",
    title: "Кажется, такого приглашения нет",
    subtitle: "проверь ссылку — возможно, закралась опечатка",
  },
  expired: {
    emoji: "🌙",
    title: "Это приглашение уже отдохнуло",
    subtitle: "спроси новую ссылку у того, кто его создал 💌",
  },
  inactive: {
    emoji: "⏳",
    title: "Приглашение пока не активно",
    subtitle: "загляни чуть позже 💕",
  },
  answered: {
    emoji: "💕",
    title: "Ты уже ответила",
    subtitle: "ответ доставлен — он уже улыбается 😌",
  },
};

export function InviteStateScreen({ kind }: { kind: InviteStateKind }) {
  const { emoji, title, subtitle } = COPY[kind];
  return (
    <InviteStepLayout avatarFallback={emoji} title={title} subtitle={subtitle} />
  );
}
