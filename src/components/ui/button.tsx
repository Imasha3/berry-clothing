import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "dark";
}

export function buttonStyles(variant: ButtonProps["variant"] = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-200 disabled:pointer-events-none disabled:opacity-55",
    variant === "primary" &&
      "btn-premium hover:translate-y-[-2px] focus:outline-none focus:ring-4 focus:ring-berry-100",
    variant === "secondary" && "bg-white text-ink ring-1 ring-black/6 hover:translate-y-[-2px] hover:bg-berry-50",
    variant === "ghost" && "text-ink hover:bg-black/5",
    variant === "dark" && "bg-ink text-white hover:translate-y-[-2px] hover:bg-black/85",
    className
  );
}

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type={props.type ?? "button"}
      className={buttonStyles(variant, className)}
      {...props}
    >
      {children}
    </button>
  );
}
