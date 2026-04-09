import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatImageURL(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.includes('picsum.photos')) return path;
  
  // Use root URL because /uploads is served at the root
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/api/v1')[0] : 'http://localhost:8080';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
