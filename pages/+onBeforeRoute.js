import { redirect } from 'vike/abort'

export function onBeforeRoute(pageContext) {
  const { urlPathname } = pageContext;

  if (urlPathname !== '/' && urlPathname.endsWith('/')) {
    throw redirect(urlPathname.slice(0, -1))
  }
}