<template>
  <el-dialog
    v-loading="loading"
    :top="'2vh'"
    :title="form.id ? $t('table.edit') : $t('table.add')"
    :visible.sync="visible"
    :close-on-click-modal="false"
    class="el-form-dialog"
    @closed="onClose()"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="头像" prop="avatar">
        <local-upload
          class-name="avatar-uploader"
          type="user"
          @handleBeforeUpload="beforeAvatarUpload"
          @handleSuccess="handleAvatarSuccess"
        >
          <img v-if="form.avatar" :src="showImage" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </local-upload>
      </el-form-item>
      <el-form-item label="昵称" prop="name">
        <el-input v-model="form.name" placeholder="昵称" clearable />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="手机号"
          maxlength="11"
          clearable
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码"
          clearable
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="password_confirmation">
        <el-input
          v-model="form.password_confirmation"
          type="password"
          placeholder="确认密码"
          clearable
        />
      </el-form-item>
      <el-form-item v-if="form.id === 0" label="邀请码" prop="code">
        <el-input
          v-model="form.code"
          :disabled="form.id > 0"
          placeholder="邀请码"
          clearable
        />
      </el-form-item>
      <el-form-item v-if="form.id === 0 || form.id > 0 && !form.level" label="设置会员" prop="code">
        <el-radio-group v-model="form.set_level">
          <el-radio :label="0">否</el-radio>
          <el-radio :label="1">是</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-radio-group v-model="form.state">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="个人简介" prop="introduction">
        <el-input v-model="form.introduction" type="textarea" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="btnLoading" @click="onFormSubmit()">
        {{ $t("table.confirm") }}
      </el-button>
      <el-button @click="visible = false">
        {{ $t("table.cancel") }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { validEmail } from '@/utils/validate'
import { getBaseUrl } from '@/utils/auth'
import { addOrUpdate } from '@/api/user'
import LocalUpload from '@/components/Upload/LocalUpload'

export default {
  name: 'AddOrUpdate',
  components: { LocalUpload },
  data() {
    const validateEmail = (rule, value, callback) => {
      if (!validEmail(value)) {
        callback(new Error('邮箱格式错误'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!this.form.id && !/\S/.test(value)) {
        callback(new Error('密码不能为空'))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (!this.form.id && !/\S/.test(value)) {
        callback(new Error('确认密码不能为空'))
      } else if (this.form.password !== value) {
        callback(new Error('确认密码与密码输入不一致'))
      } else {
        callback()
      }
    }
    return {
      loading: true,
      visible: false,
      btnLoading: false,
      domin: getBaseUrl(),
      showImage: '',
      form: {
        id: 0,
        nickname: null,
        phone: null,
        avatar: null,
        password: null,
        password_confirmation: null,
        state: 0,
        introduction: null,
        set_level: 0,
        level: null
      },
      rules: {
        nickname: [
          {
            required: true,
            message: '昵称不能为空',
            trigger: ['blur', 'change']
          }
        ],
        email: [
          {
            required: true,
            message: '邮箱不能为空',
            trigger: ['blur', 'change']
          },
          { validator: validateEmail, trigger: ['blur', 'change'] }
        ],
        password: [
          { validator: validatePassword, trigger: ['blur', 'change'] }
        ],
        password_confirmation: [
          { validator: validateConfirmPassword, trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  methods: {
    init(data) {
      this.visible = true
      if (data) {
        this.form = Object.assign({}, data)
        this.showImage = this.domin + this.form.image
      }
      this.loading = false
    },
    onFormSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          const data = {}
          for (const i in this.form) {
            if (i !== 'password' || i !== 'password_confirmation') {
              data[i] = this.form[i]
            }
          }
          addOrUpdate(data)
            .then(({ msg }) => {
              this.$message.success(msg)
              this.visible = false
              this.$emit('refreshList')
            })
            .catch(() => {
              this.btnLoading = false
            })
        }
      })
    },
    onClose() {
      this.btnLoading = false
      this.$reset()
    },
    handleAvatarSuccess(response, file) {
      this.form.avatar = response.filename
      this.showImage = this.domin + response.data.filename
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
.avatar-uploader >>> .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
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
  width: 100px;
  height: 100px;
  display: block;
}
</style>
