export function generateFileName(extension: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
  return `${timestamp}.${extension.replace(".", "")}`;
}
