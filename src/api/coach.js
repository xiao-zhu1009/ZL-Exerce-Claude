// src/api/coach.js
// 教练端接口：学员管理、训练计划制定
// getStudents         → GET  /coach/students
// getStudentDetail    → GET  /coach/students/:id
// createPlan          → POST /coach/training/plans
// getStudentPlans     → GET  /coach/training/plans?student_id=

import request from '@/utils/request'

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
