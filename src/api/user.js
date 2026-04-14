// src/api/user.js
// 用户端接口：个人信息、身体指标、修改密码、数据看板

import request from '@/utils/request'

export function getProfile() {
  return request.get('/user/profile')
}

export function updateProfile(data) {
  return request.put('/user/profile', data)
}

export function getBodyRecords() {
  return request.get('/user/body-stats')
}

export function addBodyRecord(data) {
  return request.post('/user/body-stats', data)
}

export function getDashboard() {
  return request.get('/user/dashboard')
}

