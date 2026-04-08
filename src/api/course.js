// TODO: 对接后端时取消 request 注释，删除 mockResolve 返回
// import request from '../utils/request'
const mockResolve = data => Promise.resolve({ code: 200, msg: 'success', data })

const mockCourses = [
  { id: 1, title: '燃脂塑形课', category: '有氧', difficulty: 2, max_people: 10, enrolled: 7, price: 99, start_time: '2026-04-10 09:00', coach_name: '王教练', status: 1 },
  { id: 2, title: '力量基础课', category: '力量', difficulty: 1, max_people: 8, enrolled: 8, price: 120, start_time: '2026-04-11 14:00', coach_name: '王教练', status: 1 },
  { id: 3, title: '瑜伽放松课', category: '瑜伽', difficulty: 1, max_people: 12, enrolled: 5, price: 80, start_time: '2026-04-12 10:00', coach_name: '李教练', status: 1 }
]

export function getCourses(params = {}) {
  // TODO: return request.get('/courses', { params })
  return mockResolve({ list: mockCourses, total: mockCourses.length })
}

export function reserveCourse(courseId) {
  // TODO: return request.post('/reservations', { course_id: courseId })
  return mockResolve({ id: Date.now(), course_id: courseId, status: 0 })
}

export function cancelReservation(id) {
  // TODO: return request.delete(`/reservations/${id}`)
  return mockResolve(null)
}

export function getMyReservations() {
  // TODO: return request.get('/reservations/mine')
  return mockResolve([{ ...mockCourses[0], reservation_id: 1, status: 1 }])
}

export function publishCourse(data) {
  // TODO: return request.post('/courses', data)
  return mockResolve({ id: Date.now(), ...data, enrolled: 0 })
}

export function updateCourse(id, data) {
  // TODO: return request.put(`/courses/${id}`, data)
  return mockResolve({ id, ...data })
}

export function toggleCourseStatus(id, status) {
  // TODO: return request.put(`/courses/${id}/status`, { status })
  return mockResolve(null)
}

export function getMyCourses() {
  // TODO: return request.get('/courses/mine')
  return mockResolve(mockCourses.slice(0, 2))
}
