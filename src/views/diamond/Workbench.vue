<template>
  <div class="app-container diamond-workbench"><el-button v-if="section==='settings'" @click="$router.push('/diamond/quote-images')">编辑今日报价</el-button>
    <h2>{{ titles[section] }}</h2>
    <el-alert title="订单无在线支付；核销后业绩待平台确认，实际提成在线下结算。" type="info" :closable="false" />
    <template v-if="section==='settings'">
      <el-form label-width="160px" class="settings">
        <el-form-item label="默认提成比例 %"><el-input-number v-model="settings.commission_rate" :min="0" :max="100" :precision="2" /></el-form-item>
        <el-form-item label="库存预留分钟数"><el-input-number v-model="settings.reserve_minutes" :min="1" :max="525600" /><p>修改只影响新订单，现有订单保留创建时的截止时间。</p></el-form-item>
        <el-form-item label="开放分销申请"><el-switch v-model="settings.apply_open" active-value="1" inactive-value="0" /></el-form-item>
        <el-form-item v-for="(label,key) in agreementLabels" :key="key" :label="label"><el-input-number v-model="settings[key]" :min="0" :precision="0" /><p>填写文章管理中已发布的文章ID，0表示尚未发布。上线前请完善。</p></el-form-item>
        <el-form-item><el-button v-if="can('DiamondSettingsEdit')" type="primary" :loading="busy" @click="saveSettings">保存配置</el-button></el-form-item>
      </el-form>
    </template>
    <template v-else>
      <div class="filters">
        <el-input v-if="section!=='exports'" v-model="filters.search" placeholder="商品名、客户昵称或订单号" clearable @keyup.enter.native="load(1)" />
        <el-select v-if="section==='goods' || section==='orders'" v-model="filters.product_type" clearable placeholder="商品类型"><el-option v-for="(label,key) in types" v-if="section!=='goods' || key!=='loose'" :key="key" :value="key" :label="label" /></el-select>
        <el-select v-if="section==='orders'" v-model="filters.status" clearable placeholder="履约状态"><el-option v-for="key in ['pending','verified','cancelled']" :key="key" :value="key" :label="labels[key]" /></el-select>
        <el-select v-if="section==='orders'" v-model="filters.fulfillment_method" clearable placeholder="交付方式"><el-option label="到店提货" value="pickup" /><el-option label="配送上门" value="delivery" /></el-select><el-checkbox v-if="section==='orders'" v-model="filters.unassigned_delivery" @change="load(1)">仅待指派配送</el-checkbox><el-select v-if="section==='commissions'" v-model="filters.review_status" clearable placeholder="复核状态"><el-option v-for="key in ['pending','approved','rejected']" :key="key" :value="key" :label="reviewLabels[key]" /></el-select>
        <el-date-picker v-if="['orders','commissions'].includes(section)" v-model="dates" type="daterange" value-format="yyyy-MM-dd" start-placeholder="创建开始日期" end-placeholder="创建结束日期" />
        <el-button :loading="busy" @click="load(1)">刷新 / 查询</el-button>
        <el-button v-if="section==='goods' && can('DiamondGoodsEdit')" type="primary" @click="$refs.editor.open(null,categories)">新增商品</el-button>
        <el-button v-if="['orders','commissions'].includes(section) && can('DiamondExport')" @click="makeExport(section)">导出当前筛选</el-button>
      </div>
      <template v-if="section==='goods'">
        <el-table :data="rows" border><el-table-column prop="goods_no" label="商品编号" /><el-table-column prop="name" label="商品名称" /><el-table-column label="类型"><template slot-scope="{row}">{{ types[row.product_type] }}</template></el-table-column><el-table-column label="上架"><template slot-scope="{row}">{{ row.enabled?'已上架':'未上架' }}</template></el-table-column><el-table-column label="规格 / 可售库存"><template slot-scope="{row}"><div v-for="sku in row.skus" :key="sku.id">{{ sku.sku_no }}：{{ sku.stock }}{{ sku.stock_unit==='grain'?'粒':'件' }} · ¥{{ sku.price }}/{{ sku.price_unit }}</div></template></el-table-column><el-table-column label="操作"><template slot-scope="{row}"><el-button v-if="can('DiamondGoodsEdit')" type="text" @click="$refs.editor.open(row,categories)">编辑</el-button></template></el-table-column></el-table>
      </template>
      <template v-if="section==='orders'">
        <div v-if="can('DiamondVerify')" class="filters"><el-input v-model="verificationCode" placeholder="输入客户核销码" /><el-button type="primary" @click="lookup">查询核销订单</el-button><el-button v-if="can('DiamondExport')" @click="makeExport('verifications')">导出核销记录</el-button></div>
        <el-table :data="rows" border><el-table-column type="expand"><template slot-scope="{row}"><p>提交组号：{{ row.checkout_group_no }} · 预留至 {{ row.reserve_expires_at }}</p><p>联系人：{{ row.contact_name }} · {{ row.contact_phone }}</p><p v-if="row.fulfillment_method==='delivery'">收货地址：{{ row.delivery_address }}</p><p v-for="item in row.items" :key="item.id">{{ item.snapshot.name }} / {{ item.snapshot.sku_no }} · {{ item.quantity }}{{ item.stock_unit==='grain'?'粒':'件' }} · {{ item.total_weight_ct?item.total_weight_ct+'ct':'' }} · ¥{{ item.subtotal }}</p></template></el-table-column><el-table-column prop="order_no" label="订单号" min-width="210" /><el-table-column prop="contact_name" label="联系人" /><el-table-column prop="distributor_id" label="归属分销商ID" /><el-table-column label="交付方式"><template slot-scope="{row}">{{ row.fulfillment_method==='delivery'?'配送上门':'到店提货' }}</template></el-table-column><el-table-column label="配送人员" min-width="130"><template slot-scope="{row}">{{ row.fulfillment_method==='delivery'?(row.delivery_distributor?row.delivery_distributor.nickname+'（'+row.delivery_distributor_id+'）':'待指派'):'—' }}</template></el-table-column><el-table-column label="类型"><template slot-scope="{row}">{{ types[row.product_type] }}</template></el-table-column><el-table-column prop="order_amount" label="金额" /><el-table-column label="状态"><template slot-scope="{row}">{{ labels[row.status] }}</template></el-table-column><el-table-column label="操作"><template slot-scope="{row}"><el-button v-if="row.status==='pending' && row.fulfillment_method==='delivery' && can('DiamondVerify')" type="text" @click="openDelivery(row)">{{ row.delivery_distributor_id?'改派配送':'指派配送' }}</el-button><el-button v-if="row.status==='pending' && can('DiamondVerify')" type="text" @click="cancel(row)">取消订单</el-button></template></el-table-column></el-table>
      </template>
      <template v-if="section==='distributors'">
        <el-tabs v-model="memberTab" @tab-click="load(1)"><el-tab-pane name="users" label="用户与分销授权" /><el-tab-pane name="applications" label="申请审核" /></el-tabs>
        <el-table v-if="memberTab==='users'" :data="rows" border><el-table-column prop="id" label="用户ID" /><el-table-column prop="nickname" label="昵称" /><el-table-column prop="code" label="邀请码" /><el-table-column prop="phone" label="账号电话" /><el-table-column label="分销状态"><template slot-scope="{row}">{{ reviewLabels[row.distributor_status] || row.distributor_status }}</template></el-table-column><el-table-column label="核销授权"><template slot-scope="{row}">{{ row.can_verify_diamond?'已授权（本人归属订单）':'未授权' }}</template></el-table-column><el-table-column label="操作"><template slot-scope="{row}"><el-button v-if="can('DiamondDistributorEdit')" type="text" @click="authorize(row)">设置身份/核销权限</el-button></template></el-table-column></el-table>
        <el-table v-else :data="rows" border><el-table-column prop="user_id" label="用户ID" /><el-table-column prop="real_name" label="申请人" /><el-table-column prop="reason" label="申请说明" /><el-table-column label="状态"><template slot-scope="{row}">{{ reviewLabels[row.status] }}</template></el-table-column><el-table-column label="操作"><template slot-scope="{row}"><template v-if="row.status==='pending' && can('DiamondDistributorEdit')"><el-button type="text" @click="reviewApplication(row,true)">通过</el-button><el-button type="text" @click="reviewApplication(row,false)">不通过</el-button></template></template></el-table-column></el-table>
      </template>
      <el-table v-if="section==='commissions'" :data="rows" border>
        <el-table-column type="expand"><template slot-scope="{row}"><p>不通过原因：{{ row.reject_reason || '—' }} · 结算凭证：{{ row.settlement_evidence || '—' }}</p><p v-for="log in row.logs" :key="log.id">{{ log.created_at }} · {{ log.action }} · 操作人 {{ log.admin_id }} · {{ log.reason }}</p></template></el-table-column>
        <el-table-column label="订单号" min-width="205"><template slot-scope="{row}">{{ row.order && row.order.order_no }}</template></el-table-column><el-table-column prop="distributor_id" label="分销商ID" /><el-table-column prop="estimated_performance_amount" label="预计业绩" /><el-table-column prop="estimated_commission_amount" label="预计提成" /><el-table-column prop="confirmed_commission_amount" label="确认提成" /><el-table-column label="复核"><template slot-scope="{row}">{{ reviewLabels[row.review_status] }}</template></el-table-column><el-table-column label="结算"><template slot-scope="{row}">{{ settlementLabels[row.settlement_status] }}</template></el-table-column><el-table-column label="操作" min-width="170"><template slot-scope="{row}"><template v-if="row.review_status==='pending' && can('DiamondReview')"><el-button type="text" @click="reviewCommission(row,true)">确认</el-button><el-button type="text" @click="reviewCommission(row,false)">不通过</el-button></template><el-button v-if="row.review_status==='approved' && row.settlement_status==='pending' && can('DiamondSettle')" type="text" @click="settle(row)">登记线下结算</el-button></template></el-table-column>
      </el-table>
      <template v-if="section==='exports'">
        <div class="filters"><el-select v-model="exportType"><el-option label="钻石订单" value="orders" /><el-option label="业绩与提成" value="commissions" /><el-option label="核销记录" value="verifications" /></el-select><el-button v-if="can('DiamondExport')" type="primary" @click="makeExport(exportType)">创建导出任务</el-button></div>
        <el-alert title="导出为可由Excel打开的UTF-8 CSV。大数据任务由队列处理，可点击刷新查看结果。仅能下载本人生成的文件。" :closable="false" />
        <el-table :data="rows" border><el-table-column prop="id" label="任务ID" /><el-table-column prop="type" label="类型" /><el-table-column prop="data_num" label="行数" /><el-table-column label="状态"><template slot-scope="{row}">{{ ['生成中','已完成','失败','失败'][row.status] }}</template></el-table-column><el-table-column prop="created_at" label="创建时间" /><el-table-column label="操作"><template slot-scope="{row}"><el-button v-if="row.status===1 && can('DiamondExport')" type="text" @click="download(row.id)">下载CSV</el-button><el-button v-if="Number(row.status)===2 && can('DiamondExport')" type="text" @click="retryExport(row.id)">重试</el-button></template></el-table-column></el-table>
      </template>
      <el-pagination :current-page="page" :page-size="20" :total="total" layout="prev,pager,next,total" @current-change="load" />
    </template>
    <product-editor ref="editor" @saved="load(page)" />
    <el-dialog title="指派配送人员" :visible.sync="deliveryDialog"><p>仅变更配送人员，提成归属保持不变。</p><el-select v-model="deliveryDistributorId" filterable placeholder="选择配送分销人员"><el-option v-for="person in deliveryCandidates" :key="person.id" :value="person.id" :label="person.nickname+'（'+person.id+'）'" :disabled="deliveryOrder && person.id===deliveryOrder.user_id" /></el-select><span slot="footer"><el-button @click="deliveryDialog=false">取消</el-button><el-button type="primary" :loading="busy" :disabled="!deliveryDistributorId" @click="saveDelivery">确认指派</el-button></span></el-dialog><el-dialog title="核对商品与收货人" :visible.sync="verifyDialog" :close-on-click-modal="false"><template v-if="verificationOrder"><p>订单：{{ verificationOrder.order_no }}</p><p>联系人：{{ verificationOrder.contact_name }} · {{ verificationOrder.contact_phone }}</p><p>交付方式：{{ verificationOrder.fulfillment_method==='delivery'?'配送上门':'到店提货' }}</p><p v-if="verificationOrder.fulfillment_method==='delivery'">收货地址：{{ verificationOrder.delivery_address }}</p><p v-for="item in verificationOrder.items" :key="item.id">{{ item.snapshot.name }} ×{{ item.quantity }}</p><p>金额 ¥{{ verificationOrder.order_amount }} · 状态 {{ labels[verificationOrder.status] }}</p><el-checkbox v-model="verifiedCheck">已交付实物并核对收货人</el-checkbox></template><span slot="footer"><el-button @click="verifyDialog=false">返回</el-button><el-button type="primary" :disabled="!verifiedCheck" :loading="busy" @click="verify">确认核销</el-button></span></el-dialog>
    <el-dialog title="分销与核销授权" :visible.sync="authorizationDialog"><el-form v-if="authorization" label-width="110px"><el-form-item label="用户">{{ authorization.nickname }}（{{ authorization.id }}）</el-form-item><el-form-item label="分销身份"><el-select v-model="authorization.distributor_status"><el-option label="普通用户" value="none" /><el-option label="分销商" value="approved" /><el-option label="已取消资格" value="revoked" /></el-select></el-form-item><el-form-item label="核销权限"><el-switch v-model="authorization.can_verify_diamond" :disabled="authorization.distributor_status!=='approved'" active-text="仅核销本人归属订单" /></el-form-item></el-form><span slot="footer"><el-button type="primary" @click="saveAuthorization">保存</el-button></span></el-dialog>
  </div>
