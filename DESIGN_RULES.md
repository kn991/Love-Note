# lovenote — Design System & Rules (`DESIGN_RULES.md`)

> The single source of truth for how lovenote looks and feels.
> If an implementation contradicts this file, the implementation is wrong.
> Every UI step must be re-checked against this document and the 8-point self-review.

---

## 0. North Star

lovenote should feel like:
- a soft pink **love letter**
- a **romantic diary** page
- a cute **sticker sheet**
- a personal **invitation**
- a cozy **interactive mini-game**
- premium **but** playful
- cute **but not** childish

The public invite page is a **mini-game**, never a form.

### 0.1 Hard bans (never do these)
- ❌ Generic AI-looking SaaS app.
- ❌ Boring centered white card on a gradient background.
- ❌ Default shadcn styling without heavy customization.
- ❌ Corporate dashboard style (data-dense tables, gray chrome, sidebars with icons-only).
- ❌ Public invitation shown as one long scrolling form.
- ❌ Random emoji spam (more than one emoji per element, except decorations).
- ❌ Ugly generic landing page.
- ❌ Blue/purple SaaS gradients (e.g. `#6366F1`→`#8B5CF6`). No indigo. No "Linear" look.
- ❌ Anything that reads as a template.
- ❌ Pure black text (`#000`) or pure white surfaces (`#FFF`). Everything is warm-tinted.
- ❌ Sharp 90° corners on interactive elements.
- ❌ Hard drop shadows (`rgba(0,0,0,…)` with high alpha). Shadows are soft & tinted.

---

## 1. Color Palette (exact hex — use these tokens, not raw hex in components)

### 1.1 Core
| Token | Hex | Usage |
|---|---|---|
| `cream` | `#FFF8F5` | App background base (warm off-white) |
| `cream-deep` | `#FFF0EA` | Secondary background / section bands |
| `card` | `#FFFDFB` | Card surfaces (warm white) |
| `pink-soft` | `#FFD6E0` | Soft fills, hover backgrounds, decoration |
| `blush` | `#FFB6C7` | Blush accents, borders, badge fills |
| `strawberry` | `#FF7A9A` | **Primary action** (buttons, active states) |
| `strawberry-deep` | `#F2557A` | Primary pressed/hover |
| `cherry` | `#7A2233` | **Primary text** (dark cherry/burgundy) |
| `cherry-soft` | `#9C4A5A` | Secondary text |
| `lavender` | `#D9C7FF` | Secondary accent (buttons, chips) |
| `lavender-deep` | `#B79CF0` | Lavender pressed/hover |
| `mint` | `#C7F0DE` | Rare success accent (use sparingly) |
| `butter` | `#FFE9B8` | Rare warm highlight (sparkles, stars) |

### 1.2 Semantic
| Token | Hex | Usage |
|---|---|---|
| `text` | `#7A2233` | Default text (= cherry) |
| `text-muted` | `#9C4A5A` | Muted/secondary text |
| `text-faint` | `#C39AA3` | Placeholders, captions |
| `border` | `#FFE0E7` | Default soft border |
| `border-strong` | `#FFB6C7` | Emphasized border (= blush) |
| `success` | `#3FA77E` | Success text on mint |
| `danger` | `#E0566B` | Destructive actions, errors |
| `danger-soft` | `#FFE3E8` | Destructive backgrounds |
| `focus-ring` | `#FF7A9A` | Focus outline (= strawberry) |

### 1.3 Gradients (allowed — warm only, never blue/purple SaaS)
| Token | Definition | Usage |
|---|---|---|
| `grad-petal` | `linear-gradient(135deg,#FFE9EF 0%,#FFD6E0 50%,#FFE6D9 100%)` | Hero / invite backdrop |
| `grad-button` | `linear-gradient(180deg,#FF8FAA 0%,#FF7A9A 100%)` | Primary button fill |
| `grad-card-glow` | `radial-gradient(120% 120% at 50% 0%,#FFFDFB 0%,#FFF5F0 100%)` | Card inner glow |

