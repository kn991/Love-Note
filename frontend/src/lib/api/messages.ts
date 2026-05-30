/** Maps backend error codes (English, dev-facing) to cute Russian UI copy. */

import { ApiError } from "./client";

const CODE_COPY: Record<string, string> = {
  network_error: "Не получилось связаться с сервером — проверь интернет 🥺",
  internal_error: "Что-то сломалось на нашей стороне 😞 Попробуй ещё раз",
  rate_limited: "Слишком часто 🙈 Подожди минутку и попробуй снова",
  validation_error: "Проверь поля — что-то заполнено не так 🌸",
  bad_request: "Что-то не так с запросом 🥺",
  unauthorized: "Нужно войти, чтобы продолжить 💌",
  invalid_credentials: "Неверная почта/логин или пароль 🙈",
  csrf_failed: "Сессия устарела — войди заново 💕",
  forbidden: "Сюда нельзя 🙈",
  not_found: "Не нашли это приглашение 🥺",
  email_taken: "Эта почта уже занята 💌",
  username_taken: "Этот логин уже занят 🙈",
  already_responded: "Ответ уже отправлен 💕",
  invitation_expired: "Это приглашение уже отдохнуло 🌙",
};

const FALLBACK = "Ой, что-то пошло не так 🥺 Попробуем ещё раз?";

/** Human, romantic Russian message for any thrown error. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return CODE_COPY[err.code] ?? FALLBACK;
  }
  return FALLBACK;
}
