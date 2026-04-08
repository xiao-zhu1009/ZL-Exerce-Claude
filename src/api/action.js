// TODO: 对接后端时取消 request 注释，删除 mockResolve 返回
// import request from '../utils/request'
const mockResolve = data => Promise.resolve({ code: 200, msg: 'success', data })

const mockActions = [
  { id: 1, title: '哑铃卧推', body_part: '胸', category: '力量', difficulty: 2, cover_img: '', view_count: 320, description: '经典胸部力量训练动作', steps: ['平躺于凳上，双手握哑铃', '缓慢下放至胸侧', '发力推起至顶端'], cautions: '下放时不要过度拉伸肩关节', video_url: '' },
  { id: 2, title: '深蹲', body_part: '腿', category: '力量', difficulty: 2, cover_img: '', view_count: 580, description: '下肢力量之王', steps: ['站立，双脚与肩同宽', '屈膝下蹲至大腿平行地面', '蹬地站起'], cautions: '膝盖不要超过脚尖太多', video_url: '' },
  { id: 3, title: '引体向上', body_part: '背', category: '力量', difficulty: 3, cover_img: '', view_count: 410, description: '背部宽度训练核心动作', steps: ['双手正握单杠', '收紧背阔肌向上拉', '下巴过杆后缓慢下放'], cautions: '避免借助摆动惯性', video_url: '' },
  { id: 4, title: '平板支撑', body_part: '核心', category: '综合', difficulty: 1, cover_img: '', view_count: 260, description: '核心稳定性基础训练', steps: ['俯卧，前臂撑地', '保持身体一条直线', '坚持目标时间'], cautions: '不要塌腰或撅臀', video_url: '' },
  { id: 5, title: '跑步机有氧', body_part: '腿', category: '有氧', difficulty: 1, cover_img: '', view_count: 190, description: '基础有氧燃脂训练', steps: ['设置速度 6-8km/h', '保持正确跑姿', '持续 30-45 分钟'], cautions: '注意补水，心率控制在最大心率 60-70%', video_url: '' },
  { id: 6, title: '肩部拉伸', body_part: '肩', category: '拉伸', difficulty: 1, cover_img: '', view_count: 150, description: '训练后肩部放松', steps: ['一手横过胸前', '另一手辅助向身体方向拉', '保持 20-30 秒'], cautions: '感到疼痛立即停止', video_url: '' }
]

export function getActions(params = {}) {
  // TODO: return request.get('/actions', { params })
  let list = [...mockActions]
  if (params.body_part) list = list.filter(a => a.body_part === params.body_part)
  if (params.category) list = list.filter(a => a.category === params.category)
  if (params.difficulty) list = list.filter(a => a.difficulty === Number(params.difficulty))
  if (params.keyword) list = list.filter(a => a.title.includes(params.keyword))
  return mockResolve({ list, total: list.length })
}

export function getActionDetail(id) {
  // TODO: return request.get(`/actions/${id}`)
  return mockResolve(mockActions.find(a => a.id === Number(id)) || mockActions[0])
}

export function publishAction(data) {
  // TODO: return request.post('/actions', data)
  return mockResolve({ id: Date.now(), ...data, status: 0 })
}

export function getMyActions() {
  // TODO: return request.get('/actions/mine')
  return mockResolve(mockActions.slice(0, 3).map(a => ({ ...a, status: 1 })))
}
