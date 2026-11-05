<template>
  <div v-loading="loading" class="app-container statistics">
    <div class="toolbar">
      <h2>统计管理</h2>
      <el-button-group><el-button v-for="preset in presets" :key="preset.days" :type="days===preset.days?'primary':'default'" @click="setRange(preset.days)">{{ preset.label }}</el-button></el-button-group>
      <el-date-picker v-model="range" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :clearable="false" @change="customRange" />
    </div>
    <el-tabs v-model="section" @tab-click="load"><el-tab-pane label="经营概览" name="overview" /><el-tab-pane label="分销分析" name="distribution" /></el-tabs>
    <el-alert v-if="failed" title="统计加载失败，请点击重试" type="error" :closable="false" @click.native="load" />
    <div v-if="data" class="cards">
      <el-card v-for="card in cards" :key="card.key" shadow="never"><span class="label">{{ card.label }}</span><strong>{{ card.money ? money(data[card.key]) : data[card.key] }}</strong><small>{{ card.note }}</small></el-card>
    </div>
    <template v-if="section==='overview' && data">
      <el-card shadow="never" class="panel">
        <div slot="header">当前待办 <small>截至现在</small></div>
        <div class="tasks"><div v-for="task in tasks" :key="task.key"><el-button type="text" :disabled="!can(task.permission)" @click="$router.push(task.route)">{{ task.label }}</el-button><strong>{{ data.todo[task.key] }}</strong></div></div>
      </el-card>
      <div class="charts">
        <el-card shadow="never"><div slot="header" class="toolbar"><span>经营趋势</span><el-select v-model="metric" size="mini" @change="draw"><el-option label="新下单数" value="orders" /><el-option label="已核销单数" value="verified" /><el-option label="核销金额" value="amount" /></el-select></div><div ref="trend" class="chart" /></el-card>
        <el-card shadow="never"><div slot="header">各商品类型核销金额</div><div ref="mix" class="chart" /></el-card>
      </div>
    </template>
    <el-card v-if="section==='distribution' && data" shadow="never" class="panel">
      <div slot="header">分销商排行 <small>按期间已确认业绩排序 · 前10名</small></div>
      <el-table :data="data.rank" empty-text="所选期间暂无已确认业绩">
        <el-table-column type="index" label="排名" width="70" /><el-table-column prop="nickname" label="分销商" /><el-table-column prop="distributor_id" label="用户ID" /><el-table-column prop="orders" label="已确认订单数" /><el-table-column label="已确认业绩"><template slot-scope="{row}">{{ money(row.performance) }}</template></el-table-column><el-table-column label="已确认提成"><template slot-scope="{row}">{{ money(row.commission) }}</template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { diamondGet } from '@/api/diamond'

const date = value => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
const overview = [
  { key: 'orders', label: '新下单数', note: '按下单日期' }, { key: 'verified', label: '已核销订单数', note: '按核销日期' },
  { key: 'amount', label: '已核销订单金额', note: '按核销日期 · 订单金额', money: true }, { key: 'customers', label: '新增客户数', note: '按注册日期' }
]
const distribution = [
  { key: 'distributors', label: '有效分销商', note: '截至现在' }, { key: 'customers', label: '绑定客户数', note: '截至现在' },
  { key: 'verified', label: '分销核销订单数', note: '按核销日期' }, { key: 'performance', label: '已确认业绩', note: '按审核通过日期', money: true },
  { key: 'commission', label: '已确认提成', note: '按审核通过日期', money: true }, { key: 'pending', label: '待结算提成', note: '截至现在', money: true },
  { key: 'settled', label: '已结算提成', note: '按结算日期', money: true }
]
const tasks = [
  { key: 'orders', label: '待核销订单', permission: 'DiamondOrders', route: { path: '/diamond/orders', query: { status: 'pending' }}},
  { key: 'unassigned', label: '待指派配送', permission: 'DiamondOrders', route: { path: '/diamond/orders', query: { status: 'pending', fulfillment_method: 'delivery', unassigned_delivery: '1' }}},
  { key: 'applications', label: '待审核分销申请', permission: 'DiamondDistributors', route: { path: '/diamond/distributors', query: { tab: 'applications', status: 'pending' }}},
  { key: 'review', label: '待复核业绩', permission: 'DiamondCommissions', route: { path: '/diamond/commissions', query: { review_status: 'pending' }}},
  { key: 'settlement', label: '待结算提成', permission: 'DiamondCommissions', route: { path: '/diamond/commissions', query: { review_status: 'approved', settlement_status: 'pending' }}}
]

