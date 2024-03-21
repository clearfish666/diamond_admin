/* Layout */
import Layout from "@/layout";

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const routes_insidesystem = [
  {
    path: "/statistical",
    component: Layout,
    name: "StatisticalManage",
    hidden: true,
    meta: {
      title: "统计管理",
      icon: "chart",
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/statistical/index'),
        name: 'Statistical',
        hidden: true,
        meta: {
          title: '统计数据'
        }
      }
    ],
  },
  {
    path: "/user",
    component: Layout,
    name: "UserManage",
    hidden: true,
    meta: {
      title: "用户管理",
      icon: "peoples",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/user/index"),
        name: "UserList",
        hidden: true,
        meta: {
          title: "用户管理",
        },
      },
    ],
  },
  // {
  //   path: "/vip",
  //   component: Layout,
  //   name: "VipManage",
  //   hidden: true,
  //   meta: {
  //     title: "会员管理",
  //     icon: "peoples",
  //   },
  //   children: [
  //     {
  //       path: "index",
  //       component: () => import("@/views/vip/index"),
  //       name: "VipList",
  //       hidden: true,
  //       meta: {
  //         title: "会员列表",
  //       },
  //     },
  //     {
  //       path: "equity",
  //       component: () => import("@/views/vip/equity"),
  //       name: "VipEquityList",
  //       hidden: true,
  //       meta: {
  //         title: "会员权益",
  //       },
  //     },
  //     {
  //       path: "order",
  //       component: () => import("@/views/vip/order"),
  //       name: "VipOrderList",
  //       hidden: true,
  //       meta: {
  //         title: "会员订单",
  //       },
  //     },
  //   ],
  // },
  {
    path: "/ad",
    component: Layout,
    name: "Ad",
    hidden: true,
    meta: {
      title: "广告管理",
      icon: "poster",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/ad/index"),
        name: "Ads",
        hidden: true,
        meta: {
          title: "广告管理",
        },
      },
    ],
  },

  // {
  //   path: "/wallet",
  //   component: Layout,
  //   name: "WalletManage",
  //   hidden: true,
  //   meta: {
  //     title: "钱包管理",
  //     icon: "money",
  //   },
  //   children: [
  //     {
  //       path: "index",
  //       component: () => import("@/views/wallet/index"),
  //       name: "WalletList",
  //       hidden: true,
  //       meta: {
  //         title: "钱包列表",
  //       },
  //     },
  //     {
  //       path: "logs",
  //       component: () => import("@/views/wallet/logs"),
  //       name: "WalletLogList",
  //       hidden: true,
  //       meta: {
  //         title: "钱包日志",
  //       },
  //     },
  //     {
  //       path: "transfer",
  //       component: () => import("@/views/wallet/transfer"),
  //       name: "WalletTransfer",
  //       hidden: true,
  //       meta: {
  //         title: "转仓管理",
  //       },
  //     },
  //     {
  //       path: "exchange",
  //       component: () => import("@/views/wallet/exchange"),
  //       name: "WalletExchange",
  //       hidden: true,
  //       meta: {
  //         title: "兑换管理",
  //       },
  //     },
  //   ],
  // },
  {
    path: "/store",
    component: Layout,
    name: "StoreManage",
    hidden: true,
    meta: {
      title: "商店管理",
      icon: "store",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/store/goods"),
        name: "StoreGoodsList",
        hidden: true,
        meta: {
          title: "商品列表",
        },
      },
      {
        path: "category",
        component: () => import("@/views/store/category"),
        name: "StoreGoodsCategoryList",
        hidden: true,
        meta: {
          title: "手机型号",
        },
      },
      {
        path: "goods",
        component: () => import("@/views/store/AddOrUpdate"),
        name: "StoreGoodsEdit",
        hidden: true,
        meta: {
          title: "商品编辑",
        },
      },
      {
        path: "order",
        component: () => import("@/views/store/order"),
        name: "StoreOrderList",
        hidden: true,
        meta: {
          title: "订单管理",
        },
      },
      {
        path: "usergoodslog",
        component: () => import("@/views/store/goodslog"),
        name: "StoreGoodsUserLog",
        hidden: true,
        meta: {
          title: "用户浏览记录",
        },
      },
      {
        path: "offlinelog",
        component: () => import("@/views/store/offlinelog"),
        name: "StoreOfflineList",
        hidden: true,
        meta: {
          title: "线下销售登记",
        },
      },
      {
        path: "offlinelogEdit",
        component: () => import("@/views/store/offline_AddOrUpdate"),
        name: "StoreOfflineLogEdit",
        hidden: true,
        meta: {
          title: "销售登记编辑",
        },
      },
      {
        path: "todayprice",
        component: () => import("@/views/store/link/index"),
        name: "TodayPriceList",
        hidden: true,
        meta: {
          title: "当日价格表",
        },
      },
    ],
  },
  // {
  //   path: "/verification",
  //   component: Layout,
  //   name: "VerificationManage",
  //   hidden: true,
  //   meta: {
  //     title: "验证码管理",
  //     icon: "verifications",
  //   },
  //   children: [
  //     {
  //       path: "index",
  //       component: () => import("@/views/verification/index"),
  //       name: "VerificationList",
  //       hidden: true,
  //       meta: {
  //         title: "验证码管理",
  //       },
  //     },
  //   ],
  // },
  // {
  //   path: '/feedback',
  //   component: Layout,
  //   name: 'FeedbackManage',
  //   hidden: true,
  //   meta: {
  //     title: '反馈管理',
  //     icon: 'feedback'
  //   },
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/feedback/index'),
  //       name: 'FeedbackList',
  //       hidden: true,
  //       meta: {
  //         title: '反馈管理'
  //       }
  //     }
  //   ]
  // },
  {
    path: "/article",
    component: Layout,
    name: "ArticleManage",
    hidden: true,
    meta: {
      title: "文章管理",
      icon: "help",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/articles/index"),
        name: "ArticleList",
        hidden: true,
        meta: {
          title: "文章列表",
        },
      },
    ],
  },
  // {
  //   path: '/message',
  //   component: Layout,
  //   name: 'Message',
  //   hidden: true,
  //   meta: {
  //     title: '系统消息',
  //     icon: 'message'
  //   },
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/message/index'),
  //       name: 'Messages',
  //       hidden: true,
  //       meta: {
  //         title: '系统消息'
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/version',
  //   component: Layout,
  //   name: 'VersionManage',
  //   hidden: true,
  //   meta: {
  //     title: '版本管理',
  //     icon: 'version'
  //   },
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/version/index'),
  //       name: 'VersionList',
  //       hidden: true,
  //       meta: {
  //         title: '版本管理'
  //       }
  //     }
  //   ]
  // },
  {
    path: "/menu",
    component: Layout,
    name: "MenuManage",
    hidden: true,
    meta: {
      title: "权限管理",
      icon: "tree-table",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/menu/index"),
        name: "MenuList",
        hidden: true,
        meta: {
          title: "权限管理",
        },
      },
    ],
  },
  {
    path: "/role",
    component: Layout,
    name: "RoleManage",
    hidden: true,
    meta: {
      title: "角色管理",
      icon: "tree",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/role/index"),
        name: "RoleList",
        hidden: true,
        meta: {
          title: "角色管理",
        },
      },
    ],
  },
  {
    path: "/admin",
    component: Layout,
    name: "AdminManage",
    hidden: true,
    meta: {
      title: "管理员管理",
      icon: "user",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/admin/index"),
        name: "AdminList",
        hidden: true,
        meta: {
          title: "管理员管理",
        },
      },
    ],
  },
  {
    path: "/configs",
    component: Layout,
    name: "ConfigManage",
    hidden: true,
    meta: {
      title: "系统配置",
      icon: "configs",
    },
    children: [
      {
        path: "system",
        component: () => import("@/views/configs/system"),
        name: "SystemConfig",
        hidden: true,
        meta: {
          title: "基础配置",
        },
      },
      // {
      //   path: "vip",
      //   component: () => import("@/views/configs/vip"),
      //   name: "VipConfig",
      //   hidden: true,
      //   meta: {
      //     title: "会员配置",
      //   },
      // },
      // {
      //   path: "food-stamps",
      //   component: () => import("@/views/configs/food-stamps"),
      //   name: "FoodStampsConfig",
      //   hidden: true,
      //   meta: {
      //     title: "粮票配置",
      //   },
      // },
      // {
      //   path: "share-equity",
      //   component: () => import("@/views/configs/share-equity"),
      //   name: "ShareEquityConfig",
      //   hidden: true,
      //   meta: {
      //     title: "分享权益配置",
      //   },
      // },
      // {
      //   path: "ration-equity",
      //   component: () => import("@/views/configs/ration-equity"),
      //   name: "RationEquityConfig",
      //   hidden: true,
      //   meta: {
      //     title: "配售权益配置",
      //   },
      // },
      {
        path: "store",
        component: () => import("@/views/configs/store"),
        name: "StoreConfig",
        hidden: true,
        meta: {
          title: "商城配置",
        },
      },
    ],
  },
  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true },
];

export default routes_insidesystem;
