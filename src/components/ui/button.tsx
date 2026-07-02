import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "dark";
}

export function buttonStyles(variant: ButtonProps["variant"] = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-55",
    variant === "primary" &&
      "bg-berry-500 text-white shadow-[0_14px_28px_rgba(243,64,120,0.24)] hover:-translate-y-0.5 hover:bg-berry-600 focus:outline-none focus:ring-2 focus:ring-berry-200",
    variant === "secondary" && "bg-white text-ink ring-1 ring-black/10 hover:-translate-y-0.5 hover:bg-berry-50",
    variant === "ghost" && "text-ink hover:bg-black/5",
    variant === "dark" && "bg-ink text-white hover:-translate-y-0.5 hover:bg-black/85",
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
