/** Owner-scoped invitation endpoints (`/api/invitations/*`). */

import { request } from "./client";
import type {
  InvitationCreateInput,
  InvitationDetail,
  InvitationListItem,
  InvitationStatus,
  InvitationUpdateInput,
  Paginated,
  ResponsePublic,
} from "./types";

export interface ListInvitationsParams {
  status?: InvitationStatus;
  page?: number;
  per_page?: number;
  include_archived?: boolean;
}

export const invitationsApi = {
  list(
    params: ListInvitationsParams = {},
    signal?: AbortSignal,
  ): Promise<Paginated<InvitationListItem>> {
    return request<Paginated<InvitationListItem>>("/invitations", {
      query: {
        status: params.status,
        page: params.page,
        per_page: params.per_page,
        include_archived: params.include_archived,
      },
      signal,
    });
  },

  create(input: InvitationCreateInput): Promise<InvitationDetail> {
    return request<InvitationDetail>("/invitations", {
      method: "POST",
      body: input,
    });
  },

  get(id: number, signal?: AbortSignal): Promise<InvitationDetail> {
    return request<InvitationDetail>(`/invitations/${id}`, { signal });
  },

  update(
    id: number,
    input: InvitationUpdateInput,
  ): Promise<InvitationDetail> {
    return request<InvitationDetail>(`/invitations/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: number): Promise<void> {
    return request<void>(`/invitations/${id}`, { method: "DELETE" });
  },

  archive(id: number): Promise<InvitationDetail> {
    return request<InvitationDetail>(`/invitations/${id}/archive`, {
      method: "POST",
    });
  },

  activate(id: number): Promise<InvitationDetail> {
    return request<InvitationDetail>(`/invitations/${id}/activate`, {
      method: "POST",
    });
  },

  deactivate(id: number): Promise<InvitationDetail> {
    return request<InvitationDetail>(`/invitations/${id}/deactivate`, {
      method: "POST",
    });
  },

  responses(
    id: number,
    params: { page?: number; per_page?: number } = {},
    signal?: AbortSignal,
  ): Promise<Paginated<ResponsePublic>> {
    return request<Paginated<ResponsePublic>>(`/invitations/${id}/responses`, {
      query: { page: params.page, per_page: params.per_page },
      signal,
    });
  },
};
