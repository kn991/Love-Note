"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CuteToggle } from "@/components/dashboard/CuteToggle";
import { OptionEditor } from "@/components/dashboard/OptionEditor";
import { CuteButton, CuteInput, CuteTextarea } from "@/components/ui";
import { invitationsApi } from "@/lib/api/invitations";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/messages";
import type { InvitationCreateInput, InviteOption } from "@/lib/api/types";

function toIso(localValue: string): string | null {
  if (!localValue) return null;
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default function NewInvitationPage() {
  const router = useRouter();

  const [girlName, setGirlName] = useState("");
  const [title, setTitle] = useState("");
  const [greeting, setGreeting] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [finalMessage, setFinalMessage] = useState("");
  const [food, setFood] = useState<InviteOption[]>([]);
  const [place, setPlace] = useState<InviteOption[]>([]);
  const [activity, setActivity] = useState<InviteOption[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [allowMultiple, setAllowMultiple] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{ avatar?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !girlName.trim()) return;
    setSubmitting(true);
    setError(null);
    setFieldError({});

    const payload: InvitationCreateInput = {
      girl_name: girlName.trim(),
      title: title.trim() || null,
      greeting_message: greeting.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      final_message: finalMessage.trim() || null,
      food_options: food,
      place_options: place,
      activity_options: activity,
      expires_at: toIso(expiresAt),
      is_active: isActive,
      allow_multiple_responses: allowMultiple,
    };

    try {
      const created = await invitationsApi.create(payload);
      router.replace(`/dashboard/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "validation_error") {
        const fe = err.fieldErrors();
        setFieldError({ avatar: fe.avatar_url });
        if (!fe.avatar_url) setError(errorMessage(err));
      } else {
        setError(errorMessage(err));
      }
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-cherry-soft transition-colors hover:text-cherry"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        к приглашениям
      </Link>

      <h1 className="font-display text-display text-cherry">
        Новое приглашение
      </h1>
      <p className="mt-1 text-cherry-soft">
        заполни то, что хочется — остальное подставим за тебя 💕
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5" noValidate>
        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger bg-danger-soft px-4 py-2.5 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <CuteInput
              label="Как её зовут?"
              value={girlName}
              onChange={(e) => setGirlName(e.target.value)}
              placeholder="Аня"
              maxLength={80}
              required
            />
            <CuteInput
              label="Главный вопрос"
              helper="по умолчанию: «пойдёшь со мной на свидание?»"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="пойдёшь со мной на свидание?"
              maxLength={140}
            />
            <CuteTextarea
              label="Тёплое приветствие"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="у меня к тебе важный вопрос…"
              maxLength={1000}
            />
            <CuteInput
              label="Ссылка на аватар (необязательно)"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…/cat.png"
              error={fieldError.avatar}
              maxLength={2048}
            />
            <CuteTextarea
              label="Сообщение в финале"
              helper="его она увидит после ответа"
              value={finalMessage}
              onChange={(e) => setFinalMessage(e.target.value)}
              placeholder="не могу дождаться 💕"
              maxLength={1000}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="mb-4 font-display text-lg text-cherry">
            Варианты ответов
          </h2>
          <p className="-mt-2 mb-4 text-sm text-cherry-faint">
            оставь пустым — подставим милые варианты по умолчанию 🌷
          </p>
          <div className="flex flex-col gap-5">
            <OptionEditor
              label="Еда"
              value={food}
              onChange={setFood}
              placeholder="Пицца"
            />
            <OptionEditor
              label="Место"
              value={place}
              onChange={setPlace}
              placeholder="Кино"
            />
            <OptionEditor
              label="Вайб"
              value={activity}
              onChange={setActivity}
              placeholder="романтично"
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
          <CuteInput
            label="Действует до (необязательно)"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
          <CuteToggle
            checked={isActive}
            onChange={setIsActive}
            label="Активно"
            description="можно открыть по ссылке прямо сейчас"
          />
          <CuteToggle
            checked={allowMultiple}
            onChange={setAllowMultiple}
            label="Разрешить несколько ответов"
            description="иначе принимается только первый ответ"
          />
        </section>

        <div className="flex gap-3">
          <CuteButton
            type="submit"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!girlName.trim()}
          >
            Создать приглашение 💌
          </CuteButton>
        </div>
      </form>
    </div>
  );
}