> Lavender may tint backgrounds but **never** combine with blue. Lavender + pink only.

### 1.4 Contrast / accessibility
- Body text (`cherry #7A2233`) on `cream #FFF8F5` → AA pass for normal text.
- Never put `text-faint` on `cream` for body copy (captions only).
- Primary button: white text `#FFFFFF` on `strawberry` → check ≥ 4.5:1; if borderline,
  use `#FFFDFB` text and `strawberry-deep` fill.

---

## 2. Typography

### 2.1 Font families
| Role | Font | Fallback | Notes |
|---|---|---|---|
| Display / headings | **"Unbounded"** or **"Comfortaa"** (rounded, warm) | `system-ui` | Rounded, friendly, not childish. |
| Body / UI | **"Nunito"** (700/600/400) | `system-ui, sans-serif` | Soft, highly legible, supports Cyrillic. |
| Accent / handwritten (sparingly) | **"Caveat"** | cursive | ONLY for tiny romantic flourishes (signatures, "p.s."). Never body. |

> All fonts must include **Cyrillic** subsets (UI is Russian). Load via `next/font`
> with `subsets: ['cyrillic','latin']`. Handwritten font max 1–2 uses per screen.

### 2.2 Type scale (mobile-first; rem)
| Token | Size / line-height | Weight | Usage |
|---|---|---|---|
| `display` | 2.25rem / 1.15 | 700 | Invite step question, hero headline |
| `h1` | 1.75rem / 1.2 | 700 | Page titles |
| `h2` | 1.375rem / 1.25 | 700 | Section titles |
| `h3` | 1.125rem / 1.3 | 600 | Card titles |
| `body` | 1rem / 1.55 | 400 | Default text |
| `body-strong` | 1rem / 1.55 | 600 | Emphasis |
| `small` | 0.875rem / 1.5 | 400 | Captions, meta |
| `tiny` | 0.75rem / 1.4 | 600 | Badges, labels (uppercase off — keep soft) |

Desktop scale-up: `display` → 3rem, `h1` → 2.25rem (use responsive utilities).

### 2.3 Rules
- Letter-spacing: headings `-0.01em`; never use wide tracking ("L E T T E R S").
- No ALL-CAPS except 1-word badges, and even then prefer sentence case.
- Line length: cap body at ~`38ch` on the invite flow for intimacy.
- Numbers (response counts) use `body-strong`, color `strawberry`.

---

## 3. Spacing, Radius, Shadow, Motion

### 3.1 Spacing scale (Tailwind-aligned, 4px base)
`2 / 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96` (px) → `0.5,1,2,3,4,6,8,12,16,24` in Tailwind units.
- Default screen padding (mobile): `16px` sides, `24px` top/bottom.
- Invite flow uses **generous** vertical rhythm: `≥32px` between question and choices.
- Whitespace is a feature. When unsure, add more space.

### 3.2 Border radius
| Token | Value | Usage |
|---|---|---|
| `r-sm` | 10px | Chips, badges, small inputs |
| `r-md` | 16px | Inputs, small cards |
| `r-lg` | 24px | Buttons, choice cards |
| `r-xl` | 32px | Main cards, panels |
| `r-2xl` | 40px | Hero / invite container |
| `r-full` | 9999px | Pills, avatar, icon buttons |

> Everything interactive is **at least** `r-lg` (24px). No sharp corners anywhere.

### 3.3 Shadows (soft, tinted — never gray/black)
| Token | Value | Usage |
|---|---|---|
| `sh-sm` | `0 2px 8px rgba(255,122,154,0.12)` | Chips, hover lift |
| `sh-md` | `0 8px 24px rgba(255,122,154,0.16)` | Cards |
| `sh-lg` | `0 16px 40px rgba(255,122,154,0.20)` | Floating panels, modals |
| `sh-press` | `inset 0 2px 6px rgba(242,85,122,0.25)` | Pressed button |
| `sh-glow` | `0 0 0 4px rgba(255,182,199,0.45)` | Focus / selected card |

