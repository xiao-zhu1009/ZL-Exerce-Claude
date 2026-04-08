// TODO: 对接后端时取消 request 注释，删除 mockResolve 返回
// import request from '../utils/request'
const mockResolve = data => Promise.resolve({ code: 200, msg: 'success', data })

export function getAdminUsers(params = {}) {
  // TODO: return request.get('/admin/users', { params })
  return mockResolve({
    list: [
      { id: 1, username: 'user01', nickname: '健身达人', role: 'user', status: 1, created_at: '2026-01-10' },
      { id: 2, username: 'coach01', nickname: '王教练', role: 'coach', status: 1, created_at: '2026-01-05' },
      { id: 3, username: 'user02', nickname: '运动小白', role: 'user', status: 0, created_at: '2026-02-20' }
    ],
    total: 3
  })
}

export function toggleUserStatus(id, status) {
  // TODO: return request.put(`/admin/users/${id}/status`, { status })
  return mockResolve(null)
}

export function changeUserRole(id, role) {
  // TODO: return request.put(`/admin/users/${id}/role`, { role })
  return mockResolve(null)
}

export function getPendingActions() {
  // TODO: return request.get('/admin/actions/pending')
  return mockResolve([
    { id: 10, title: '俯卧撑进阶版', body_part: '胸', category: '力量', difficulty: 2, author_name: '王教练', created_at: '2026-04-07', status: 0 },
    { id: 11, title: '弹力带侧平举', body_part: '肩', category: '力量', difficulty: 1, author_name: '李教练', created_at: '2026-04-06', status: 0 }
  ])
}

export function reviewAction(id, data) {
  // TODO: return request.put(`/admin/actions/${id}/review`, data)
  return mockResolve(null)
}

export function getPendingArticles() {
  // TODO: return request.get('/admin/diet/pending')
  return mockResolve([
    { id: 20, title: '备赛期饮食方案', category: '增肌餐', author_name: '王教练', created_at: '2026-04-07', status: 0 },
    { id: 21, title: '低碳饮食入门', category: '减脂餐', author_name: '李教练', created_at: '2026-04-06', status: 0 }
  ])
}

export function reviewArticle(id, data) {
  // TODO: return request.put(`/admin/diet/${id}/review`, data)
  return mockResolve(null)
}

export function getStatistics() {
  // TODO: return request.get('/admin/statistics')
  return mockResolve({
    total_users: 1280,
    active_users: 430,
    total_actions: 86,
    total_articles: 54,
    total_courses: 32,
    total_reservations: 218,
    user_growth: [
      { month: '11月', count: 80 }, { month: '12月', count: 120 },
      { month: '1月', count: 200 }, { month: '2月', count: 280 },
      { month: '3月', count: 380 }, { month: '4月', count: 430 }
    ]
  })
}
