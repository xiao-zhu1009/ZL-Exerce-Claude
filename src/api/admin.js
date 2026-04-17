import request from '@/utils/request'

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

// 获取文章列表，status: 0待审核 1已上线 2已驳回 3已下架，不传则返回全部
export function getAdminArticles(params = {}) {
  return request.get('/admin/diet/articles', { params })
}

// 获取单条文章完整详情（不限状态，供管理员预览）
export function getArticleDetail(id) {
  return request.get(`/admin/diet/articles/${id}/detail`)
}

// 审核文章：{ status: 1 } 通过 | { status: 2, reject_reason: '...' } 驳回
export function reviewArticle(id, data) {
  return request.put(`/admin/diet/articles/${id}/review`, data)
}

// 下架已上线文章
export function offlineArticle(id) {
  return request.put(`/admin/diet/articles/${id}/offline`)
}

export function getStatistics(granularity = 'day') {
  return request.get('/admin/statistics', { params: { granularity } })
}
