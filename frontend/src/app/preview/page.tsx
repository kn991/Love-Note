"use client";

import { useState, type ReactNode } from "react";
import { Heart, Search, Send, Sparkles, Trash2 } from "lucide-react";
import { FloatingDecorations } from "@/components/decorations/FloatingDecorations";
import { InviteStepLayout } from "@/components/invite/InviteStepLayout";
import {
  ChoiceCard,
  CuteButton,
  CuteInput,
  CuteTextarea,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressHearts,
  Sticker,
} from "@/components/ui";

const SWATCHES: { name: string; cls: string; text?: string }[] = [
  { name: "cream", cls: "bg-cream" },
  { name: "cream-deep", cls: "bg-cream-deep" },
  { name: "card", cls: "bg-card" },
  { name: "pink-soft", cls: "bg-pink-soft" },
  { name: "blush", cls: "bg-blush" },
  { name: "strawberry", cls: "bg-strawberry", text: "text-card" },
  { name: "strawberry-deep", cls: "bg-strawberry-deep", text: "text-card" },
  { name: "cherry", cls: "bg-cherry", text: "text-card" },
  { name: "cherry-soft", cls: "bg-cherry-soft", text: "text-card" },
  { name: "lavender", cls: "bg-lavender" },
  { name: "lavender-deep", cls: "bg-lavender-deep", text: "text-card" },
  { name: "mint", cls: "bg-mint" },
  { name: "butter", cls: "bg-butter" },
  { name: "danger", cls: "bg-danger", text: "text-card" },
];

const FOODS = [
  { emoji: "🍕", label: "Пицца" },
  { emoji: "🍣", label: "Суши" },
  { emoji: "🍝", label: "Паста" },
  { emoji: "☕", label: "Кофе" },
  { emoji: "🍰", label: "Десерты" },
  { emoji: "🍔", label: "Бургеры" },
];

const VIBES = [
  { emoji: "🛋️", label: "уютно и спокойно" },
  { emoji: "🌹", label: "романтично" },
  { emoji: "🚶", label: "прогулка и разговоры" },
  { emoji: "✨", label: "что-то необычное" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card/70 p-6 shadow-sm">
      <h2 className="mb-5 font-display text-xl text-cherry">{title}</h2>
      {children}
    </section>
  );
}

