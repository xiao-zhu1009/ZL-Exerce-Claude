import request from '@/utils/request'

// 登录
export function login(data) {
  return request.post('/auth/login', data)
}

// 发送验证码
export function sendCode(data) {
  return request.post('/auth/send-code', data)
}

// 验证验证码
export function verifyCode(data) {
  return request.post('/auth/verify-code', data)
}

// 注册
export function register(data) {
  return request.post('/auth/register', data)
}
