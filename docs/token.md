# Token 鉴权完整流程文档

## 流程概览

```
用户输入账号密码
  → Login.vue 调用 api/auth.js login()
  → POST http://localhost:8003/ZL-API/auth/login
  → 后端验证，返回 { code:200, data:{ token, ... } }
  → store.dispatch('login') 调用 setToken()
  → js-cookie 将 token 写入 Cookie（有效期1天）
  → 后续所有请求经 request.js 拦截器读取 Cookie 中的 token
  → 注入请求头 Authorization: Bearer <token>
  → 后端 JWT 中间件校验通过，接口正常响应
```

---

## 涉及文件

| 文件 | 职责 |
|------|------|
| `src/views/auth/Login.vue` | 表单提交，登录成功后触发 store 存 token |
| `src/api/auth.js` | 封装登录接口请求 |
| `src/utils/auth.js` | token 的 Cookie 读写封装（js-cookie） |
| `src/utils/request.js` | axios 实例，请求拦截器自动注入 token |
| `src/store/index.js` | 登录/登出 action，调用 setToken/removeToken |

---

## 各文件代码

### src/api/auth.js

```js
import request from '../utils/request'

export function login(data) {
  return request.post('/auth/login', data)
}
```

请求地址：`POST http://localhost:8003/ZL-API/auth/login`

请求体：
```json
{ "username": "xxx", "password": "xxx" }
```

后端响应格式：
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": 1,
    "username": "user01",
    "role": "user",
    "nickname": "健身达人"
  }
}
```

---

### src/utils/auth.js

```js
import Cookies from 'js-cookie'

const TOKEN_KEY = 'zl_token'
const USER_KEY  = 'zl_user'

export function getToken()      { return Cookies.get(TOKEN_KEY) }
export function setToken(token) { Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: 'Strict' }) }
export function removeToken()   { Cookies.remove(TOKEN_KEY) }

export function getUser()       { const u = localStorage.getItem(USER_KEY); return u ? JSON.parse(u) : null }
export function setUser(user)   { localStorage.setItem(USER_KEY, JSON.stringify(user)) }
export function removeUser()    { localStorage.removeItem(USER_KEY) }
```

- token 存 Cookie，有效期 1 天，与后端 JWT 过期时间对齐
- user 信息（id/role/nickname）存 localStorage，非敏感数据

---

### src/utils/request.js

```js
import axios from 'axios'
import { getToken } from './auth'
import { Message } from 'element-ui'

const request = axios.create({
  baseURL: 'http://localhost:8003/ZL-API',
  timeout: 10000
})

// 请求拦截：从 Cookie 读取 token，注入 Authorization Header
request.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截：统一错误处理
request.interceptors.response.use(
  res => res.data,
  err => {
    const status = err.response?.status
    if (status === 401) {
      Message.error('登录已过期，请重新登录')
      window.location.href = '/login'
    } else if (status === 403) {
      Message.error('权限不足')
    } else {
      Message.error(err.response?.data?.msg || '服务器错误')
    }
    return Promise.reject(err)
  }
)

export default request
```

所有通过 `request` 发出的接口请求，都会自动携带：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

### src/views/auth/Login.vue（核心逻辑）

```js
const res = await login(this.form)          // POST /auth/login
const { token, ...user } = res.data
this.$store.dispatch('login', { token, user }) // setToken → 写入 Cookie
this.$router.push(roleMap[user.role] || '/')
```

---

### src/store/index.js（mutations）

```js
SET_TOKEN(state, token) { state.token = token; setToken(token) },  // 写入 Cookie
LOGOUT(state) {
  state.token = ''
  state.user = null
  removeToken()   // 清除 Cookie
  removeUser()
}
```

---

## 依赖安装

```bash
npm install js-cookie
```

---

## 注意事项

- Cookie `expires: 1` 表示 1 天，需与后端 JWT 签发的过期时间一致
- 后端只需从请求头读取 `Authorization: Bearer <token>` 做校验，无需处理 Cookie
- 登出时调用 `removeToken()` 即可清除 Cookie，下次请求不再携带 token
