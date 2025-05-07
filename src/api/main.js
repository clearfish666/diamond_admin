import request from '@/utils/request'

// 获取验证码类型
export function getVerificationCodeType(params) {
  return request.get('/main/get-verification-code-type', {
    params
  })
}

// 获取单个配置
export function getSingleConfig(params) {
  return request.get('/main/get-single-config', {
    params
  })
}

// 获取币种类型
export function getCurrencyType() {
  return request.get('/main/get-currency-type')
}

// 获取钱包记录类型
export function getWalletLogType() {
  return request.get('/main/get-wallet-log-type')
}

// 获取订单支付状态
export function getOrderPayStatus() {
   // console.log('payStatusOptions')

  return request.get('/main/get-order-pay-status')
}

// 获取订单状态
export function getOrderStatus() {
   // console.log('getOrderStatus')

  return request.get('/main/get-order-status')
}

// 获取订单售后状态
export function getOrderRefundStatus() {
  return request.get('/main/get-order-refund-status')
}

// 获取会员等级
export function getUserLevel() {
  return request.get('/main/get-user-level')
}

// 广告位列表
export function posList(params) {
  return request.get('/ads/pos', {
    params
  })
}

// 获取分类
export function getCategory(params) {
  return request.get('/get-store-goods-category', {
    params
  })
}


// 根据分类获取场所
export function getCategoryGoods(params) {
   return request.get('/get-category-goods', {
     params
   })
}
 

// 获取时间
export function getTime(params) {
   return request.get('/get-time', {
     params
   })
 }