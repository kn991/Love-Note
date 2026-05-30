/**
 * Types mirroring the backend serializers (API_CONTRACT §6). Kept in one place
 * so the dashboard and auth flows share a single source of truth.
 */

import type { InviteOption } from "@/lib/invite/types";

export type { InviteOption };

/** §6.1 UserPublic */
export interface UserPublic {
  id: number;
  email: string;
  username: string;
  created_at: string;
  is_active: boolean;
}

/** Derived invitation status (DATABASE_SCHEMA §4). */
export type InvitationStatus =
  | "draft"
  | "active"
  | "answered"
  | "expired"
  | "archived";

/** §6.3 InvitationListItem */
export interface InvitationListItem {
  id: number;
  token: string;
  public_url: string;
  girl_name: string;
  title: string | null;
  status: InvitationStatus;
  is_active: boolean;
  archived_at: string | null;
  expires_at: string | null;
  response_count: number;
  view_count: number;
  created_at: string;
}

/** §6.4 InvitationDetail (full, owner-only). */
export interface InvitationDetail {
  id: number;
  token: string;
  public_url: string;
  girl_name: string;
  title: string | null;
  greeting_message: string | null;
  avatar_url: string | null;
  food_options: InviteOption[];
  place_options: InviteOption[];
  activity_options: InviteOption[];
  final_message: string | null;
  expires_at: string | null;
  is_active: boolean;
  allow_multiple_responses: boolean;
  archived_at: string | null;
  status: InvitationStatus;
  response_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

/** §6.5 InvitationCreate body. Empty option arrays → server defaults. */
export interface InvitationCreateInput {
  girl_name: string;
  title?: string | null;
  greeting_message?: string | null;
  avatar_url?: string | null;
  food_options?: InviteOption[];
  place_options?: InviteOption[];
  activity_options?: InviteOption[];
  final_message?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
  allow_multiple_responses?: boolean;
}

/** §6.5 InvitationUpdate body — every field optional. */
export type InvitationUpdateInput = Partial<InvitationCreateInput>;

/** §6.6 ResponsePublic (owner viewing a response). */
export interface ResponsePublic {
  id: number;
  availability: { slots: string[]; text: string };
  food_preference: string[];
  place_preference: string | null;
  place_is_custom: boolean;
  activity_preference: string | null;
  vibe: string | null;
  comment: string | null;
  submitted_at: string;
}

/** Standard paginated list envelope. */
export interface Paginated<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
}

/** Auth request payloads. */
export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}
