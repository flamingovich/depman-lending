export const MAX_LOGO_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_PERSON_UPLOAD_BYTES = 8 * 1024 * 1024;

export function formatMegabytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
