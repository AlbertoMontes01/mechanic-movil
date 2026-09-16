// Only allow same-origin relative paths as a post-login redirect target —
// never an absolute/external URL (open-redirect protection). Resolving
// through the URL parser (rather than just checking for a leading "//")
// also catches browser-normalized bypasses like a leading backslash
// ("/\evil.com", which parses the same as "//evil.com").
export function safeReturnTo() {
  if (typeof window === 'undefined') return '/';
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('returnTo');
  if (!raw || !raw.startsWith('/')) return '/';
  try {
    const resolved = new URL(raw, window.location.origin);
    if (resolved.origin !== window.location.origin) return '/';
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return '/';
  }
}
