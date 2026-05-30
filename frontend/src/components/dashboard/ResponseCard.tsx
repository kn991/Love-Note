"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ResponsePublic } from "@/lib/api/types";

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="shrink-0 text-cherry-faint">{label}</span>
      <span className="text-cherry">{value}</span>
    </div>
  );
}

export function ResponseCard({
  response,
  index = 0,
}: {
  response: ResponsePublic;
  index?: number;
}) {
  const reduce = useReducedMotion();
  const submitted = response.submitted_at
    ? new Date(response.submitted_at)
    : null;

  const when = [
    ...response.availability.slots,
    response.availability.text,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: reduce ? 0 : Math.min(index * 0.05, 0.3),
        ease: [0.22, 1, 0.36, 1],
        duration: 0.3,
      }}
      className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm"
    >
      <div className="flex flex-col gap-1.5">
        {when && <Row label="когда" value={when} />}
        {response.food_preference.length > 0 && (
          <Row label="еда" value={response.food_preference.join(", ")} />
        )}
        {response.place_preference && (
          <Row label="место" value={response.place_preference} />
        )}
        {response.vibe && <Row label="вайб" value={response.vibe} />}
      </div>

      {response.comment && (
        <p className="mt-3 text-balance font-accent text-2xl leading-snug text-strawberry">
          «{response.comment}»
        </p>
      )}

      {submitted && (
        <p className="mt-3 text-tiny text-cherry-faint">
          {dateFmt.format(submitted)}
        </p>
      )}
    </motion.li>
  );
}
