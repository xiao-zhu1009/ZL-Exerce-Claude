import request from '../utils/request'

export function login(data) {
  return request.post('/auth/login', data)
}

export function register(data) {
  // TODO: return request.post('/auth/register', data)
  return mockResolve({ id: 99, ...data, role: 'user' })
}
