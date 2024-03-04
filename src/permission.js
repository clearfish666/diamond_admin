import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { getMenuNav } from '@/api/common'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        const routes = store.getters.permission_routes
        let isRole = true
        for (const i in routes) {
          if (to.name === routes[i].name && routes[i].hidden === true) {
            isRole = false
          } else if (routes[i].children) {
            routes[i].children.forEach((x) => {
              if (to.name === x.name && x.hidden === true) {
                isRole = false
              }
            })
          }
          if (!isRole) {
            break
          }
        }

        if (isRole || to.path.indexOf('redirect') >= 0) {
          next()
        } else {
          next('/dashboard')
        }
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')

          // generate accessible routes map based on roles
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // dynamically add accessible routes
          getMenuNav()
            .then(response => {
              window.localStorage.setItem('permissionsList', JSON.stringify(response.data.perms))
              const serverRoute = response.data.menus || []
              serverRoute.forEach((serverValue) => {
                accessRoutes.forEach((accessValue, accessIndex) => {
                  if (serverValue.alias === accessValue.name && serverValue.show === 1) {
                    accessRoutes[accessIndex].type = serverValue.type
                    accessRoutes[accessIndex].hidden = false
                  }
                  if (serverValue.list && accessValue.children) {
                    serverValue.list.forEach((y) => {
                      accessValue.children.forEach((a, b) => {
                        if (y.alias === a.name && y.show === 1) {
                          accessRoutes[accessIndex].children[b].type = y.type
                          accessRoutes[accessIndex].children[b].hidden = false
                        }
                        if (y.list) {
                          y.list.forEach((x) => {
                            accessValue.children.forEach((c, d) => {
                              if (x.alias === a.name && x.show === 1) {
                                accessRoutes[accessIndex].children[b].type = x.type
                                accessRoutes[accessIndex].children[b].hidden = false
                              }
                            })
                          })
                        }
                      })
                    })
                  }
                })
              })
              router.addRoutes(accessRoutes)
            })
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          // Message.error(error || 'Has Error')
          Message.error((error && error.msg) || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
