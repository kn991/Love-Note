import type { InviteOption } from "./types";

/**
 * Availability is free-form (not tied to the invite payload), so the time-slot
 * presets live on the client. The recipient can pick several and/or type a note.
 */
export const AVAILABILITY_SLOTS: InviteOption[] = [
  { emoji: "🌇", label: "будни вечером" },
  { emoji: "🗓️", label: "в выходные" },
  { emoji: "☀️", label: "днём" },
  { emoji: "🌙", label: "поздним вечером" },
  { emoji: "📅", label: "на следующей неделе" },
];

/** Rotated each time the playful "нет" button dodges (DESIGN_RULES §7.3). */
export const NO_DODGE_LINES = [
  "уверена? 🥺",
  "подумай ещё разок 🥺",
  "а если так? 💕",
  "кнопка убегает, судьба намекает 😌",
  "ну пожаааалуйста 🙈",
];

export const PLACE_CUSTOM_LABEL = "Другое";
