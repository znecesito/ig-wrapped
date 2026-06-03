import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class strings (for new UI; shadcn-compatible). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
