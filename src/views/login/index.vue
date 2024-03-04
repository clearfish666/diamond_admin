<template>
  <div id="login-container" class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">
          <img v-if="logo" :src="logo" class="sidebar-logo">
          <p>沣源公社{{ $t("login.title") }}</p>
        </h3>
      </div>
      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          :placeholder="$t('login.username')"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>
      <el-tooltip
        v-model="capsTooltip"
        content="Caps lock is On"
        placement="right"
        manual
      >
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            :placeholder="$t('login.password')"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon
              :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
            />
          </span>
        </el-form-item>
      </el-tooltip>
      <el-form-item prop="img_code">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="img_code"
          v-model="loginForm.img_code"
          placeholder="图形验证码"
          name="img_code"
          type="text"
          tabindex="3"
          autocomplete="on"
        />
        <div class="get-img-code">
          <el-image :src="img_codes" alt="图形验证码" @click="getImgCode" />
        </div>
      </el-form-item>
      <el-form-item v-if="false" prop="code">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="code"
          v-model="loginForm.code"
          placeholder="验证码"
          name="code"
          type="text"
          tabindex="4"
          autocomplete="on"
        />
        <span class="get-code" @click="getCode">获取验证码</span>
      </el-form-item>
      <el-button
        :loading="loading"
        type="primary"
        style="
          width: 100%;
          margin-bottom: 30px;
          background: #6CCD5A;
          border: none;
          padding: 10px 0;
          padding: 12px 0px;
          font-size: 16px;
          font-weight: bold;
        "
        @click.native.prevent="handleLogin"
      >
        {{ $t("login.logIn") }}
      </el-button>
    </el-form>
  </div>
</template>

<script>
import { validEmail, validPhone } from '@/utils/validate'
import { verificationCodes, imgCodes } from '@/api/common'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validEmail(value) && !validPhone(value)) {
        callback(new Error('请输入正确的账号'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        img_code: '',
        img_code_key: '',
        code: ''
      },
      loginRules: {
        username: [
          {
            required: true,
            trigger: ['blur', 'change'],
            validator: validateUsername
          }
        ],
        password: [
          {
            required: true,
            trigger: ['blur', 'change'],
            validator: validatePassword
          }
        ],
        code: [
          {
            required: true,
            message: '验证码不能为空',
            trigger: ['blur', 'change']
          }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      logo: 'favicon.png',
      img_codes: ''
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    this.getImgCode()
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    } else if (this.loginForm.code === '') {
      this.$refs.code.focus()
    }
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && key >= 'A' && key <= 'Z'
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    getImgCode() {
      imgCodes()
        .then((response) => {
          this.loading = false
          if (response.code === 0) {
            this.img_codes = response.data.img
            this.loginForm.img_code_key = response.data.key
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    getCode() {
      this.$refs.loginForm.rules.code[0].required = false
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          verificationCodes(this.loginForm)
            .then(({ code, msg }) => {
              this.loading = false
              if (code === 0) {
                this.$message.success(msg)
              }
            })
            .catch(() => {
              this.getImgCode()
              this.loading = false
            })
        } else {
          return false
        }
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({
                path: this.redirect || '/',
                query: this.otherQuery
              })
              this.loading = false
            })
            .catch(() => {
              this.getImgCode()
              this.loading = false
            })
        } else {
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #ffff;
$light_gray: #889aa4;
$light_gray_input: #283443;
$cursor: #283443;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .sidebar-logo {
    width: 100px;
    height: 100px;
    vertical-align: middle;
  }
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px #e5e5e5 inset !important;
        -webkit-text-fill-color: #889aa4 !important;
        transition: background-color 5000s ease-in-out 0s;
      }

      &::-webkit-input-placeholder {
        color: #889aa4;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}

.el-image__error {
  background: #e5e5e5;
  color: #889aa4;
  font-size: 16px;
}
</style>

<style lang="scss" scoped>
$bg: #ffffff;
$dark_gray: #889aa4;
$light_gray: #6CCD5A;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 2px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 32px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .get-img-code {
    position: absolute;
    right: 0px;
    top: 0px;
    font-size: 16px;
    border-radius: 0 5px 5px 0;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
    width: 120px;
    height: 47px;
  }

  .get-code {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
