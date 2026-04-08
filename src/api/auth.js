// TODO: 对接后端时取消 request 注释，删除 mockResolve 返回
// import request from '../utils/request'
const mockResolve = data => Promise.resolve({ code: 200, msg: 'success', data })

export function login(data) {
  // TODO: return request.post('/auth/login', data)
  const mockUsers = {
    user01:  { id: 1, username: 'user01',  role: 'user',  nickname: '健身达人', token: 'mock-user-token' },
    coach01: { id: 2, username: 'coach01', role: 'coach', nickname: '王教练',   token: 'mock-coach-token' },
    admin:   { id: 3, username: 'admin',   role: 'admin', nickname: '超级管理员', token: 'mock-admin-token' }
  }
  const u = mockUsers[data.username]
  if (!u || data.password !== '123456') return Promise.reject({ response: { data: { msg: '用户名或密码错误' } } })
  return mockResolve(u)
}

export function register(data) {
  // TODO: return request.post('/auth/register', data)
  return mockResolve({ id: 99, ...data, role: 'user' })
}
