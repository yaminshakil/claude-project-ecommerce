const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api').replace('/api', '');

export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE}/storage/${path}`;
}
