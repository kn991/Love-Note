import petrovich from "petrovich";

/**
 * Decline a recipient's name into the genitive case so UI reads naturally:
 * "для Маша" → "для Маши", "для Аня" → "для Ани".
 *
 * The recipient is always a girl in lovenote, so we default to the female
 * ruleset. petrovich leaves anything it can't recognise (non-Russian input,
 * gibberish, multi-word strings) untouched, and we guard with try/catch so a
 * bad name can never break rendering.
 */
export function toGenitive(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return name;
  try {
    const declined = petrovich(
      { first: trimmed, gender: "female" },
      "genitive",
    ).first;
    return declined && declined.length > 0 ? declined : name;
  } catch {
    return name;
  }
}

/** Convenience: the "для <name-in-genitive>" label used across the dashboard. */
export function forRecipient(name: string): string {
  return `для ${toGenitive(name)}`;
}
