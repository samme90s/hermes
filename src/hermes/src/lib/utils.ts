// This file contains utility functions used throughout the application.

// Import functions/types from class merging libraries.
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Merges multiple class name values into a single string.
// Handles conditional classes (via clsx) and resolves
// conflicting Tailwind CSS classes (via tailwind-merge).
// Input: Any number of class values (strings, arrays, objects).
// Output: A single optimized string of class names.
export const cn = (...inputs: ClassValue[]): string => {
    return twMerge(clsx(inputs))
}