export default function PreviewPage() {
  const [food, setFood] = useState<string[]>(["Суши"]);
  const [vibe, setVibe] = useState<string>("романтично");
  const [step, setStep] = useState(3);
  const [showError, setShowError] = useState(true);

  const toggleFood = (label: string) =>
    setFood((prev) =>
      prev.includes(label)
        ? prev.filter((f) => f !== label)
        : [...prev, label],
    );

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-grad-petal pb-24">
      <FloatingDecorations />

      <div className="relative z-10 mx-auto max-w-3xl space-y-8 px-5 py-12">
        {/* Header */}
        <header className="text-center">
          <Sticker tone="pink" size="lg" rotate={-8} className="mb-3">
            <span aria-hidden>🎨</span>
          </Sticker>
          <h1 className="font-display text-display text-cherry">
            lovenote — дизайн-система
          </h1>
          <p className="mt-2 font-accent text-2xl text-cherry-soft">
            мягко, розово, романтично, по-настоящему
          </p>
        </header>

        {/* Palette */}
        <Section title="Палитра">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SWATCHES.map((s) => (
              <div
                key={s.name}
                className={`flex h-20 flex-col justify-end rounded-md border border-border/60 p-2 text-xs font-semibold ${s.cls} ${s.text ?? "text-cherry"}`}
              >
                {s.name}
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Типографика">
          <div className="space-y-3">
            <p className="font-display text-display text-cherry">
              Display — Comfortaa
            </p>
            <p className="font-display text-2xl text-cherry">Заголовок h1</p>
            <p className="text-base text-cherry">
              Body — Nunito. Пойдёшь со мной на свидание? 💌
            </p>
            <p className="text-sm text-cherry-soft">Small / приглушённый текст</p>
            <p className="font-accent text-3xl text-strawberry">
              Caveat — рукописный акцент 💕
            </p>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="CuteButton">
          <div className="flex flex-wrap items-center gap-3">
            <CuteButton>да 💕</CuteButton>
            <CuteButton variant="secondary">нет 😭</CuteButton>
            <CuteButton variant="ghost">Назад</CuteButton>
            <CuteButton variant="danger" leftIcon={<Trash2 className="h-4 w-4" />}>
              Удалить
            </CuteButton>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <CuteButton size="lg" leftIcon={<Send className="h-4 w-4" />}>
              Отправить ответ
            </CuteButton>
            <CuteButton loading>Сохраняем</CuteButton>
            <CuteButton disabled>Недоступно</CuteButton>
          </div>
          <div className="mt-4">
            <CuteButton fullWidth size="lg">
              Создать приглашение 💌
            </CuteButton>
          </div>
        </Section>

        {/* Stickers */}
        <Section title="Sticker">
          <div className="flex flex-wrap items-center gap-4">
            <Sticker tone="pink">💕</Sticker>
            <Sticker tone="lavender" rotate={6}>
              🌸
            </Sticker>
            <Sticker tone="butter" rotate={-10}>
              ✨
            </Sticker>
            <Sticker tone="mint" rotate={4}>
              🍰
            </Sticker>
            <Sticker tone="cream" size="lg" rotate={-6}>
              💌
            </Sticker>
          </div>
        </Section>

        {/* Progress hearts */}
        <Section title="ProgressHearts">
          <div className="flex flex-col items-center gap-4">
            <ProgressHearts total={8} current={step} />
            <div className="flex gap-3">
              <CuteButton
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                −
              </CuteButton>
              <CuteButton
                variant="secondary"
                onClick={() => setStep((s) => Math.min(8, s + 1))}
              >
                +
              </CuteButton>
            </div>
          </div>
        </Section>

        {/* Choice cards */}
        <Section title="ChoiceCard — мультивыбор (еда)">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {FOODS.map((f) => (
              <ChoiceCard
                key={f.label}
                emoji={f.emoji}
                label={f.label}
                multi
                selected={food.includes(f.label)}
                onSelect={() => toggleFood(f.label)}
              />
            ))}
          </div>
        </Section>

        <Section title="ChoiceCard — один выбор (вайб)">
          <div className="grid grid-cols-2 gap-3">
            {VIBES.map((v) => (
              <ChoiceCard
                key={v.label}
                emoji={v.emoji}
                label={v.label}
                selected={vibe === v.label}
                onSelect={() => setVibe(v.label)}
              />
            ))}
          </div>
        </Section>

        {/* Inputs */}
        <Section title="CuteInput / CuteTextarea">
          <div className="space-y-4">
            <CuteInput
              label="Имя"
              placeholder="например, Аня"
              helper="так мы обратимся к ней в приглашении"
            />
            <CuteInput
              label="Поиск"
              placeholder="что-нибудь милое…"
              leftIcon={<Search className="h-4 w-4" />}
            />
            <CuteInput
              label="Email"
              defaultValue="ой"
              error="кажется, тут опечатка 🥺"
            />
            <CuteTextarea
              label="Комментарий"
              placeholder="необязательно, но мне будет приятно…"
            />
          </div>
        </Section>

        {/* States */}
        <Section title="Состояния">
          <div className="space-y-6">
            <LoadingState />
            <EmptyState
              emoji="🌸"
              title="Здесь пока пусто"
              description="Создай первое приглашение и поделись милой ссылкой 💌"
              action={<CuteButton>Создать приглашение 💌</CuteButton>}
            />
            {showError ? (
              <ErrorState onRetry={() => setShowError(false)} />
            ) : (
              <p className="text-center text-cherry-soft">
                Ошибка скрыта 💕 (нажми «−» у прогресса, чтобы вернуть — шутка)
              </p>
            )}
          </div>
        </Section>

        {/* Invite step layout demo */}
        <Section title="InviteStepLayout (демо шага)">
          <div className="h-[640px] overflow-hidden rounded-xl border border-border bg-grad-petal">
            <InviteStepLayout
              title="Что будем есть? 🍓"
              subtitle="выбирай сколько хочешь"
              avatarFallback="🐱"
              progress={{ total: 8, current: 4 }}
              onBack={() => {}}
              footer={
                <CuteButton
                  fullWidth
                  size="lg"
                  rightIcon={<Sparkles className="h-4 w-4" />}
                >
                  Дальше
                </CuteButton>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                {FOODS.slice(0, 4).map((f) => (
                  <ChoiceCard
                    key={f.label}
                    emoji={f.emoji}
                    label={f.label}
                    multi
                    selected={food.includes(f.label)}
                    onSelect={() => toggleFood(f.label)}
                  />
                ))}
              </div>
            </InviteStepLayout>
          </div>
        </Section>

        <footer className="flex items-center justify-center gap-2 pt-4 text-cherry-soft">
          <Heart className="h-4 w-4 text-strawberry" fill="currentColor" />
          сделано с любовью
        </footer>
      </div>
    </main>
  );
}
