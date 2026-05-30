"use client";

import { forwardRef, useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CuteInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const CuteInput = forwardRef<HTMLInputElement, CuteInputProps>(
  function CuteInput(
    { label, helper, error, leftIcon, className, id, ...props },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error
      ? `${inputId}-error`
      : helper
        ? `${inputId}-helper`
        : undefined;

    return (
      <div className={cn("w-full", error && "animate-shake")}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-semibold text-cherry-soft"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cherry-faint">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              "w-full rounded-md border-[1.5px] bg-card px-4 py-3 text-base text-cherry",
              "placeholder:text-cherry-faint",
              "transition-colors duration-200 focus-visible:shadow-glow",
              leftIcon && "pl-11",
              error
                ? "border-danger focus-visible:border-danger"
                : "border-border focus-visible:border-border-strong",
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger">
            {error}
          </p>
        ) : helper ? (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-cherry-faint"
          >
            {helper}
          </p>
        ) : null}
      </div>
    );
  },
);
