import request from '@/utils/request'

// 用户列表
export function dataList(params) {
  return request.get('/users', {
    params
  })
}

// 添加 / 修改
export function addOrUpdate({ id, ...data }) {
  let method = 'POST'
  let url = '/users'

  if (id > 0) {
    method = 'PUT'
    url += `/${id}`
    data.id = id
  }

  return request({ url, method, data })
}

// 删除
export function deleteData(id) {
  return request.delete(`/users/${id}`)
}

// 钱包详情
export function getUserWallet(id) {
  return request.get(`/users/wallet/${id}`)
}

// 用户背包列表
export function getBackpack(id, params) {
  return request.get(`/users/backpack/${id}`, {
    params
  })
}

// 用户钱包流水列表
export function getWalletLog(params) {
  return request.get('/users/wallet-logs', {
    params
  })
}

// 查询子集
export function getSubset(id) {
  return request.get(`/users/subset/${id}`)
}

// 粉丝列表
export function getFansList(id, params) {
  return request.get(`/users/fans/${id}`, {
    params
  })
}

// 关注列表
export function getFollowsList(id, params) {
  return request.get(`/users/follows/${id}`, {
    params
  })
}

// 作品列表
export function getWorksList(id, params) {
  return request.get(`/users/works/${id}`, {
    params
  })
}

// 资产增加/扣除
export function setWallet({ id, ...data }) {
  return request.post(`/users/wallet/change/${id}`, {
    ...data
  })
}

// 用户背包列表
export function getUserBackpack(params) {
  return request.get('/users/backpack', {
    params
  })
}

// 获取用户经验记录
export function getExpLog(id, params) {
  return request.get(`/users/exp-log/${id}`, {
    params
  })
}
