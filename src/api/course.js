// src/api/course.js
// 课程模块接口：用户端浏览预约、教练端课程管理与预约审批、管理员端审核
// getCourses              → GET    /courses                        用户端课程列表
// getCourseDetail         → GET    /courses/{id}                   课程详情
// reserveCourse           → POST   /courses/{id}/reserve           申请预约
// getMyReservations       → GET    /courses/my-reservations        我的预约列表
// cancelReservation       → DELETE /courses/reservations/{id}      取消预约
// uploadCourseCover       → POST   /coach/courses/upload/cover     教练上传封面
// publishCourse           → POST   /coach/courses                  教练发布课程
// getMyCourses            → GET    /coach/courses                  教练我的课程
// updateCourse            → PUT    /coach/courses/{id}             教练修改被驳回课程
// deleteCourse            → DELETE /coach/courses/{id}             教练删除课程
// getCourseReservations   → GET    /coach/courses/{id}/reservations 课程预约申请列表
// approveReservation      → PUT    /coach/courses/reservations/{id} 教练审批预约
// getAdminCourses         → GET    /admin/courses                  管理员课程列表
// getAdminCourseDetail    → GET    /admin/courses/{id}/detail      管理员课程详情
// reviewCourse            → PUT    /admin/courses/{id}/review      管理员审核
// offlineCourse           → PUT    /admin/courses/{id}/offline     管理员下架

import request from '@/utils/request'

// ── 用户端 ────────────────────────────────────────────────────────────────────

export function getCourses(params = {}) {
  return request.get('/courses', { params })
}

export function getCourseDetail(id) {
  return request.get(`/courses/${id}`)
}

export function reserveCourse(courseId) {
  return request.post(`/courses/${courseId}/reserve`)
}

export function getMyReservations() {
  return request.get('/courses/my-reservations')
}

export function cancelReservation(reservationId) {
  return request.delete(`/courses/reservations/${reservationId}`)
}

// ── 教练端 ────────────────────────────────────────────────────────────────────

export function uploadCourseCover(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post('/coach/courses/upload/cover', fd)
}

export function publishCourse(data) {
  return request.post('/coach/courses', data)
}

export function getMyCourses() {
  return request.get('/coach/courses')
}

export function updateCourse(id, data) {
  return request.put(`/coach/courses/${id}`, data)
}

export function deleteCourse(id) {
  return request.delete(`/coach/courses/${id}`)
}

export function getCourseReservations(courseId) {
  return request.get(`/coach/courses/${courseId}/reservations`)
}

// data: { status: 2 } 确认 | { status: 3, cancel_reason: '...' } 拒绝
export function approveReservation(reservationId, data) {
  return request.put(`/coach/courses/reservations/${reservationId}`, data)
}

// ── 管理员端 ──────────────────────────────────────────────────────────────────

export function getAdminCourses(params = {}) {
  return request.get('/admin/courses', { params })
}

export function getAdminCourseDetail(id) {
  return request.get(`/admin/courses/${id}/detail`)
}

// data: { status: 1 } 通过 | { status: 4, reject_reason: '...' } 驳回
export function reviewCourse(id, data) {
  return request.put(`/admin/courses/${id}/review`, data)
}

export function offlineCourse(id) {
  return request.put(`/admin/courses/${id}/offline`)
}
