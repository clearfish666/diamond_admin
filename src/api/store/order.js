import request from '@/utils/request'

// 订单列表
export function getOrderList(params) {
  return request.get('/reserve/order', {
    params
  })
}

// 订单列表
export function getOrderDetailedList(order_id) {
  return request.get(`/reserve/order/detailed/${order_id}`)
}



/**
 * 关闭订单`
 */
export function close({ id, reason }) {
  return request.post(`/reserve/order/cancel/${id}`, {
    reason
  })
}

// 售后记录
export function getRefundLogList(params) {
  return request.get('/reserve/order/refund/logs', {
    params
  })
}

// 通过
export function agree(id, params) {
  return request.put(`/reserve/order/agree/${id}`, {
    params
  })
}

// 通过
export function reject(id, params) {
  return request.put(`/reserve/order/reject/${id}`, {
    params
  })
}


//充值订单
export function getRechargeOrderList(params) {
   return request.get('/reserve/recharge', {
     params
   })
}
 

// 导出
export function onExport(params) {
  return request.post('/reserve/order/export', { ...params })
}



// 导出
export function onRechargeExport(params) {
  return request.post('/reserve/recharge/export', { ...params })
}
