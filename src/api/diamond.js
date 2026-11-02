import request from '@/utils/request'
import axios from 'axios'
import { getToken } from '@/utils/auth'

export const diamondGet = (path, params) => request.get('/diamond/' + path, { params })
export const diamondPost = (path, data) => request.post('/diamond/' + path, data)
export const diamondPut = (path, data) => request.put('/diamond/' + path, data)

export async function downloadDiamondExport(id) {
  const response = await axios.get((process.env.VUE_APP_BASE_API || '/admin') + '/diamond/exports/' + id + '/download', {
    headers: { Authorization: 'Bearer ' + getToken() }, responseType: 'blob'
  })
  if ((response.headers['content-type'] || '').indexOf('text/csv') < 0) throw new Error('下载失败，请检查导出权限或任务状态')
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = 'diamond-' + id + '.csv'
  link.click()
  URL.revokeObjectURL(url)
}
