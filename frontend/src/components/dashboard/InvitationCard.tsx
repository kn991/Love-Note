"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, Heart } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { forRecipient } from "@/lib/ru/name";
import type { InvitationListItem } from "@/lib/api/types";

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

export function InvitationCard({
  invite,
  index = 0,
}: {
  invite: InvitationListItem;
  index?: number;
}) {
  const reduce = useReducedMotion();
  const created = invite.created_at ? new Date(invite.created_at) : null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: reduce ? 0 : Math.min(index * 0.05, 0.3),
        ease: [0.22, 1, 0.36, 1],
        duration: 0.32,
      }}
    >
      <Link
        href={`/dashboard/${invite.id}`}
        className="group block rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md focus-visible:shadow-glow"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg text-cherry">
              {forRecipient(invite.girl_name)}
            </h3>
            {invite.title && (
              <p className="mt-0.5 truncate text-sm text-cherry-soft">
                {invite.title}
              </p>
            )}
          </div>
          <StatusBadge status={invite.status} className="shrink-0" />
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-cherry-faint">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-4 w-4" aria-hidden />
            {invite.response_count}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-4 w-4" aria-hidden />
            {invite.view_count}
          </span>
          {created && (
            <span className="ml-auto">{dateFmt.format(created)}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
