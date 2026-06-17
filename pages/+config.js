import vikeReact from 'vike-react/config'

export default {
  extends: vikeReact,
  prerender: true,
  clientRouting: true,

  meta: {
    keywords: {
      env: { server: true, client: true }
    },
    metaDescription: {
      env: { server: true, client: true }
    }
  }
}