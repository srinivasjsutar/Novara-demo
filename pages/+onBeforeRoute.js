// pages/+onBeforeRoute.js
import { redirect } from 'vike/abort'

export function onBeforeRoute(pageContext) {
  // Canonicalize trailing slashes (e.g. /blog/ -> /blog), but ONLY on the
  // server. This hook also runs in the browser, and on a static host (Render,
  // Vercel) pages are served with a trailing slash — so redirecting here on the
  // client intercepts hydration and leaves the page as dead, non-interactive
  // HTML (which is why the Sign In button did nothing). Guarding to the server
  // keeps canonical URLs for crawlers without breaking client-side hydration.
  if (typeof window !== 'undefined') return

  const { urlPathname } = pageContext
  if (urlPathname !== '/' && urlPathname.endsWith('/')) {
    throw redirect(urlPathname.slice(0, -1))
  }
}