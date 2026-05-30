import type { PublicInvite } from "./types";

/**
 * Mock invites keyed by token, used until the backend exists. Reach specific
 * states with these tokens:
 *   demo / <anything-else>  → open invite
 *   expired                 → state "expired"
 *   inactive                → state "inactive"
 *   answered                → state "answered" (already responded)
 *   missing                 → unknown token (404)
 */

const baseInvite: PublicInvite = {
  girl_name: "Аня",
  title: "пойдёшь со мной на свидание?",
  greeting_message: "у меня к тебе есть один важный вопрос…",
  avatar_url: null,
  food_options: [
    { emoji: "🍕", label: "Пицца" },
    { emoji: "🍣", label: "Суши" },
    { emoji: "🍝", label: "Паста" },
    { emoji: "☕", label: "Кофе" },
    { emoji: "🍰", label: "Десерты" },
    { emoji: "🍔", label: "Бургеры" },
    { emoji: "🍜", label: "Рамен" },
    { emoji: "🎲", label: "Сюрприз" },
  ],
  place_options: [
    { emoji: "🎬", label: "Кино" },
    { emoji: "🌳", label: "Парк" },
    { emoji: "🍷", label: "Уютное кафе" },
    { emoji: "🎡", label: "Что-то с видом" },
    { emoji: "🏠", label: "Дома, по-домашнему" },
  ],
  activity_options: [
    { emoji: "🛋️", label: "уютно и спокойно" },
    { emoji: "🌹", label: "романтично" },
    { emoji: "🚶", label: "прогулка и разговоры" },
    { emoji: "🍽️", label: "вкусно поесть" },
    { emoji: "✨", label: "что-то необычное" },
    { emoji: "🎁", label: "сюрприз" },
  ],
  final_message: "не могу дождаться 💕",
  allow_multiple_responses: false,
  already_responded: false,
  state: "open",
};

export const MOCK_INVITES: Record<string, PublicInvite> = {
  demo: baseInvite,
  expired: { ...baseInvite, state: "expired" },
  inactive: { ...baseInvite, state: "inactive" },
  answered: { ...baseInvite, state: "answered", already_responded: true },
};

/** Tokens that should behave as unknown (404). */
export const MOCK_MISSING_TOKENS = new Set(["missing", "notfound", "404"]);

export function resolveMockInvite(token: string): PublicInvite | null {
  if (MOCK_MISSING_TOKENS.has(token)) return null;
  return MOCK_INVITES[token] ?? baseInvite;
}