### 3.4 Motion (Framer Motion)
| Token | Spec |
|---|---|
| `ease-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutQuint feel) |
| `spring-soft` | `{ type: "spring", stiffness: 260, damping: 26 }` |
| `spring-bouncy` | `{ type: "spring", stiffness: 320, damping: 18 }` (cards, hearts) |
| `dur-fast` | 180ms |
| `dur-base` | 280ms |
| `dur-slow` | 480ms |

**Step transitions:** fade + slide (`y: 16 → 0`, opacity `0 → 1`) with `spring-soft`,
exit reversed. Stagger choice cards by `60ms`.
**Tap feedback:** `whileTap={{ scale: 0.96 }}` on all buttons/cards.
**Hover (desktop only):** lift `y:-2`, `sh-sm → sh-md`.
**Respect `prefers-reduced-motion`:** disable floating decorations + slides, keep
instant fades. This is mandatory.

---

## 4. Components — exact specs

### 4.1 CuteButton
Variants: `primary` · `secondary` · `ghost` · `danger`.
| Variant | Fill | Text | Border | Shadow |
|---|---|---|---|---|
| primary | `grad-button` | `#FFFDFB` | none | `sh-md`, press `sh-press` |
| secondary | `lavender` | `cherry` | none | `sh-sm` |
| ghost | transparent | `cherry-soft` | `1px border` | none |
| danger | `danger-soft` | `danger` | `1px danger` | none |

- Shape: `r-lg` (24px), padding `14px 24px`, `body-strong`.
- Min height **48px** (touch target). Full-width on mobile by default.
- States: hover (lift), active (`scale .96` + press shadow), disabled (60% opacity, no
  shadow, `cursor-not-allowed`), loading (spinner + keep label width, label → "…").
- Focus: `sh-glow` ring, never remove outline.
- Optional leading/trailing `lucide-react` icon at 18px.

### 4.2 ChoiceCard (the heart of the mini-game)
- Layout: large emoji (28px) on top or leading, label below/beside in `h3`.
- Default: `card` bg, `border` 1.5px, `r-lg`, padding `16px`, `sh-sm`.
- Hover: lift + `border-strong`.
- **Selected:** `pink-soft` bg, `border-strong` 2px, `sh-glow`, tiny ✓ heart badge
  top-right, emoji does a `spring-bouncy` pop.
- Multi-select (food): selected cards keep a visible count/checkmark; allow toggling.
- Grid: 2 columns mobile, 3–4 desktop, gap `12px`.
- Entire card is the tap target; role="button", keyboard-operable (Enter/Space).

### 4.3 FloatingDecorations
- Absolutely-positioned layer behind content, `pointer-events-none`, `aria-hidden`.
- Elements: hearts 💕, petals 🌸, sparkles ✨, dots — as **SVG**, not emoji, for crispness.
- Count: **6–10 max** per viewport. Sparse. Opacity `0.25–0.6`.
- Motion: slow vertical drift (12–24s loops), gentle rotation ±8°, subtle parallax.
- Colors: `pink-soft`, `blush`, `lavender`, `butter` only.
- Disabled entirely under `prefers-reduced-motion`.

### 4.4 Inputs / FormField
- `FormField` = label (`small`, `cherry-soft`) + control + helper/error line.
- Input: `card` bg, `border` 1.5px, `r-md`, padding `12px 16px`, `body`.
- Focus: `border-strong` + `sh-glow`, no blue browser ring.
- Error: `border danger`, helper text `danger`, gentle shake (≤1 cycle, reduced-motion off).
- Placeholders: `text-faint`, warm copy ("например, суши 🍣").
- Textarea: `r-md`, min-height 96px, soft inner padding.
- Date/time picker: custom-styled, never the raw browser blue control look.

### 4.5 Cards (content)
- `card` bg with `grad-card-glow` optional, `r-xl`, padding `24px`, `sh-md`.
- Optional 1px `border` for definition on `cream`.
- Never a bare white rectangle — always tinted + rounded + soft shadow.