export default {
  data() { return { section: 'overview', days: 7, presets: [{ days: 1, label: '今天' }, { days: 7, label: '近7天' }, { days: 30, label: '近30天' }], range: [], data: null, loading: false, failed: false, metric: 'orders', requestId: 0, tasks } },
  computed: { cards() { return this.section === 'overview' ? overview : distribution } },
  created() { this.charts = []; this.setRange(7) },
  mounted() { window.addEventListener('resize', this.resize) },
  beforeDestroy() { this.requestId++; window.removeEventListener('resize', this.resize); this.dispose() },
  methods: {
    can(permission) { try { return JSON.parse(localStorage.getItem('permissionsList') || '[]').includes(permission) } catch (e) { return false } },
    money(value) { return '¥' + Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    setRange(days) { const to = new Date(); const from = new Date(to); from.setDate(from.getDate() - days + 1); this.days = days; this.range = [date(from), date(to)]; this.load() },
    customRange() { this.days = 0; this.load() },
    async load() {
      if (!this.range || this.range.length !== 2) return
      const requestId = ++this.requestId
      this.dispose(); this.data = null; this.loading = true; this.failed = false
      try {
        const response = await diamondGet('statistics', { section: this.section, from: this.range[0], to: this.range[1] })
        if (requestId !== this.requestId) return
        this.data = response.data
        this.$nextTick(() => { if (requestId === this.requestId) this.draw() })
      } catch (e) { if (requestId === this.requestId) this.failed = true } finally { if (requestId === this.requestId) this.loading = false }
    },
    resize() { this.charts.forEach(chart => chart.resize()) },
    dispose() { this.charts.forEach(chart => chart.dispose()); this.charts = [] },
    draw() {
      if (!this.$refs.trend || !this.$refs.mix || !this.data) return
      this.dispose()
      const trend = echarts.init(this.$refs.trend)
      const mix = echarts.init(this.$refs.mix)
      this.charts = [trend, mix]
      trend.setOption({ color: ['#3974db'], tooltip: { trigger: 'axis' }, grid: { left: 15, right: 20, bottom: 15, top: 20, containLabel: true }, xAxis: { type: 'category', data: this.data.trend.map(row => row.day.slice(5)) }, yAxis: { type: 'value', minInterval: this.metric === 'amount' ? 0 : 1 }, series: [{ type: 'line', data: this.data.trend.map(row => row[this.metric]), areaStyle: { opacity: 0.08 }}] })
      const labels = { loose: '培育散货', single: '单颗钻石', jewelry: '成品钻饰' }
      const values = Object.entries(this.data.types).map(([key, value]) => ({ name: labels[key] || key, value }))
      mix.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0 }, title: values.some(item => Number(item.value) > 0) ? undefined : { text: '暂无核销金额', left: 'center', top: 'middle', textStyle: { fontSize: 14, color: '#8b98ab' }}, series: [{ type: 'pie', radius: ['38%', '66%'], center: ['50%', '45%'], label: { show: false }, stillShowZeroSum: false, data: values }] })
    }
  }
}
</script>

<style scoped>
.statistics{background:#f5f7fa;min-height:calc(100vh - 84px)}
.toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.toolbar h2{margin:0 auto 0 0}.toolbar .el-select{margin-left:auto;width:132px}
.cards,.charts,.tasks{display:grid;gap:16px}.cards{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}.cards strong,.tasks strong{display:block;font-size:26px;color:#203b61;margin:10px 0}.label{color:#53647d}small{color:#7b8799}.panel,.charts{margin-top:16px}.tasks{grid-template-columns:repeat(auto-fit,minmax(116px,1fr))}.charts{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}.chart{height:280px}
@media(max-width:900px){.charts{grid-template-columns:1fr}}
</style>
