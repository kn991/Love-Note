"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface CuteTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export const CuteTextarea = forwardRef<HTMLTextAreaElement, CuteTextareaProps>(
  function CuteTextarea(
    { label, helper, error, className, id, rows = 4, ...props },
    ref,
  ) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const describedBy = error
      ? `${fieldId}-error`
      : helper
        ? `${fieldId}-helper`
        : undefined;

    return (
      <div className={cn("w-full", error && "animate-shake")}>
        {label && (
          <label
            htmlFor={fieldId}
            className="mb-1.5 block text-sm font-semibold text-cherry-soft"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "min-h-[96px] w-full resize-y rounded-md border-[1.5px] bg-card px-4 py-3 text-base text-cherry",
            "placeholder:text-cherry-faint",
            "transition-colors duration-200 focus-visible:shadow-glow",
            error
              ? "border-danger focus-visible:border-danger"
              : "border-border focus-visible:border-border-strong",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-danger">
            {error}
          </p>
        ) : helper ? (
          <p id={`${fieldId}-helper`} className="mt-1.5 text-sm text-cherry-faint">
            {helper}
          </p>
        ) : null}
      </div>
    );
  },
);
