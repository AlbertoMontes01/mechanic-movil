// Only allow same-origin relative paths as a post-login redirect target —
// never an absolute/external URL (open-redirect protection).
export function safeReturnTo() {
  if (typeof window === 'undefined') return '/';
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('returnTo');
  if (!raw) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}
