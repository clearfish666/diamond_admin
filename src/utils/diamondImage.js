export function diamondImageUrl(value) {
  if (!value) return ''
  let path = value
  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path)
    const match = url.pathname.match(/\/(assets|storage)\/(.*)$/)
    if (!match) return value
    path = match[1] + '/' + match[2] + url.search + url.hash
  }
  const apiBase = new URL(process.env.VUE_APP_BASE_API || '/admin', window.location.origin)
  apiBase.pathname = apiBase.pathname.replace(/\/admin\/?$/, '/')
  const base = new URL(process.env.VUE_APP_CDN_PREFIX || apiBase.href, window.location.origin)
  base.pathname = base.pathname.replace(/\/+$/, '') + '/'
  path = path.replace(/^\/+/, '')
  return new URL(/^(assets|storage)\//.test(path) ? path : 'storage/' + path, base).href
}
