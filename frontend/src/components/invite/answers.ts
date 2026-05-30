import type { PublicInvite } from "@/lib/invite/types";

/** Everything the recipient picks across the game, before it's shaped into a ResponseCreate. */
export interface InviteAnswers {
  availabilitySlots: string[];
  availabilityText: string;
  food: string[];
  place: string;
  placeIsCustom: boolean;
  placeCustom: string;
  vibe: string;
  comment: string;
}

export const EMPTY_ANSWERS: InviteAnswers = {
  availabilitySlots: [],
  availabilityText: "",
  food: [],
  place: "",
  placeIsCustom: false,
  placeCustom: "",
  vibe: "",
  comment: "",
};

/** Shared shape for the question steps (availability → review). */
export interface StepProps {
  invite: PublicInvite;
  answers: InviteAnswers;
  update: (patch: Partial<InviteAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
  progress: { total: number; current: number };
}
