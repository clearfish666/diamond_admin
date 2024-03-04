<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <search id="header-search" class="right-menu-item" />
        <error-log class="errLog-container right-menu-item hover-effect" />
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
      </template>
      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <img
            :src="avatar + '?imageView2/1/w/80/h/80'"
            class="user-avatar"
            alt="avatar"
          >
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/">
            <el-dropdown-item>
              {{ $t("navbar.dashboard") }}
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="userCenter">
            <span style="display: block">个人中心</span>
          </el-dropdown-item>
          <el-dropdown-item
            v-if="auth"
            divided
            @click.native="clickMenu('horizon')"
          >
            <span style="display: block">horizon</span>
          </el-dropdown-item>
          <el-dropdown-item
            v-if="auth"
            divided
            @click.native="clickMenu('vlogs')"
          >
            <span style="display: block">vlogs</span>
          </el-dropdown-item>
          <el-dropdown-item
            v-if="auth && environment === 'development'"
            divided
            @click.native="clickMenu('telescope')"
          >
            <span style="display: block">telescope</span>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span
              style="display: block"
            >菜单滑动关闭
              <el-switch
                v-model="menuMouseSwitchStatus"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="menuMouseSwitch(menuMouseSwitchStatus)"
              /></span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display: block">{{ $t("navbar.logOut") }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import Search from '@/components/HeaderSearch'
import { setToken, getToken, AuthPermission } from '@/utils/auth'
import request from '@/utils/request'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    Search
  },
  data() {
    return {
      timer: '',
      menuMouseSwitchStatus: getToken('menuMouseSwitch')
        ? getToken('menuMouseSwitch') === 'true'
        : false,
      auth: getToken(AuthPermission),
      environment: 'production'
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'device'])
  },
  mounted() {
    this.environment =
      process.env.VUE_APP_BASE_API === 'https://www.沣源公社.news/admin/'
        ? 'production'
        : 'development'
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=dashboard`)
    },
    async userCenter() {
      this.$router.push({
        name: 'usercenter'
      })
    },
    menuMouseSwitch(status) {
      setToken(status, 'menuMouseSwitch')
    },
    clickMenu(type) {
      request
        .post('/horizon/auth', {
          type: type
        })
        .then((response) => {
          window.open(response.data)
        })
        .catch(({ msg = '加载失败' }) => {
          this.$message.error(msg)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
