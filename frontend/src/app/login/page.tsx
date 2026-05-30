"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, Lock } from "lucide-react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { CuteButton, CuteInput } from "@/components/ui";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/messages";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await authApi.login({ identifier: identifier.trim(), password });
      router.replace("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
      if (!(err instanceof ApiError)) console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = identifier.trim().length > 0 && password.length > 0;

  return (
    <AuthScreen
      emoji="💌"
      title="С возвращением"
      subtitle="войди, чтобы собрать новое милое приглашение"
      footer={
        <>
          Ещё нет аккаунта?{" "}
          <Link
            href="/register"
            className="font-semibold text-strawberry hover:text-strawberry-deep"
          >
            Создать
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger bg-danger-soft px-4 py-2.5 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <CuteInput
          label="Почта или логин"
          name="identifier"
          autoComplete="username"
          leftIcon={<AtSign className="h-4 w-4" aria-hidden />}
          placeholder="roma или roma@mail.ru"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <CuteInput
          label="Пароль"
          name="password"
          type="password"
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" aria-hidden />}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <CuteButton
          type="submit"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={!canSubmit}
          className="mt-1"
        >
          Войти 💕
        </CuteButton>
      </form>
    </AuthScreen>
  );
}
