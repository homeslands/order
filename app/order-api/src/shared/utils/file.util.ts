import { resolve } from 'path';
import { readFileSync } from 'fs';

export function fileToBase64(relativePath: string): string {
  const filePath = resolve(relativePath);
  const fileBuffer = readFileSync(filePath);
  return fileBuffer.toString('base64');
}

export function fileToBase64DataUri(
  relativePath: string,
  mimeType: string,
): string {
  const base64 = fileToBase64(relativePath);
  return `data:${mimeType};base64,${base64}`;
}
