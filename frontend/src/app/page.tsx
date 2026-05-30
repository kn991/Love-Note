"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, Link2, MailOpen } from "lucide-react";
import { FloatingDecorations } from "@/components/decorations/FloatingDecorations";
import { CuteButton } from "@/components/ui/CuteButton";
import { Sticker } from "@/components/ui/Sticker";

const STEPS = [
  {
    emoji: "💌",
    tone: "pink" as const,
    icon: MailOpen,
    title: "Собери приглашение",
    body: "имя, тёплое приветствие и милые варианты — еда, место, вайб.",
  },
  {
    emoji: "🔗",
    tone: "lavender" as const,
    icon: Link2,
    title: "Поделись ссылкой",
    body: "одна приватная ссылка — её не угадать и не найти случайно.",
  },
  {
    emoji: "💕",
    tone: "butter" as const,
    icon: Heart,
    title: "Получи ответы",
    body: "она проходит милую мини-игру, а ты видишь ответы в кабинете.",
  },
];

export default function Home() {
  const reduce = useReducedMotion();

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-grad-petal">
      <FloatingDecorations />

      {/* top bar */}
      <header className="relative z-20">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <span className="flex items-center gap-2 font-display text-xl text-cherry">
            <span aria-hidden className="text-2xl">
              💌
            </span>
            lovenote
          </span>
          <Link
            href="/login"
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-cherry-soft transition-colors hover:text-cherry"
          >
            Войти
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5">
        {/* hero */}
        <section className="flex flex-col items-center pb-10 pt-12 text-center sm:pt-20">
          <motion.div {...rise(0)}>
            <Sticker tone="pink" size="lg" rotate={-8}>
              <span aria-hidden>💌</span>
            </Sticker>
          </motion.div>

          <motion.h1
            {...rise(0.06)}
            className="mt-6 text-balance font-display text-4xl leading-tight text-cherry sm:text-5xl"
          >
            Пригласи её на свидание{" "}
            <span className="text-strawberry">красиво</span>
          </motion.h1>

          <motion.p
            {...rise(0.12)}
            className="mx-auto mt-3 max-w-prose font-accent text-2xl text-cherry-soft"
          >
            не скучная форма, а маленькая романтичная игра 🌸
          </motion.p>

          <motion.p
            {...rise(0.16)}
            className="mx-auto mt-3 max-w-md text-cherry-soft"
          >
            Собери приглашение за минуту, отправь приватную ссылку — и узнай,
            когда, что и где она хочет.
          </motion.p>

          <motion.div
            {...rise(0.22)}
            className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <CuteButton
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Создать приглашение 🌷
              </CuteButton>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <CuteButton variant="ghost" size="lg" fullWidth>
                У меня уже есть аккаунт
              </CuteButton>
            </Link>
          </motion.div>
        </section>

        {/* how it works */}
        <section className="pb-20">
          <motion.h2
            {...rise(0.28)}
            className="mb-6 text-center font-display text-xl text-cherry"
          >
            Как это работает 💕
          </motion.h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.title}
                  {...rise(0.32 + i * 0.08)}
                  className="rounded-2xl border border-border bg-card/80 p-5 text-center shadow-sm backdrop-blur-sm"
                >
                  <div className="mb-3 flex justify-center">
                    <Sticker tone={step.tone} rotate={i % 2 ? 6 : -6}>
                      <span aria-hidden>{step.emoji}</span>
                    </Sticker>
                  </div>
                  <h3 className="flex items-center justify-center gap-1.5 font-display text-base text-cherry">
                    <Icon className="h-4 w-4 text-strawberry" aria-hidden />
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-cherry-soft">{step.body}</p>
                </motion.li>
              );
            })}
          </ul>

          <motion.p
            {...rise(0.6)}
            className="mt-10 text-center text-sm text-cherry-faint"
          >
            сделано с любовью · твои данные остаются твоими 🤍
          </motion.p>
        </section>
      </div>
    </main>
  );
}
