<template>
  <el-upload
    v-if="refresh"
    ref="elUpload"
    :class="className"
    :data="dataObj"
    :action="QiniuUrl"
    :accept="accept"
    :limit="limit"
    :multiple="multiple"
    :file-list="fileList"
    :show-file-list="showFileList"
    :list-type="listType"
    :before-upload="handleBeforeUpload"
    :on-exceed="handleExceed"
    :on-progress="handleProgress"
    :on-success="handleSuccess"
    :on-preview="handlePicture"
    :on-remove="handleRemove"
    :on-error="handleError"
    :on-change="handleChange"
  >
    <slot />
  </el-upload>
</template>

<script>
import { QiniuUrl, QiniuKey, getToken, setToken } from '@/utils/auth'
import { getQiniuToken } from '@/api/qiniu'

export default {
  props: {
    refresh: {
      type: Boolean,
      default: true
    },
    uploadType: {
      type: String,
      default: 'uploadToken'
    },
    listType: {
      type: String,
      default: 'text'
    },
    accept: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: 0
    },
    multiple: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: 'single-upload upload-default'
    },
    showFileList: {
      type: Boolean,
      default: false
    },
    fileList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      QiniuUrl,
      dataObj: { 'token': getToken(QiniuKey) }
    }
  },
  methods: {
    handleBeforeUpload(file) {
      return new Promise((resolve, reject) => {
        this.$emit('handleBeforeUpload', file, res => {
          res ? resolve(file) : reject(false)
        })
      })
    },
    handleSuccess(res, file, fileList) {
      this.$emit('handleSuccess', res, file, fileList, this.type)
    },
    handlePicture(file) {
      this.$emit('handlePicture', file)
    },
    handleChange(file, fileList) {
      this.dataObj.token = getToken(QiniuKey)
      this.$emit('handleChange', file, fileList)
    },
    handleExceed(files, fileList) {
      this.$emit('handleExceed', files, fileList)
    },
    handleRemove(file, fileList) {
      this.$emit('handleRemove', file, fileList)
    },
    handleProgress(event, file, fileList) {
      this.$emit('handleProgress', event, file, fileList)
    },
    handleError(err, file, fileList) {
      if (err.message.indexOf('token') !== -1) {
        getQiniuToken()
          .then((data) => {
            setToken(data.data, QiniuKey)
          })
          .finally(() => {
            this.$message.error('上传失败，请重新上传')
          })
      } else {
        this.$message.error('上传失败')
      }
      // this.$emit('handleError', err, file, fileList);
    }
  }
}
</script>

<style lang="scss" scoped>
.single-upload {
  display: inline-block;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.single-upload:hover {
  border-color: #409EFF;
}
.single-upload >>> .el-upload {
  width: 100%;
  height: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
}
.single-upload >>> .el-upload>img {
  width: 100%;
}
.upload-big {
  width: 202px;
  height: 202px;
}
.upload-default {
  width: 142px;
  height: 142px;
}
.upload-mini {
  width: 82px;
  height: 82px;
}

</style>
