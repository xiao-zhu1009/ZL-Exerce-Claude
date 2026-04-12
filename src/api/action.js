// src/api/action.js
// 动作库接口：用户端只读、教练端投稿管理
// getActions           → GET    /actions                      用户端列表（筛选+分页）
// getActionDetail      → GET    /actions/{id}                 用户端详情（触发浏览数+1）
// uploadActionCover    → POST   /coach/actions/upload/cover   教练上传封面图，返回相对路径
// uploadActionVideo    → POST   /coach/actions/upload/video   教练上传视频，返回相对路径
// publishAction        → POST   /coach/actions                教练发布新动作
// getMyActions         → GET    /coach/actions                教练查自己的投稿
// updateMyAction       → PUT    /coach/actions/{id}           教练修改被驳回的动作
// deleteMyAction       → DELETE /coach/actions/{id}           教练删除待审核/已驳回的动作

import request from '@/utils/request'

export function getActions(params = {}) {
  return request.get('/actions', { params })
}

export function getActionDetail(id) {
  return request.get(`/actions/${id}`)
}

/**
 * 上传动作封面图。
 * 使用 FormData 发送，axios 拦截器会自动去掉 Content-Type 让浏览器带 multipart boundary。
 * 后端返回 { path: "action_covers/xxx.jpg" }，前端存入 form.cover_img。
 */
export function uploadActionCover(file) {
  const fd = new FormData()
  fd.append('file', file)  // 字段名必须是 'file'，与后端 UploadFile = File(...) 对应
  return request.post('/coach/actions/upload/cover', fd)
}

/**
 * 上传动作教学视频。
 * 视频文件较大，上传时间可能较长，调用方应显示进度条。
 * 后端返回 { path: "action_videos/xxx.mp4" }，前端存入 form.video_url。
 * onUploadProgress 回调可用于更新进度：config => { onUploadProgress: e => ... }
 */
export function uploadActionVideo(file, onProgress) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post('/coach/actions/upload/video', fd, {
    onUploadProgress: e => {
      // e.loaded / e.total 得到上传进度（0~1），乘以 100 转为百分比
      if (onProgress && e.total) onProgress(Math.round(e.loaded / e.total * 100))
    }
  })
}

export function publishAction(data) {
  return request.post('/coach/actions', data)
}

export function getMyActions() {
  return request.get('/coach/actions')
}

export function updateMyAction(id, data) {
  return request.put(`/coach/actions/${id}`, data)
}

export function deleteMyAction(id) {
  return request.delete(`/coach/actions/${id}`)
}
