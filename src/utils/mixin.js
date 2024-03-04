import { DominKey, getToken, QiniuKey } from '@/utils/auth'
import elementResizeDetectorMaker from 'element-resize-detector'

export const mixin = {
  data() {
    return {
      pageheight: 0,
      windowsheight: 0,
      default_page_height: 0,
      qiniu: getToken(QiniuKey),
      domin: getToken(DominKey)
    }
  },
  created() {
    this.pageheight = document.body.clientHeight - 220
    const clientHeight = document.body.clientHeight
    this.windowsheight = clientHeight - (clientHeight * 0.02)
    this.default_page_height = this.pageheight
  },
  mounted() {
    const div = document.getElementById('search-box')
    if (div) {
      const erd = elementResizeDetectorMaker()
      const that = this
      erd.listenTo(document.getElementById('search-box'), function(element) {
        var height = element.offsetHeight
        that.pageheight = that.default_page_height - height
      })
    }
  },
  methods: {
    // 获取资源链解
    getResourceUrl(url) {
      const dominRegex = /(http|https):\/\/([\w.]+\/?)\S*/
      if (dominRegex.test(url)) return url
      return this.domin + url
    },
    formatSecond(value) {
      var theTime = parseInt(value)// 秒
      var theTime1 = 0// 分
      var theTime2 = 0// 小时
      if (theTime > 60) {
        theTime1 = parseInt(theTime / 60)
        theTime = parseInt(theTime % 60)
        if (theTime1 > 60) {
          theTime2 = parseInt(theTime1 / 60)
          theTime1 = parseInt(theTime1 % 60)
        }
      }
      var result = '' + parseInt(theTime) + '秒'
      if (theTime1 > 0) {
        result = '' + parseInt(theTime1) + '分' + result
      }
      if (theTime2 > 0) {
        result = '' + parseInt(theTime2) + '小时' + result
      }
      return result
    }
  }
}
