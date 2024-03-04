<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col
        :xs="24"
        :sm="24"
        :md="8"
        :lg="6"
        :xl="5"
        style="margin-bottom: 10px"
      >
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <ul class="user-info">
              <li>
                用户昵称
                <div class="user-right">{{ user.name }}</div>
              </li>
              <li>
                角色
                <div class="user-right">{{ user.roles }}</div>
              </li>
              <li>
                手机号码
                <div class="user-right">{{ user.phone }}</div>
              </li>
              <li>
                用户邮箱
                <div class="user-right">{{ user.email }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="19">
        <!--    用户资料    -->
        <el-card class="box-card">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="用户资料" name="first">
              <el-form
                ref="form"
                :model="form"
                :rules="rules"
                style="margin-top: 10px"
                size="small"
                label-width="85px"
              >
                <el-form-item label="昵称" prop="name">
                  <el-input v-model="form.name" style="width: 50%" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" style="width: 50%" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input
                    v-model="form.password"
                    type="password"
                    placeholder="密码"
                    style="width: 50%"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="form.confirmPassword"
                    type="password"
                    placeholder="确认密码"
                    style="width: 50%"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="">
                  <el-button
                    :loading="saveLoading"
                    size="mini"
                    type="primary"
                    @click="doSubmit"
                  >保存配置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { adminInfo, updateInfo } from '@/api/admin'
import { validUsername, validEmail } from '@/utils/validate'

export default {
  name: 'Usercenter',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('名称只能是中英文及数字'))
      } else {
        callback()
      }
    }
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
      show: false,
      activeName: 'first',
      saveLoading: false,
      user: {},
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '名称不能为空',
            trigger: ['blur', 'change']
          },
          { validator: validateUsername, trigger: ['blur', 'change'] }
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
        confirmPassword: [
          { validator: validateConfirmPassword, trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getCenter()
    },
    getCenter(loading = true) {
      if (this.loading) return
      this.loading = loading
      adminInfo()
        .then((response) => {
          if (response.code !== 0) return
          this.user = this.form = response.data
        })
        .catch((error) => {
          this.$message.error(error.msg)
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleClick(tab, event) {
      if (tab.name === 'second') {
        this.init()
      }
    },
    doSubmit() {
      if (this.$refs['form']) {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.saveLoading = true
            const data = {}
            for (const i in this.form) {
              if (i !== 'password' || i !== 'password_confirmation') {
                data[i] = this.form[i]
              }
            }
            updateInfo(data)
              .then(({ msg }) => {
                this.$message.success(msg)
                this.visible = false
                if (data.password !== '') {
                  this.$router.push(`/login?redirect=dashboard`)
                }
                this.saveLoading = false
                this.init()
              })
              .catch(() => {
                this.saveLoading = false
              })
          }
        })
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}
.user-info {
  padding-left: 0;
  list-style: none;
  li {
    border-bottom: 1px solid #f0f3f4;
    padding: 11px 0;
    font-size: 13px;
  }
  .user-right {
    float: right;
    a {
      color: #317ef3;
    }
  }
}
</style>
