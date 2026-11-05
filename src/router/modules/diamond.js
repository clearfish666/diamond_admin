import Layout from '@/layout'

const workbench = () => import('@/views/diamond/Workbench')

function page(path, name, title, component = workbench) {
  return { path: '/diamond/' + path, name, component, hidden: true, props: { section: path }, meta: { title }}
}

function group(path, title, icon, children, alwaysShow = false) {
  return { path, component: Layout, hidden: true, type: 0, alwaysShow, meta: { title, icon, diamondGroup: true }, children }
}

export default [
  group('/diamond-overview', '统计管理', 'chart', [
    page('statistics', 'DiamondStatistics', '统计管理', () => import('@/views/diamond/Statistics'))
  ]),
  group('/diamond-products', '商品管理', 'shopping', [
    page('goods', 'DiamondGoods', '商品管理'),
    page('loose', 'DiamondLoose', '散货配货配置', () => import('@/views/diamond/LooseManage')),
    page('categories', 'DiamondCategories', '商品分类', () => import('@/views/diamond/Categories'))
  ], true),
  group('/diamond-orders', '订单管理', 'order', [
    page('orders', 'DiamondOrders', '订单与核销')
  ], true),
  group('/diamond-users', '用户管理', 'people', [
    page('distributors', 'DiamondDistributors', '分销商管理')
  ], true),
  group('/diamond-finance', '业绩与提成', 'money', [
    page('commissions', 'DiamondCommissions', '业绩与提成')
  ]),
  group('/diamond-operations', '运营配置', 'configs', [
    page('settings', 'DiamondSettings', '业务配置'),
    page('quote-images', 'DiamondQuoteImages', '今日报价', () => import('@/views/diamond/QuoteImages'))
  ], true),
  group('/diamond-data', '数据导出', 'excel', [
    page('exports', 'DiamondExports', '数据导出')
  ])
]
