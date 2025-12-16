import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
/**
 * A utility function to merge Tailwind CSS classes with clsx for conditional class names.
 * It provides a clean and type-safe way to manage styling.
 * @param inputs - A list of class values (strings, objects, arrays).
 * @returns A merged string of Tailwind CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Production-safe console logging. This function will only log messages
 * during development and will be a no-op in production builds.
 * @param {...any[]} args - Arguments to be logged to the console.
 */
export const noConsoleProd = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};