import request from '@/utils/request'

// 商品列表
export function getCategoryList(params) {
  return request.get('/store/category', {
    params
  })
}

// 添加 / 修改
export function addOrUpdate({ id, ...data }) {
  let method = 'POST'
  let url = '/store/category'

  if (id > 0) {
    method = 'PUT'
    url += `/${id}`
    data.id = id
  }

  return request({ url, method, data })
}

// 删除
export function deleteData(id) {
  return request.delete(`/store/category/${id}`)
}
