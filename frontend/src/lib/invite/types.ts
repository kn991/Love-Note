/**
 * Wire types for the public invite game. These mirror the backend contract in
 * API_CONTRACT.md §5/§6 exactly, so the mock layer can be swapped for real
 * fetch calls without touching any component.
 */

export interface InviteOption {
  emoji: string;
  label: string;
}

/** Server-driven state machine; the frontend picks a screen from this. */
export type InviteState = "open" | "expired" | "inactive" | "answered";

/** `GET /api/public/invite/:token` body — owner/internal fields are never present. */
export interface PublicInvite {
  girl_name: string;
  title: string;
  greeting_message: string;
  avatar_url: string | null;
  food_options: InviteOption[];
  place_options: InviteOption[];
  activity_options: InviteOption[];
  final_message: string;
  allow_multiple_responses: boolean;
  already_responded: boolean;
  state: InviteState;
}

export interface Availability {
  slots: string[];
  text: string;
}

/** `POST /api/public/invite/:token/respond` body (`ResponseCreate`). */
export interface ResponseCreate {
  availability: Availability;
  food_preference: string[];
  place_preference: string;
  place_is_custom: boolean;
  activity_preference: string;
  vibe: string;
  comment: string;
}

export interface RespondResult {
  ok: true;
  final_message: string;
}
