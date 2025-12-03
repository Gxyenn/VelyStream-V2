import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Cleans a slug by removing trailing slashes and extracting the last path segment from a full URL.
 * @param s The slug or URL to clean.
 * @returns The cleaned slug.
 */
export function cleanSlug(s: string | undefined): string {
  if (!s) return '';

  let slug = s;

  // If it's a full URL, take the last part of the path
  if (slug.startsWith('http')) {
    try {
      const url = new URL(slug);
      // Split pathname and filter out empty strings from trailing/leading slashes
      const pathParts = url.pathname.split('/').filter(Boolean);
      slug = pathParts[pathParts.length - 1] || '';
    } catch (error) {
      console.error("Invalid URL format in cleanSlug:", s);
      // Fallback to original string if URL parsing fails
      slug = s;
    }
  }
  
  // Remove any trailing slash
  if (slug.endsWith('/')) {
    return slug.slice(0, -1);
  }

  return slug;
}
