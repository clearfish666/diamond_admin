<template>
  <div class="app-container">
    <el-form ref="forms" :model="forms" :rules="rules" label-width="220px">
      <el-tabs v-model="activeName">
        <el-tab-pane
          v-if="forms[activeName]"
          label="邀请配置"
          name="invite"
          :style="'height:' + pageheight + 'px;overflow-y: auto;'"
        >
          <el-form-item :label="'邀请地址'" prop="link">
            <el-input
              v-model="forms.invite.link.value"
              size="small"
              :label="'邀请地址'"
            />
            <div class="notice">注意：邀请地址</div>
          </el-form-item>
          <el-form-item label="邀请说明" prop="link_info">
            <el-input
              v-model="forms.invite.link_info.value"
              type="textarea"
              :rows="10"
              :label="'邀请说明'"
            />
            <div class="notice">注意：邀请说明</div>
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
        <el-tab-pane
          v-if="forms[activeName]"
          label="线下支付配置"
          name="offline_pay"
          :style="'height:' + pageheight + 'px;overflow-y: auto;'"
        >
          <el-form-item :label="'账户名'" prop="name">
            <el-input
              v-model="forms.offline_pay.name.value"
              size="small"
              :label="'账户名'"
            />
            <div class="notice">注意：账户名</div>
          </el-form-item>
          <el-form-item :label="'收款银行'" prop="bank">
            <el-input
              v-model="forms.offline_pay.bank.value"
              size="small"
              :label="'收款银行'"
            />
            <div class="notice">注意：收款银行</div>
          </el-form-item>
          <el-form-item :label="'收款账户'" prop="account">
            <el-input
              v-model="forms.offline_pay.account.value"
              size="small"
              :label="'收款账户'"
            />
            <div class="notice">注意：收款账户</div>
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
import { QiniuUrl, QiniuKey, DominKey, getToken } from '@/utils/auth'

export default {
  name: 'SystemConfig',
  mixins: [mixin],
  data() {
    return {
      QiniuUrl,
      qiniu: getToken(QiniuKey),
      domin: getToken(DominKey),
      btnLoading: false,
      type: 'system',
      forms: {},
      rules: {},
      activeName: null
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
          this.activeName = response.data.groups.shift()
          this.forms = response.data.values
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
    handleQrCodeSuccess(response, file) {
      this.forms.share_config.group_url.value = response.filename
    },
    beforeQrCodeUpload(file, cb) {
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
.el-input-number {
  width: 200px;
}
.notice {
  color: #909399;
  font-size: 12px;
}

.qr-code-uploader >>> .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.qr-code-uploader .el-upload:hover {
  border-color: #409eff;
}
.qr-code-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.qr-code {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
