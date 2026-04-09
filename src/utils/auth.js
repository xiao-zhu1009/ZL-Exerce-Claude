// Token / 用户信息存取工具
import Cookies from 'js-cookie'

const TOKEN_KEY = 'zl_token'
const USER_KEY  = 'zl_user'

export function getToken()        { return Cookies.get(TOKEN_KEY) }
export function setToken(token)   { Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: 'Strict' }) }
export function removeToken()     { Cookies.remove(TOKEN_KEY) }

export function getUser() {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}
export function setUser(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)) }
export function removeUser() { localStorage.removeItem(USER_KEY) }
