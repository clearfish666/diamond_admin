import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function verificationCodes(data) {
  return request({
    url: '/verification-codes',
    method: 'post',
    data
  })
}

export function imgCodes(data) {
  return request({
    url: '/img-codes',
    method: 'get',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'put'
  })
}

// 获取 菜单栏 Sidebar
export function getMenuNav() {
  return request.get('/nav')
}

// 获取导出数据
export function getDataOutputLogs(params) {
  return request.get('/data_output/logs', {
    params
  })
}

// 重试导出数据
export function retryDataOutputLog(id) {
  return request.put(`/data_output/retry/${id}`)
}

// 删除导出数据
export function deleteDataOutputLogs(id) {
  return request.delete(`/data_output/logs/${id}`)
}

// 上传文件
export default function uploadFile(file, config) {
  const params = new FormData()
  params.append('file', file)

  return request.post('/upload', params, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
