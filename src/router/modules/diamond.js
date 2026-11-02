import Layout from '@/layout'

export default {
  path: '/diamond', component: Layout, name: 'DiamondManage', hidden: true, redirect: '/diamond/orders',
  meta: { title: '钻石商城', icon: 'shopping' },
  children: [
    ['goods', 'DiamondGoods', '商品管理'], ['loose', 'DiamondLoose', '散货配货配置'], ['categories', 'DiamondCategories', '商品分类'], ['orders', 'DiamondOrders', '订单与核销'],
    ['distributors', 'DiamondDistributors', '分销商管理'], ['commissions', 'DiamondCommissions', '业绩与提成'],
    ['settings', 'DiamondSettings', '业务配置'], ['exports', 'DiamondExports', '数据导出']
  ].map(([path, name, title]) => ({ path, name, hidden: true, component: path === 'loose' ? () => import('@/views/diamond/LooseManage') : path === 'categories' ? () => import('@/views/diamond/Categories') : () => import('@/views/diamond/Workbench'), props: { section: path }, meta: { title } }))
}


