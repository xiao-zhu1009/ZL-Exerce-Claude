// src/api/coach.js
// 教练端接口：学员管理、训练计划制定、绑定申请处理

import request from '@/utils/request'

// ── 学员管理 ──────────────────────────────────────────────
export function getStudents() {
  return request.get('/coach/students')
}

export function getStudentDetail(id) {
  return request.get(`/coach/students/${id}`)
}

export function createPlan(data) {
  return request.post('/coach/training/plans', data)
}

export function getStudentPlans(studentId) {
  return request.get('/coach/training/plans', { params: { student_id: studentId } })
}

// ── 教练主页 ──────────────────────────────────────────────
// 获取教练自己的完整主页信息
export function getCoachProfile() {
  return request.get('/coach/profile')
}

// 修改教练主页信息
export function updateCoachProfile(data) {
  return request.put('/coach/profile', data)
}

// 修改密码
export function changeCoachPassword(data) {
  return request.put('/coach/profile/password', data)
}

// 上传头像
export function uploadCoachAvatar(formData) {
  return request.post('/coach/profile/avatar', formData)
}

// 用户端：查看某教练公开主页
export function getCoachPublicProfile(coachId) {
  return request.get(`/coaches/${coachId}`)
}
// 查询收到的绑定申请列表，status 可选：pending/active/rejected/ended
export function getBindRequests(status) {
  return request.get('/coach/bind-requests', { params: status ? { status } : {} })
}

// 同意绑定申请
export function approveBindRequest(bindId) {
  return request.post(`/coach/bind-requests/${bindId}/approve`)
}

// 拒绝绑定申请
export function rejectBindRequest(bindId, rejectReason) {
  return request.post(`/coach/bind-requests/${bindId}/reject`, { reject_reason: rejectReason })
}

// 教练主动解绑学员
export function coachEndBind(bindId) {
  return request.delete(`/coach/bind-requests/${bindId}/end`)
}
