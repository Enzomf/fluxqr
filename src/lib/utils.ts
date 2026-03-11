import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScanCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString()
}