### 4.6 Badges / Status pills
| Status | Bg | Text |
|---|---|---|
| draft | `cream-deep` | `text-muted` |
| active | `mint` | `success` |
| answered | `pink-soft` | `cherry` |
| expired | `danger-soft` | `danger` |
- Shape `r-full`, padding `4px 12px`, `tiny`, with a tiny dot or emoji.

### 4.7 States (must exist for every data view)
- **LoadingState:** centered cute spinner (a spinning heart/flower SVG) + soft line
  ("Секунду, готовим что-то милое… 🌸"). No skeleton-gray blocks; use blush shimmer.
- **EmptyState:** illustration/emoji + warm headline + CTA. e.g. dashboard empty:
  "Здесь пока пусто 🌸 Создай первое приглашение!"
- **ErrorState:** soft, non-alarming. "Ой, что-то пошло не так 🥺" + retry button.
  Never red error walls.

### 4.8 Modal (delete confirm, etc.)
- Backdrop: `rgba(122,34,51,0.35)` (cherry-tinted), blur 4px.
- Panel: `card`, `r-2xl`, `sh-lg`, padding `24px`, entrance `spring-soft` scale `0.94→1`.
- Destructive modals use `danger` button but keep warm tone in copy.

---

## 5. Page-level style

### 5.1 Public invite page (`/invite/[token]`) — the crown jewel
- Full-viewport `grad-petal` background + `FloatingDecorations`.
- One question per screen, vertically centered, max-width `~420px`.
- Cute avatar/image at top (rounded `r-full`, soft ring), then question, then choices.
- Progress: a soft dotted/heart progress indicator (not a corporate progress bar).
- Step transitions per §3.4. Back affordance is gentle ("← назад").
- The "нет" button (Step 1): smaller than "да", `ghost`/`secondary`, and on
  hover/tap it gently dodges within a bounded area and swaps to a funny line
  (see copy bank). After 2–3 dodges it can shrink but must remain non-blocking; "да"
  is always huge and obvious. Never trap the user.
- Success screen: confetti of petals (subtle), big warm message, optional "на главную".
- **This page must score 8/8 on the self-review. It is the most polished screen.**

### 5.2 Landing (`/`)
- Romantic, editorial — NOT a SaaS hero with three feature cards.
- Hero: handwritten-accent headline, a peek/mock of an invite, a single warm CTA
  ("Создать приглашение 💌"). Soft sections, plenty of whitespace, decorations.
- No pricing tables, no "trusted by", no stock gradients.

### 5.3 Auth pages (`/login`, `/register`)
- Same warm world; a single soft card floating on `grad-petal` with decorations.
- Friendly copy, big rounded inputs, primary CuteButton. Link between login/register.

### 5.4 Dashboard (`/dashboard/*`)
- Warm, cozy — NOT corporate. Soft top bar (no dense icon sidebar required on mobile).
- Greeting with name ("Привет, …! 💕"), gentle stats, grid of `InvitationCard`s.
- `InvitationCard`: girl name, status pill, response count (heart icon), created date,
  quick actions (copy link, open, ⋯ menu). Rounded, tinted, `sh-md`, hover lift.
- Detail page: invitation summary card + responses as `ResponseCard`s (cute summary,
  not a data table).
- Settings: simple stacked sections in soft cards; destructive zone clearly separated.

---

## 6. Iconography & imagery
- Icons: `lucide-react`, stroke 1.75, color inherits `cherry`/`cherry-soft`.
- Emojis: purposeful, **one per element** (button/card/heading). Decorations are the
  only place with multiple, and those are SVG, sparse.
- Avatars/images: always `r-full` or `r-xl` with a soft blush ring; provide a cute
  fallback (initial on `pink-soft`) when `avatar_url` is missing or broken.

---

## 7. Russian Copy Bank (tone: warm, playful, a little cheeky — never cringe)

### 7.1 Buttons / CTAs
- Создать приглашение 💌
- Скопировать ссылку
- Ссылка скопирована 💕
- Отправить ответ 💌
- да 💕 · нет 😭 · да, конечно
- Сохранить · Отмена · Удалить · Назад · Далее

