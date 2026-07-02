import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return `Rs. ${new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0
  }).format(amount)}`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}
