<template>
  <div class="app-container">
    <el-form ref="forms" :model="forms" :rules="rules" label-width="220px">
      <el-tabs v-model="activeName">
        <el-tab-pane
          v-if="forms[activeName]"
          label="上传相关图"
          name="service"
          :style="'height:' + pageheight + 'px;overflow-y: auto;'"
        >
       <el-form-item label="客服二维码" prop="service_online">
        <local-upload
          class-name="avatar-uploader"
          @handleBeforeUpload="beforeAvatarUpload"
          @handleSuccess="handleAvatarSuccess"
        >
          <img v-if="forms.service.service_online.value" :src="showImage" class="avatar"> 
          <i v-else class="el-icon-plus avatar-uploader-icon" />
          <!-- <i  class="el-icon-plus avatar-uploader-icon" /> -->

        </local-upload>
        <p>
          建议300*300尺寸，点击图片可替换
        </p>
      </el-form-item>
          <!-- <el-form-item label="邀请说明" prop="price_list">
            <el-input
              v-model="forms.service.price_list.value"
              type="textarea"
              :rows="10"
              :label="'邀请说明'"
            />
            <div class="notice">注意：邀请说明</div>
          </el-form-item> -->
          <el-form-item label="当日价格表" prop="price_list">
        <local-upload
          class-name="avatar-uploader"
          @handleBeforeUpload="beforePricelistUpload"
          @handleSuccess="handlePricelistSuccess"
        >
          <img v-if="forms.service.price_list.value" :src="pricelist" class="avatar"> 
          <i v-else class="el-icon-plus avatar-uploader-icon" />
          <!-- <i  class="el-icon-plus avatar-uploader-icon" /> -->

        </local-upload>
        <p>
          点击图片可替换
        </p>
      </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="btnLoading"
              @click="onFormSubmit()"
            >
              {{ $t("table.confirm") }}
            </el-button>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </div>
</template>

<script>
import { getConfig, setConfig } from '@/api/configs'
import { mixin } from '@/utils/mixin'
import LocalUpload from '@/components/Upload/LocalUpload'
import { getBaseUrl } from '@/utils/auth'

export default {
  name: 'SystemConfig',
  mixins: [mixin],
  components: { LocalUpload },
  data() {
    return {
      visible: false,
      btnLoading: false,
      domin: getBaseUrl(),
      showImage: '',
      pricelist: '',
      type: 'system',
      forms: {},
      rules: {},
      activeName: 'service'
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getList()
    },
    getList() {
      getConfig(this.type)
        .then((response) => {
          this.forms = response.data.values
          this.showImage = this.domin+this.forms.service.service_online.value
          this.pricelist = this.domin+this.forms.service.price_list.value
        })
        .catch(({ msg = '加载失败' }) => {
          this.$message.error(msg)
        })
    },
    onFormSubmit() {
      this.$refs['forms'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          setConfig({ type: this.type, data: this.forms })
            .then(({ msg }) => {
              this.$message.success(msg)
              this.getList()
            })
            .catch(() => {})
            .finally(() => {
              this.btnLoading = false
            })
        }
      })
    },
    handlePricelistSuccess(response, file) {
      this.forms.service.price_list.value = response.data.filename
      this.pricelist = this.domin+this.forms.service.price_list.value
    },
    beforePricelistUpload(file, cb) {
      const type = ['image/jpeg', 'image/jpg', 'image/png']
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!type.includes(file.type)) {
        this.$message.error('上传图片只能是 ' + type.join(',') + ' 格式!')
        cb(false)
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2M')
        cb(false)
      }
      cb(true)
    },
    handleAvatarSuccess(response, file) {
      this.forms.service.service_online.value = response.data.filename
      this.showImage = this.domin+this.forms.service.service_online.value
      console.log(this.domin+this.forms.service.service_online.value)
    },
    beforeAvatarUpload(file, cb) {
      const type = ['image/jpeg', 'image/jpg', 'image/png']
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!type.includes(file.type)) {
        this.$message.error('上传图片只能是 ' + type.join(',') + ' 格式!')
        cb(false)
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2M')
        cb(false)
      }
      cb(true)
    }
  }
}
</script>

<style scoped>

.img-cover {
  width: 200px;
  height: auto;
}

.avatar-uploader>>>.el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 178px;
  max-height: 178px;
  display: block;
}
</style>