### 7.2 Invite flow (steps)
- Step 1: «{имя}, пойдёшь со мной на свидание? 💌»
- Step 2: «Подожди... ты правда сказала да? 😳» → «да, конечно»
- Step 3: «Когда ты свободна? 🗓️» (helper: «можно выбрать несколько вариантов»)
- Step 4: «Что будем есть? 🍓» (helper: «выбирай сколько хочешь»)
- Step 5: «Куда пойдём? 🌸»
- Step 6: «Какой вайб свидания? ✨»
- Step 7: «Хочешь что-то добавить? 💭» (placeholder: «необязательно, но мне будет приятно…»)
- Step 8 (review): «Проверим, всё верно? 💕»
- Step 9 (success): «Ответ отправлен. Теперь он точно улыбается как дурак 😌💕»

### 7.3 Playful "нет" dodge lines (rotate)
- «уверена? 🥺»
- «подумай ещё разок 😳»
- «а если так? 💕»
- «кнопка убегает, судьба намекает 😌»
- «ну пожаааалуйста 🙈»

### 7.4 Dashboard / states
- Greeting: «Привет, {имя}! 💕»
- Empty: «Здесь пока пусто 🌸 Создай первое приглашение!»
- Waiting on response: «Она ещё не ответила — держимся 😤»
- Has response: «Ответ получен 💕»
- Loading: «Секунду, готовим что-то милое… 🌸»
- Error: «Ой, что-то пошло не так 🥺 Попробуем ещё раз?»
- Delete confirm: «Точно удалить это приглашение? Это навсегда 🥲»

### 7.5 Public edge states
- Unknown token: «Кажется, такого приглашения нет 🥺»
- Expired: «Это приглашение уже отдохнуло 🌙»
- Inactive: «Приглашение пока не активно»
- Already answered: «Ты уже ответила 💕»

### 7.6 Copy rules
- Lowercase, warm phrasing in the invite game ("да 💕") — it feels personal.
- Sentence case elsewhere. No exclamation spam (≤1 per line).
- Never use corporate words ("submit", "dashboard analytics", "engagement").
- Handwritten font reserved for signatures / "p.s." flourishes.

---

## 8. Responsiveness & Accessibility (non-negotiable)
- **Mobile-first**: design at 360–414px first; scale up with `sm/md/lg`.
- Touch targets ≥ 44×44px; choice cards comfortably tappable.
- All interactive elements keyboard-operable with visible `focus-ring`.
- Color is never the only signal (pair with icon/text/checkmark).
- `prefers-reduced-motion`: disable decorations & slides, keep instant fades.
- Forms: associated `<label>`s, `aria-invalid`, `aria-describedby` for errors.
- Live region (`aria-live="polite"`) announces step changes & submit success.
- Images have meaningful `alt`; decorations `aria-hidden`.

---

## 9. Tailwind / token mapping (for Step 8)
Define these as Tailwind theme extensions so components never hardcode hex:
```
colors: cream, cream-deep, card, pink-soft, blush, strawberry, strawberry-deep,
        cherry, cherry-soft, lavender, lavender-deep, mint, butter,
        border, border-strong, danger, danger-soft, success
borderRadius: sm=10 md=16 lg=24 xl=32 2xl=40 full
boxShadow: sm, md, lg, press, glow  (per §3.3)
fontFamily: display, body, accent
```
Expose the same as CSS variables on `:root` in `globals.css` for non-Tailwind usage.

---

## 10. Definition of Done for any UI screen
- [ ] Passes the 8-point self-review (esp. #1 = "no, not AI-generated").
- [ ] Uses only palette tokens (no stray hex, no blue/purple).
- [ ] Rounded everything (≥ `r-lg` interactive), soft tinted shadows only.
- [ ] Has loading / empty / error states where data is involved.
- [ ] Mobile-first verified at 375px and 414px.
- [ ] Keyboard + focus + reduced-motion verified.
- [ ] Russian copy pulled from / consistent with §7.
- [ ] Animations subtle, spring-based, ≤ specified durations.
- [ ] Decorations sparse (≤10), SVG, `aria-hidden`.
