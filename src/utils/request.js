import axios from 'axios'
import { getToken } from './auth'
import { Message } from 'element-ui'

// TODO: 对接后端时修改 baseURL 为实际地址，如 http://localhost:8000
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截：注入 Token
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
