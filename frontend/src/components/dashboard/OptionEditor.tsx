"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { InviteOption } from "@/lib/api/types";

export interface OptionEditorProps {
  label: string;
  helper?: string;
  value: InviteOption[];
  onChange: (next: InviteOption[]) => void;
  placeholder?: string;
  max?: number;
}

/** A cute chip editor for an option list (emoji + label). Leave empty to use
 * the server's default options. */
export function OptionEditor({
  label,
  helper,
  value,
  onChange,
  placeholder = "Пицца",
  max = 12,
}: OptionEditorProps) {
  const reduce = useReducedMotion();
  const [emoji, setEmoji] = useState("");
  const [text, setText] = useState("");

  const full = value.length >= max;

  function add() {
    const trimmed = text.trim();
    if (!trimmed || full) return;
    onChange([...value, { emoji: emoji.trim().slice(0, 8), label: trimmed.slice(0, 40) }]);
    setEmoji("");
    setText("");
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-semibold text-cherry-soft">
        {label}
      </label>

      {value.length > 0 && (
        <ul className="mb-2.5 flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {value.map((opt, i) => (
              <motion.li
                key={`${opt.label}-${i}`}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-pink-soft/50 py-1 pl-3 pr-1.5 text-sm text-cherry"
              >
                <span>
                  {opt.emoji} {opt.label}
                </span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Убрать ${opt.label}`}
                  className="grid h-5 w-5 place-items-center rounded-full text-cherry-faint transition-colors hover:bg-card hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {!full && (
        <div className="flex items-center gap-2">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🍕"
            aria-label="Эмодзи"
            maxLength={8}
            className="w-14 rounded-md border-[1.5px] border-border bg-card px-2 py-2.5 text-center text-base focus-visible:border-border-strong focus-visible:shadow-glow"
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder}
            aria-label={`${label} — название`}
            maxLength={40}
            className="min-w-0 flex-1 rounded-md border-[1.5px] border-border bg-card px-3 py-2.5 text-base text-cherry placeholder:text-cherry-faint focus-visible:border-border-strong focus-visible:shadow-glow"
          />
          <button
            type="button"
            onClick={add}
            disabled={!text.trim()}
            aria-label="Добавить вариант"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-lavender text-cherry transition-colors hover:bg-lavender-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      {helper && (
        <p className="mt-1.5 text-sm text-cherry-faint">{helper}</p>
      )}
    </div>
  );
}
