export function resolveLogoUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("/uploads/logos/")) {
    const filename = url.split("/").pop();
    if (filename) return `/api/files/logos/${filename}`;
  }

  return url;
}
