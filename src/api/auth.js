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

// 忘记密码 - 发送验证码
export function forgotPasswordSendCode(data) {
  return request.post('/auth/forgot-password/send-code', data)
}

// 忘记密码 - 重置密码
export function forgotPasswordReset(data) {
  return request.post('/auth/forgot-password/reset', data)
}
