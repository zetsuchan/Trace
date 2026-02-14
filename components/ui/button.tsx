"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
};

export function Button({
  className = "",
  variant = "primary",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-chain-active/50 focus:ring-offset-2 focus:ring-offset-bg-deep disabled:pointer-events-none disabled:opacity-40";

  const variants = {
    primary: "bg-chain-active text-bg-deep hover:bg-chain-active/90",
    secondary:
      "bg-bg-elevated text-text-primary shadow-[0_0_0_1px_rgba(245,240,235,0.1)] hover:bg-bg-surface",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
    outline:
      "border border-text-secondary/30 text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", visualDuration: 0.15, bounce: 0 }}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
