/** Auth endpoints (`/api/auth/*`). Cookies are set by the server. */

import { request } from "./client";
import type { LoginInput, RegisterInput, UserPublic } from "./types";

export const authApi = {
  register(input: RegisterInput): Promise<UserPublic> {
    return request<UserPublic>("/auth/register", {
      method: "POST",
      body: input,
    });
  },

  login(input: LoginInput): Promise<UserPublic> {
    return request<UserPublic>("/auth/login", { method: "POST", body: input });
  },

  logout(): Promise<void> {
    return request<void>("/auth/logout", { method: "POST" });
  },

  me(signal?: AbortSignal): Promise<UserPublic> {
    return request<UserPublic>("/auth/me", { signal });
  },

  updateMe(
    input: Partial<Pick<RegisterInput, "email" | "username">>,
  ): Promise<UserPublic> {
    return request<UserPublic>("/auth/me", { method: "PATCH", body: input });
  },

  changePassword(input: {
    current_password: string;
    new_password: string;
  }): Promise<void> {
    return request<void>("/auth/change-password", {
      method: "POST",
      body: input,
    });
  },

  deleteMe(password: string): Promise<void> {
    return request<void>("/auth/me", { method: "DELETE", body: { password } });
  },
};
