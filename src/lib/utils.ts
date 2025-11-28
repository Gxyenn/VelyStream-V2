import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cleanSlug = (slug: string): string => {
  if (!slug) return '';
  try {
    if (slug.startsWith('http')) {
      const url = new URL(slug);
      const pathParts = url.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || '';
    }
    return slug;
  } catch (error) {
    console.error("Invalid slug format:", slug);
    return slug;
  }
};
