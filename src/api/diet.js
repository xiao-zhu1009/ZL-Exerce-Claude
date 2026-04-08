// TODO: 对接后端时取消 request 注释，删除 mockResolve 返回
// import request from '../utils/request'
const mockResolve = data => Promise.resolve({ code: 200, msg: 'success', data })

const mockArticles = [
  { id: 1, title: '增肌期饮食全攻略', category: '增肌餐', cover_img: '', view_count: 520, created_at: '2026-03-10', content: '<p>增肌期需要保持热量盈余，蛋白质摄入建议每公斤体重 1.6-2.2g。</p><p>优质蛋白来源：鸡胸肉、鸡蛋、牛肉、乳清蛋白。</p>' },
  { id: 2, title: '减脂期如何控制饮食', category: '减脂餐', cover_img: '', view_count: 680, created_at: '2026-03-15', content: '<p>减脂期热量缺口建议控制在 300-500kcal/天，避免过度节食导致肌肉流失。</p>' },
  { id: 3, title: '运动前后吃什么最好', category: '均衡饮食', cover_img: '', view_count: 340, created_at: '2026-03-20', content: '<p>运动前 1-2 小时：复合碳水 + 少量蛋白质。运动后 30 分钟内：快速蛋白质 + 简单碳水。</p>' },
  { id: 4, title: '肌酸补剂使用指南', category: '补剂知识', cover_img: '', view_count: 290, created_at: '2026-04-01', content: '<p>肌酸是目前研究最充分的运动补剂之一，每日 3-5g 维持剂量即可。</p>' }
]

const mockFoods = [
  { id: 1, name: '鸡胸肉(100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 2, name: '米饭(100g)', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3 },
  { id: 3, name: '鸡蛋(1个)', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8 },
  { id: 4, name: '牛奶(200ml)', calories: 122, protein: 6.4, carbs: 9.6, fat: 6.4 },
  { id: 5, name: '香蕉(1根)', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  { id: 6, name: '燕麦(100g)', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 }
]

export function getDietArticles(params = {}) {
  // TODO: return request.get('/diet/articles', { params })
  let list = [...mockArticles]
  if (params.category) list = list.filter(a => a.category === params.category)
  if (params.keyword) list = list.filter(a => a.title.includes(params.keyword))
  return mockResolve({ list, total: list.length })
}

export function getDietArticleDetail(id) {
  // TODO: return request.get(`/diet/articles/${id}`)
  return mockResolve(mockArticles.find(a => a.id === Number(id)) || mockArticles[0])
}

export function searchFoods(keyword) {
  // TODO: return request.get('/diet/foods/search', { params: { keyword } })
  const list = mockFoods.filter(f => f.name.includes(keyword))
  return mockResolve(list)
}

export function getDietRecords(date) {
  // TODO: return request.get('/diet/records', { params: { date } })
  return mockResolve([
    { id: 1, meal_type: 1, food_name: '燕麦(100g)', amount: 100, calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, record_date: date },
    { id: 2, meal_type: 2, food_name: '鸡胸肉(100g)', amount: 150, calories: 248, protein: 46.5, carbs: 0, fat: 5.4, record_date: date },
    { id: 3, meal_type: 2, food_name: '米饭(100g)', amount: 200, calories: 232, protein: 5.2, carbs: 51.2, fat: 0.6, record_date: date }
  ])
}

export function addDietRecord(data) {
  // TODO: return request.post('/diet/records', data)
  return mockResolve({ id: Date.now(), ...data })
}

export function deleteDietRecord(id) {
  // TODO: return request.delete(`/diet/records/${id}`)
  return mockResolve(null)
}

export function publishArticle(data) {
  // TODO: return request.post('/diet/articles', data)
  return mockResolve({ id: Date.now(), ...data, status: 0 })
}

export function getMyArticles() {
  // TODO: return request.get('/diet/articles/mine')
  return mockResolve(mockArticles.slice(0, 2).map(a => ({ ...a, status: 1 })))
}
