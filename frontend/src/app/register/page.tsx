"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, Lock, Smile } from "lucide-react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { CuteButton, CuteInput } from "@/components/ui";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/messages";

type FieldErrors = Partial<Record<"email" | "username" | "password", string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setFields({});
    try {
      await authApi.register({
        email: email.trim(),
        username: username.trim(),
        password,
      });
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "email_taken") {
          setFields({ email: "Эта почта уже занята 💌" });
        } else if (err.code === "username_taken") {
          setFields({ username: "Этот логин уже занят 🙈" });
        } else if (err.code === "validation_error") {
          const fe = err.fieldErrors();
          setFields({
            email: fe.email,
            username: fe.username,
            password: fe.password,
          });
          if (!fe.email && !fe.username && !fe.password) setError(errorMessage(err));
        } else {
          setError(errorMessage(err));
        }
      } else {
        setError(errorMessage(err));
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    email.trim().length > 0 &&
    username.trim().length > 0 &&
    password.length >= 8;

  return (
    <AuthScreen
      emoji="🌸"
      title="Привет 💕"
      subtitle="заведи аккаунт, чтобы создавать приглашения на свидания"
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="font-semibold text-strawberry hover:text-strawberry-deep"
          >
            Войти
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
          label="Почта"
          name="email"
          type="email"
          autoComplete="email"
          leftIcon={<AtSign className="h-4 w-4" aria-hidden />}
          placeholder="roma@mail.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fields.email}
          required
        />

        <CuteInput
          label="Логин"
          name="username"
          autoComplete="username"
          leftIcon={<Smile className="h-4 w-4" aria-hidden />}
          placeholder="roma"
          helper="3–32 символа: буквы, цифры и _"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={fields.username}
          required
        />

        <CuteInput
          label="Пароль"
          name="password"
          type="password"
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" aria-hidden />}
          placeholder="минимум 8 символов"
          helper="не меньше 8 символов, буква и цифра"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fields.password}
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
          Создать аккаунт 🌷
        </CuteButton>
      </form>
    </AuthScreen>
  );
}
