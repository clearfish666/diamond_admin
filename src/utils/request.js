import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import router from '@/router'
import storage from './storage'
import cryptoHelper from './cryptoHelper'

const CANCELTTYPE = {
  CACHE: 1,
  REPEAT: 2
}

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 1200 * 1e3 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }

    /**
      * 为每一次请求生成一个cancleToken
      */
    const source = axios.CancelToken.source()
    config.cancelToken = source.token

    if (config.url.indexOf('/nav') !== -1 || config.url.indexOf('/main/') !== -1) {
      /**
      * 缓存命中判断
      * 成功则取消当次请求
      */
      // 尝试获取缓存数据
      const data = storage.get(cryptoHelper.encrypt(config.baseURL + config.url.slice(1) + '-' + (config.method || '') + '-' + process.env.VERSION))
      if (data && (Date.now() <= data.exppries)) {
        /**
        * 将缓存数据通过cancle方法回传给请求方法
        */
        source.cancel(JSON.stringify({
          type: CANCELTTYPE.CACHE,
          data: data.data
        }))
      }
    }

    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 0) {
      // 未登录
      if (res.code === 4001) {
        MessageBox.alert('登录已失效，请重新登录', '提示', {
          confirmButtonText: '确定',
          showClose: false,
          callback: action => {
            store.dispatch('user/resetToken').then(() => {
              location.reload()
            })
          }
        })
      } else {
        Message({
          message: res.msg || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
      }

      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      if (response.type !== 1 && (response.config.url.indexOf('/nav') !== -1 || response.config.url.indexOf('/main/') !== -1)) {
        const dataParse = res.data
        // 添加缓存时间
        if (!dataParse.cacheTime) {
          dataParse.cacheTime = 1000 * 60 * 60
        }
        // 设置缓存数据
        storage.set(cryptoHelper.encrypt(response.config.url + '-' + (response.config.method || '') + '-' + process.env.VERSION), {
          data: res,
          exppries: Date.now() + dataParse.cacheTime
        })
      }
      return res
    }
  },
  error => {
    const error_message = JSON.parse(error.message)
    if (error_message.type === 1) {
      return error_message.data
    } else if (error.response && error.response.status === 503) {
      console.log('err' + error) // for debug
      router.replace({ path: '/503' })
    } else {
      console.log('err' + error) // for debug
      Message({
        message: error.message || error,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
