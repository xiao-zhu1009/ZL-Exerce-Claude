import axios from 'axios'
import { getToken, removeToken } from './auth'
import { Message } from 'element-ui'
import router from '../router'

// TODO: 对接后端时修改 baseURL 为实际地址
const request = axios.create({
  baseURL: 'http://localhost:8008/api',
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
    if (err.response?.status === 401 && getToken()) {
      Message.error('登录已过期，请重新登录')
      removeToken()
      router.push('/login')
    }
    return Promise.reject(err)
  }
)

export default request
