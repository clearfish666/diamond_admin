import request from '@/utils/request'

// 总数/总数
export function counts(params) {
  return request.get('/counts', {
    params
  })
}

// 用户统计
export function userCount(params) {
  return request.get('/statistical', {
    params
  })
}

