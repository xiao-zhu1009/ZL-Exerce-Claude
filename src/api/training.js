// src/api/training.js
// 训练模块接口：训练记录增删查、训练计划增查、统计图表数据
// getWorkoutRecords   → GET    /training/records?start=&end=
// addWorkoutRecord    → POST   /training/records
// deleteWorkoutRecord → DELETE /training/records/{id}
// getTrainingPlans    → GET    /training/plans?status=
// addTrainingPlan     → POST   /training/plans
// getDailyStats       → GET    /training/stats?days=
// getTypeStats        → GET    /training/stats/type?days=

import request from '@/utils/request'

export function getWorkoutRecords(params = {}) {
  return request.get('/training/records', { params })
}

export function addWorkoutRecord(data) {
  return request.post('/training/records', data)
}

export function deleteWorkoutRecord(id) {
  return request.delete(`/training/records/${id}`)
}

export function getTrainingPlans(status) {
  return request.get('/training/plans', { params: status !== undefined ? { status } : {} })
}

export function addTrainingPlan(data) {
  return request.post('/training/plans', data)
}

// days: 近N天，默认7
export function getDailyStats(days = 7) {
  return request.get('/training/stats', { params: { days } })
}

// days: 近N天，默认30
export function getTypeStats(days = 30) {
  return request.get('/training/stats/type', { params: { days } })
}
