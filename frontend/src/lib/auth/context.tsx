"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import type { UserPublic } from "@/lib/api/types";

interface AuthContextValue {
  user: UserPublic;
  setUser: (user: UserPublic) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides the authenticated user to the dashboard subtree. Mounted by the
 * dashboard layout *after* the session has been verified, so `user` is always
 * present here.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: UserPublic;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic>(initialUser);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      router.replace("/login");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, setUser, logout }),
    [user, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
