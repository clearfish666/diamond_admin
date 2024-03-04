import Cookies from 'js-cookie'

export const QiniuUrl = 'https://up-z2.qiniup.com'

export const TokenKey = 'FY-Admin-Token'
export const QiniuKey = 'FY-Qiniu-Token'
export const DominKey = 'FY-Domin-Token'
export const AuthPermission = 'FY-Auth-Permission'

export function getToken(key = TokenKey) {
  return Cookies.get(key)
}

export function setToken(token, key = TokenKey) {
  return Cookies.set(key, token)
}

export function removeToken(key = TokenKey) {
  return Cookies.remove(key)
}
export function getBaseUrl() {
  let baseUrl = process.env.VUE_APP_BASE_API
  baseUrl = baseUrl.slice(0, -6)
  return baseUrl + 'storage/'
}
