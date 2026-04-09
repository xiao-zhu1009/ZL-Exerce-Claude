import request from '../../utils/request'

// 测试接口1：获取测试数据（需要JWT鉴权）
export function testGet() {
  return request.get('/test/hello')
}

// 测试接口2：提交测试数据（需要JWT鉴权）
export function testPost(data) {
  return request.post('/test/echo', data)
}
