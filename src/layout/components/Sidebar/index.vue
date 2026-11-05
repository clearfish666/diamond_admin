<template>
  <div
    :class="{ 'has-logo': showLogo }"
    @mouseleave="onMouseleave()"
    @mouseenter="onMouseenter()"
  >
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in sidebarRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import { getToken } from '@/utils/auth'

const diamondMenuGroups = [
  { key: 'products', title: '商品管理', icon: 'shopping', pages: ['DiamondGoods', 'DiamondLoose', 'DiamondCategories'] },
  { key: 'users', title: '用户与分销', icon: 'people', pages: ['DiamondDistributors'] },
  { key: 'operations', title: '运营配置', icon: 'configs', pages: ['DiamondSettings', 'DiamondQuoteImages'] }
]

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters(['permission_routes', 'sidebar']),
    sidebarRoutes() {
      return this.permission_routes.reduce((items, route) => {
        if (route.name !== 'DiamondManage') return items.concat(route)
        if (route.hidden) return items

        const pages = route.children.filter(page => !page.hidden && page.type < 2)
          .map(page => ({ ...page, path: `${route.path}/${page.path}` }))
        const addPage = (name, icon) => {
          const page = pages.find(item => item.name === name)
          if (page) items.push({ ...page, meta: { ...page.meta, icon }})
        }
        const addGroup = ({ key, title, icon, pages: names }) => {
          const children = names.map(name => pages.find(page => page.name === name)).filter(Boolean)
          if (children.length) items.push({ path: `/diamond-menu/${key}`, type: 0, alwaysShow: true, meta: { title, icon }, children })
        }

        addPage('DiamondStatistics', 'chart')
        addGroup(diamondMenuGroups[0])
        addPage('DiamondOrders', 'order')
        addGroup(diamondMenuGroups[1])
        addPage('DiamondCommissions', 'money')
        addGroup(diamondMenuGroups[2])
        addPage('DiamondExports', 'excel')
        return items
      }, [])
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    onMouseleave() {
      if (getToken('menuMouseSwitch') === 'true') {
        this.sidebar.opened = false
      }
    },
    onMouseenter() {
      if (getToken('menuMouseSwitch') === 'true') {
        this.sidebar.opened = true
      }
    }
  }
}
</script>
