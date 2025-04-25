import request from '@/utils/request'

// 获取充值统计
export function getRechargeHome() {
  return request.get('/statistical')
}


// 获取每期统计
export function getPeriod(params) {
   return request.get("/statistical/period", {
     params,
   });
 }
 
