import request from '@/utils/request'

// 会员列表
export function getVipList(params) {
  return request.get('/vip/users', {
    params
  })
}

// 激活
export function activation(id) {
  return request.put(`/vip/activation/${id}`)
}

// 修改等级
export function change({ id, ...params }) {
  return request.put(`/vip/level-change/${id}`, { ...params })
}

// 权益列表
export function getEquityList(params) {
  return request.get('/vip/equity', {
    params
  })
}

// 订单列表
export function getOrderList(params) {
  return request.get('/vip/order', {
    params
  })
}

// 通过
export function agree(id) {
  return request.put(`/vip/order/agree/${id}`)
}

// 通过
export function reject(id) {
  return request.put(`/vip/order/reject/${id}`)
}
