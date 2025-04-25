import request from '@/utils/request'

// 列表
export function dataList(params) {
  return request.get('/coupon', {
    params
  })
}

// 添加 / 修改
export function addOrUpdate({ id, ...data }) {
  let method = 'POST'
  let url = '/coupon'

  if (id > 0) {
    method = 'PUT'
    url += `/${id}`
    data.id = id
  }

  return request({ url, method, data })
}

// 删除
export function deleteData(id) {
  return request.delete(`/coupon/${id}`)
}


// 用户优惠券列表
export function userCouponList(params) {
   return request.get('/coupon/user-coupon', {
     params
   })
}
 
// 删除
export function deleteUserData(id) {
   return request.delete(`/coupon/user-coupon/${id}`)
}
 

export function addUserCoupon({ id, ...data }) {
   let method = 'POST'
   let url = '/coupon/send-coupon'
 
   // if (id > 0) {
   //   method = 'PUT'
   //   url += `/${id}`
   //   data.id = id
   // }
 
   return request({ url, method, data })
 }