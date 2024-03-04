import request from '@/utils/request'

// 获取充值统计
export function getRechargeHome() {
  return request.get('/statistical/recharge/home')
}

// 获取充值统计
export function getRecharge(params) {
  return request.get('/statistical/recharge', {
    params
  })
}

// 获取MUCG产出统计
export function getMUCGOutputHome() {
  return request.get('/statistical/mucg-output/home')
}

// 获取MUCG产出统计
export function getMUCGOutput(params) {
  return request.get('/statistical/mucg-output', {
    params
  })
}

// 获取商店统计
export function getStoreHome(params) {
  return request.get('/statistical/store/home', {
    params
  })
}

// 获取商店统计
export function getStore(params) {
  return request.get('/statistical/store', {
    params
  })
}
