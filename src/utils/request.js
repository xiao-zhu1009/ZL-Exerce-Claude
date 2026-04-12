import axios from 'axios'
import { getToken, removeToken } from './auth'
import { Message } from 'element-ui'
import router from '@/router'

// 局域网/手机调试时请在 .env.development 设置 VUE_APP_API_BASE（需带 /api），并重启 npm run serve
const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api',
  timeout: 60000
})

// 请求拦截：注入 Token；FormData 必须删掉 Content-Type，让浏览器自动带 multipart boundary
request.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
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
