import request from '@/utils/request'

// 钱包列表
export function getWalletList(params) {
  return request.get('/wallet', {
    params
  })
}

// 钱包记录列表
export function getWalletLogList(params) {
  return request.get('/wallet/logs', {
    params
  })
}

// 兑换列表
export function getExchangeLog(params) {
  return request.get('/wallet/exchange/logs', {
    params
  })
}

/**
 * 转仓列表
 */
export function getTransferLog(params) {
  return request.get('/wallet/transfer/logs', {
    params
  })
}

// 转仓 `通过`
export function agreeTransfer(id) {
  return request.put(`/wallet/transfer/agree/${id}`)
}

// 转仓 `驳回`
export function rejectTransfer(id) {
  return request.put(`/wallet/transfer/reject/${id}`)
}

// 导出
export function onExport(params) {
  return request.post('/wallet/logs/export', { ...params })
}

