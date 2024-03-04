import request from '@/utils/request'

// 配置
export function getConfig(type) {
  return request.get('/configs?type=' + type)
}

// 修改配置
export function setConfig(data) {
  return request.put('/configs', {
    ...data
  })
}
