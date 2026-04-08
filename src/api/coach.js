// TODO: 对接后端时取消 request 注释，删除 mockResolve 返回
// import request from '../utils/request'
const mockResolve = data => Promise.resolve({ code: 200, msg: 'success', data })

const mockStudents = [
  { id: 1, nickname: '张三', goal: '减脂', weight: 80, bmi: 26.1, body_fat: 24, last_workout: '2026-04-07' },
  { id: 2, nickname: '李四', goal: '增肌', weight: 65, bmi: 21.3, body_fat: 15, last_workout: '2026-04-06' },
  { id: 3, nickname: '王五', goal: '塑形', weight: 70, bmi: 22.9, body_fat: 18, last_workout: '2026-04-05' }
]

export function getStudents() {
  // TODO: return request.get('/coach/students')
  return mockResolve(mockStudents)
}

export function getStudentDetail(id) {
  // TODO: return request.get(`/coach/students/${id}`)
  return mockResolve({
    ...mockStudents.find(s => s.id === Number(id)) || mockStudents[0],
    height: 175,
    workout_records: [
      { record_date: '2026-04-07', duration: 60, calories: 450 },
      { record_date: '2026-04-05', duration: 45, calories: 320 }
    ],
    current_plan: { title: '12周减脂计划', goal: '减脂', start_date: '2026-03-01', end_date: '2026-05-31' }
  })
}

export function createPlan(data) {
  // TODO: return request.post('/coach/plan', data)
  return mockResolve({ id: Date.now(), ...data })
}
