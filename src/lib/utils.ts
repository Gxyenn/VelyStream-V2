import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanSlug(slug: string | null | undefined): string {
  if (!slug) {
    return "";
  }
  if (slug.includes('/') && slug.startsWith('http')) {
    const parts = slug.split('/').filter(part => part.length > 0);
    return parts[parts.length - 1] || "";
  }
  return slug;
}