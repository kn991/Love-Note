"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

export interface CuteButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-grad-button text-card shadow-md hover:brightness-[1.03] active:shadow-press",
  secondary:
    "bg-lavender text-cherry shadow-sm hover:bg-lavender-deep active:shadow-press",
  ghost:
    "bg-transparent text-cherry-soft border border-border hover:bg-cream-deep",
  danger:
    "bg-danger-soft text-danger border border-danger hover:brightness-[0.98]",
};

const sizes: Record<Size, string> = {
  md: "min-h-[48px] px-5 py-3 text-sm",
  lg: "min-h-[52px] px-6 py-3.5 text-base",
};

export const CuteButton = forwardRef<HTMLButtonElement, CuteButtonProps>(
  function CuteButton(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        whileHover={isDisabled ? undefined : { y: -2 }}
        whileTap={isDisabled ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className={cn(
          "inline-flex select-none items-center justify-center gap-2 rounded-lg font-bold leading-none",
          "transition-colors duration-200 focus-visible:shadow-glow",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!loading && rightIcon}
      </motion.button>
    );
  },
);
