import request from '@/utils/request'
const mockResolve = data => Promise.resolve({ code: 200, msg: 'success', data })

export function getAdminUsers(params = {}) {
  return request.get('/admin/users', { params })
}

export function toggleUserStatus(id, status) {
  return request.put(`/admin/users/${id}/status`, { status })
}

// 修改用户角色
export function changeUserRole(id, role) {
  return request.put(`/admin/users/${id}/role`, { role })
}

// 获取动作列表，status: 0待审核 1已上线 2已驳回 3已下架，不传则返回全部
export function getAdminActions(params = {}) {
  return request.get('/admin/actions', { params })
}

// 获取单条动作完整详情（含 cover_img/video_url/steps/cautions），供管理员预览用
// 复用用户端详情接口，待审核动作 status!=1 会返回 404，需后端放行（见下方说明）
export function getActionDetail(id) {
  return request.get(`/admin/actions/${id}/detail`)
}

export function reviewAction(id, data) {
  // data: { status: 1 } 通过 | { status: 2, reject_reason: '...' } 驳回
  return request.put(`/admin/actions/${id}/review`, data)
}

export function offlineAction(id) {
  return request.put(`/admin/actions/${id}/offline`)
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
