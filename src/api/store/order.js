import request from '@/utils/request'

// 订单列表
export function getOrderList(params) {
  return request.get('/store/order', {
    params
  })
}

// 订单列表
export function getOrderDetailedList(order_id) {
  return request.get(`/store/order/detailed/${order_id}`)
}

// 订单发货
export function ship({
  order_id,
  express_no
}) {
  return request.post(`/store/order/ship/${order_id}`, {
    express_no: express_no
  })
}

// 查看物流
export function logistics(order_id, params) {
  return request.get(`/store/order/ship/${order_id}`, {
    params
  })
}

/**
 * 关闭订单`
 */
export function close({ id, reason }) {
  return request.post(`/store/order/cancel/${id}`, {
    reason
  })
}

// 售后记录
export function getRefundLogList(params) {
  return request.get('/store/order/refund/logs', {
    params
  })
}

// 通过
export function agree(id, params) {
  return request.put(`/store/order/agree/${id}`, {
    params
  })
}

// 通过
export function reject(id, params) {
  return request.put(`/store/order/reject/${id}`, {
    params
  })
}
