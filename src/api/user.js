// TODO: 对接后端时取消 request 注释，删除 mockResolve 返回
// import request from '../utils/request'
const mockResolve = data => Promise.resolve({ code: 200, msg: 'success', data })

export function getProfile() {
  // TODO: return request.get('/user/profile')
  return mockResolve({ id: 1, nickname: '健身达人', phone: '138****8888', goal: '减脂', avatar: '' })
}

export function updateProfile(data) {
  // TODO: return request.put('/user/profile', data)
  return mockResolve(data)
}

export function getBodyRecords() {
  // TODO: return request.get('/user/body-records')
  return mockResolve([
    { id: 1, record_date: '2026-03-01', height: 175, weight: 78, bmi: 25.5, body_fat: 22 },
    { id: 2, record_date: '2026-03-15', height: 175, weight: 76, bmi: 24.8, body_fat: 21 },
    { id: 3, record_date: '2026-04-01', height: 175, weight: 74, bmi: 24.2, body_fat: 20 }
  ])
}

export function addBodyRecord(data) {
  // TODO: return request.post('/user/body-record', data)
  return mockResolve({ id: Date.now(), ...data })
}

export function getDashboard() {
  // TODO: return request.get('/user/dashboard')
  return mockResolve({
    workout_count_week: 4,
    calories_burned_week: 1800,
    calories_intake_today: 2100,
    body_records: [
      { record_date: '03-01', weight: 78 },
      { record_date: '03-15', weight: 76 },
      { record_date: '04-01', weight: 74 }
    ]
  })
}
