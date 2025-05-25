import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertTTFToBase64(fontFile: string): string {
  // If the font file is already a base64 string, return it
  if (fontFile.startsWith('data:font/ttf;base64,')) {
    return fontFile.split(',')[1]
  }

  // If the font file is a URL or path, it should be handled by Vite's asset handling
  // and will be converted to base64 during build
  return fontFile
}
