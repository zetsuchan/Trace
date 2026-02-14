"use client";

import { forwardRef, useEffect, useRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", onChange, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLTextAreaElement>) || innerRef;

    function autoResize() {
      const el = typeof ref === "object" && ref?.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }

    useEffect(() => {
      autoResize();
    });

    return (
      <textarea
        ref={ref}
        className={`w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none ${className}`}
        onChange={(e) => {
          onChange?.(e);
          autoResize();
        }}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
