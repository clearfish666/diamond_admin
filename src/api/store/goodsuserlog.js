import request from '@/utils/request'

// 商品列表
export function getGoodsUserLog(params) {
  return request.get('/store/usergoodslog', {
    params
  })
}

// 删除
export function deleteData(id) {
  return request.delete(`/store/usergoodslog/${id}`)
}
