import request from '@/utils/request'

// 列表
export function dataList(params) {
  return request.get('/admins', {
    params
  })
}

// 详情
export function adminItem(id) {
  return request.get(`/admins/${id}`)
}

// 用户详情
export function adminInfo() {
  return request.get('/info')
}

// 修改信息
export function updateInfo({ ...data }) {
  const url = '/info'
  const method = 'PUT'

  return request({ url, method, data })
}

// 添加 / 修改
export function addOrUpdate({ id, ...data }) {
  let method = 'POST'
  let url = '/admins'

  if (id > 0) {
    method = 'PUT'
    url += `/${id}`
    data.id = id
  }

  return request({ url, method, data })
}

// 删除
export function deleteData(id) {
  return request.delete(`/admins/${id}`)
}