</template>

<script>
import ProductEditor from './ProductEditor'
import { diamondGet, diamondPost, diamondPut, downloadDiamondExport } from '@/api/diamond'
export default {
  components: { ProductEditor },
  computed: { agreementLabels() { return { user_agreement_id: '用户协议文章ID', privacy_agreement_id: '隐私政策文章ID', distribution_agreement_id: '分销说明文章ID' } } },
  props: { section: { type: String, required: true } },
  data() { return { titles: { goods: '商品管理', orders: '订单与核销', distributors: '分销商管理', commissions: '业绩与提成', settings: '业务配置', exports: '数据导出' }, types: { loose: '培育散货', single: '单颗钻石', jewelry: '成品钻饰' }, labels: { pending: '待核销', verified: '已核销', cancelled: '已取消' }, reviewLabels: { none: '普通用户', pending: '待确认/审核中', approved: '已通过', rejected: '未通过', revoked: '已取消资格' }, settlementLabels: { not_applicable: '未进入结算', pending: '待线下结算', settled: '已登记结算' }, rows: [], categories: [], filters: {}, dates: [], page: 1, total: 0, busy: false, settings: {}, memberTab: 'users', exportType: 'orders', verificationCode: '', verificationOrder: null, verifyDialog: false, verifiedCheck: false, authorizationDialog: false, authorization: null, deliveryDialog: false, deliveryOrder: null, deliveryDistributorId: null, deliveryCandidates: [] } },
  watch: { section() { this.filters = {}; this.dates = []; this.load(1) } },
  created() { this.load(1) },
  methods: {
    can(alias) { try { return JSON.parse(localStorage.getItem('permissionsList') || '[]').includes(alias) } catch (e) { return false } },
    params() { return { ...this.filters, exclude_loose: this.section === 'goods' ? 1 : undefined, from: this.dates && this.dates[0], to: this.dates && this.dates[1] } },
    async load(page = 1) {
      this.busy = true
      try {
        if (this.section === 'settings') { const res = await diamondGet('settings'); this.settings = { ...res.data, commission_rate: Number(res.data.commission_rate), reserve_minutes: Number(res.data.reserve_minutes) }; Object.keys(this.agreementLabels).forEach(key => { this.settings[key] = Number(res.data[key] || 0) }); return }
        this.page = page
        const resource = this.section === 'goods' ? 'products' : this.section === 'distributors' ? this.memberTab : this.section
        const res = await diamondGet(resource, { ...this.params(), page })
        this.rows = res.data.data
        this.total = res.data.total
        if (this.section === 'goods') this.categories = (await diamondGet('categories')).data
      } finally { this.busy = false }
    },
    async openDelivery(row) { this.deliveryCandidates = (await diamondGet('delivery-distributors')).data; this.deliveryOrder = row; this.deliveryDistributorId = row.delivery_distributor_id; this.deliveryDialog = true },
    async saveDelivery() { if (this.busy || !this.deliveryDistributorId) return; this.busy = true; try { await diamondPost('orders/' + this.deliveryOrder.id + '/delivery', { delivery_distributor_id: this.deliveryDistributorId }); this.deliveryDialog = false; this.$message.success('配送人员已指派'); await this.load(this.page) } finally { this.busy = false } },
    async saveSettings() { this.busy = true; try { await diamondPut('settings', this.settings); this.$message.success('配置已保存') } finally { this.busy = false } },
    async cancel(row) { await this.$confirm('取消此订单并释放对应SKU库存？', '确认取消'); await diamondPost('orders/' + row.id + '/cancel'); this.load(this.page) },
    async lookup() { this.verificationOrder = (await diamondGet('verification', { code: this.verificationCode.trim() })).data; this.verifiedCheck = false; this.verifyDialog = true },
    async verify() { this.busy = true; try { await diamondPost('verification', { code: this.verificationCode.trim(), confirmed: true }); this.verifyDialog = false; this.$message.success('核销成功，业绩待平台确认'); this.load(this.page) } finally { this.busy = false } },
    authorize(row) { this.authorization = { ...row }; if (!['none','approved','revoked'].includes(this.authorization.distributor_status)) this.authorization.distributor_status = 'none'; this.authorizationDialog = true },
    async saveAuthorization() { await diamondPut('users/' + this.authorization.id + '/distributor', this.authorization); this.authorizationDialog = false; this.load(this.page) },
    async reviewApplication(row, approved) { let reason = ''; if (!approved) reason = (await this.$prompt('请填写不通过原因', '审核', { inputValidator: value => !!value && value.trim().length > 0 })).value; else await this.$confirm('确认通过分销申请？核销权限需要另行授权。', '审核'); await diamondPost('applications/' + row.id + '/review', { approved, reason }); this.load(this.page) },
    async reviewCommission(row, approved) { let reason = ''; if (!approved) reason = (await this.$prompt('请填写不通过原因', '复核', { inputValidator: value => !!value && value.trim().length > 0 })).value; else await this.$confirm('确认订单事实，并按下单金额和比例快照确认业绩与提成？', '复核'); await diamondPost('commissions/' + row.id + '/review', { approved, reason }); this.load(this.page) },
    async settle(row) { const { value } = await this.$prompt('请填写线下已结算凭证号或备注。此操作不打款。', '登记线下结算', { inputValidator: value => !!value && value.trim().length > 0 }); await diamondPost('commissions/' + row.id + '/settle', { evidence: value }); this.load(this.page) },
    async makeExport(resource) { await diamondPost('exports', { ...this.params(), resource }); this.$message.success('导出任务已创建，请到数据导出页面下载'); if (this.section === 'exports') this.load(1) },
    async retryExport(id) { await diamondPost('exports/' + id + '/retry'); this.load(this.page) },
    async download(id) { try { await downloadDiamondExport(id) } catch (e) { this.$message.error(e.message || '下载失败') } }
  }
}
</script>
<style scoped>.filters{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}.filters .el-input{width:240px}.filters .el-select{width:170px}.settings{max-width:760px;margin-top:30px}.el-pagination{margin-top:20px}.diamond-workbench h2{margin-top:0}</style>



