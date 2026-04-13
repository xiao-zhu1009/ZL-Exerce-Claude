// src/api/dietPlan.js
// 饮食计划接口

import request from '@/utils/request'

// ── 教练端 ────────────────────────────────────────────────
export function coachCreateDietPlan(data) {
  return request.post('/coach/diet-plans', data)
}

export function coachGetDietPlans(studentId) {
  return request.get('/coach/diet-plans', { params: { student_id: studentId } })
}

export function coachUpdateDietPlanStatus(planId, status) {
  return request.put(`/coach/diet-plans/${planId}/status`, { status })
}

// ── 学员端 ────────────────────────────────────────────────
export function getDietPlans(status) {
  return request.get('/diet-plans', { params: status !== undefined && status !== null ? { status } : {} })
}

export function getDietPlanDetail(id) {
  return request.get(`/diet-plans/${id}`)
}
