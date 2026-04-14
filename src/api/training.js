// src/api/training.js
// 训练模块接口：身体记录增删改查、训练记录增删改查、训练计划增查、统计图表数据
// getBodyRecords       → GET    /training/body-records?days=
// addBodyRecord        → POST   /training/body-records
// updateBodyRecord     → PUT    /training/body-records/{id}
// deleteBodyRecord     → DELETE /training/body-records/{id}
// getWorkoutRecords    → GET    /training/records?start=&end=
// addWorkoutRecord     → POST   /training/records
// updateWorkoutRecord  → PUT    /training/records/{id}
// deleteWorkoutRecord  → DELETE /training/records/{id}
// getTrainingPlans     → GET    /training/plans?status=
// addTrainingPlan      → POST   /training/plans
// getDailyStats        → GET    /training/stats?days=
// getTypeStats         → GET    /training/stats/type?days=

import request from '@/utils/request'

export function getBodyRecords(days = 90) {
  return request.get('/training/body-records', { params: { days } })
}

export function getLatestBodyRecord() {
  return request.get('/training/body-records/latest')
}

export function addBodyRecord(data) {
  return request.post('/training/body-records', data)
}

export function updateBodyRecord(id, data) {
  return request.put(`/training/body-records/${id}`, data)
}

export function deleteBodyRecord(id) {
  return request.delete(`/training/body-records/${id}`)
}

export function getWorkoutRecords(params = {}) {
  return request.get('/training/records', { params })
}

export function addWorkoutRecord(data) {
  return request.post('/training/records', data)
}

export function updateWorkoutRecord(id, data) {
  return request.put(`/training/records/${id}`, data)
}

export function deleteWorkoutRecord(id) {
  return request.delete(`/training/records/${id}`)
}

export function getTrainingPlans(status) {
  return request.get('/training/plans', { params: status !== undefined && status !== null ? { status } : {} })
}

export function getTrainingPlanDetail(id) {
  return request.get(`/training/plans/${id}`)
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
