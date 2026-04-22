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

// ── 学员端（教练制定） ─────────────────────────────────────
export function getDietPlans(status) {
  return request.get('/diet-plans', { params: status !== undefined && status !== null ? { status } : {} })
}

export function getDietPlanDetail(id) {
  return request.get(`/diet-plans/${id}`)
}

// ── 学员端（自拟计划） ─────────────────────────────────────
// 创建自拟饮食计划
export function createSelfDietPlan(data) {
  return request.post('/diet-plans/self', data)
}

// 获取自拟饮食计划列表
export function getSelfDietPlans(status) {
  return request.get('/diet-plans/self', { params: status !== undefined && status !== null ? { status } : {} })
}

// 更新自拟饮食计划状态（0=终止 2=完成）
export function updateSelfDietPlanStatus(planId, status) {
  return request.put(`/diet-plans/self/${planId}/status`, { status })
}
