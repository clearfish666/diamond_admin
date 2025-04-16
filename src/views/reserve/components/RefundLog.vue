<template>
  <el-dialog
    class="el-dialog-wallet"
    :title="data.order_no + ':售后记录'"
    :visible.sync="visible"
    :top="'2vh'"
    :close-on-click-modal="false"
    width="1000px"
    @closed="onClose()"
  >
    <el-table
      v-loading="loading"
      border
      highlight-current-row
      :data="list"
      :height="pageheight - 10"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="订单状态" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="statusColors[row.status]">
            {{ row.status | paraphrase(statusOptions) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="售后状态" width="130" align="center">
        <template slot-scope="{ row }">
          <el-popover
            :disabled="row.refund_status != -1"
            placement="bottom-start"
            max-width="280"
            trigger="hover"
            :content="row.refund_reason"
          >
            <el-tag slot="reference" :type="refundStatusColors[row.refund_status]">
              {{ row.refund_status | paraphrase(refundStatusOptions) }}
              <i v-if="row.refund_status == -1" class="el-icon-info" />
            </el-tag>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="退货类型" align="center">
        <template slot-scope="{ row }">
          {{ row.refund_type == 1 ? '退货退款' : '退款' }}
        </template>
      </el-table-column>
      <el-table-column label="退款原因" width="150" header-align="center">
        <template slot-scope="{ row }">
          <div>原因:{{ row.refund_reason }}</div>
          <div>说明:{{ row.refund_explain }}</div>
          <div v-if="row.refund_vouchers">凭证:
            <el-image
              style="width: 50px; height: 50px"
              :src="row.refund_vouchers[0]"
              :preview-src-list="row.refund_vouchers"
            /></div>
        </template>
      </el-table-column>
      <el-table-column label="退款信息" width="150" header-align="center">
        <template slot-scope="{ row }">
          <div>退款金额:{{ row.refund_price }}</div>
          <div>已退款金额:{{ row.refunded_price }}</div>
          <div>退款抵扣:{{ row.refund_deduction }}</div>
          <div>已退款抵扣:{{ row.refunded_deduction }}</div>
        </template>
      </el-table-column>
      <el-table-column label="用户是否取消" align="center">
        <template slot-scope="{ row }">
          {{ row.is_cancel == 1?'是':'否' }}
        </template>
      </el-table-column>

      refund_express_name
      refund_express_code
      refund_express_no
      refund_reject

      <el-table-column
        prop="created_at"
        label="创建时间"
        width="160"
        align="center"
      />
    </el-table>
    <pagination
      v-show="pages.total > 0"
      :total="pages.total"
      :page.sync="pages.current"
      :limit.sync="pages.limit"
      @pagination="getList()"
    />
  </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getRefundLogList } from '@/api/store/order'
import { mixin } from '@/utils/mixin'
import { getOrderStatus, getOrderRefundStatus } from '@/api/main'

export default {
  name: 'RefundLog',
  components: { Pagination },
  mixins: [mixin],
  data() {
    return {
      visible: false,
      data: {},
      search: {
        id: 0
      },
      list: [],
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      statusOptions: [],
      refundStatusOptions: [],
      statusColors: {
        0: 'info',
        1: 'primary',
        2: 'success'
      },
      refundStatusColors: {
        '-1': 'info',
        0: '',
        1: 'warning',
        2: 'primary',
        3: 'primary',
        4: 'success'
      },
      loading: false
    }
  },
  methods: {
    init(data) {
      this.visible = true
      this.getOrderStatus()
        .then(() => {
          this.getOrderRefundStatus()
            .then(() => {
              if (data) {
                this.data = Object.assign({}, data)
                this.search.id = data.id
                this.getList()
              }
            })
        })
        .catch(() => {})
    },
    getList(page = this.pages.current, loading = true) {
      if (this.loading) return
      this.loading = loading
      if (page === 1) this.pages.current = page

      getRefundLogList({ page, ...this.search, limit: this.pages.limit })
        .then((response) => {
          if (response.code !== 0) return
          this.list = response.data.data
          this.pages.total = response.data.total
        })
        .catch((error) => {
          this.$message.error(error.msg)
        })
        .finally(() => {
          this.loading = false
        })
    },
    onClose() {
      this.$reset('data', false)
    },
    async getOrderStatus() {
      await getOrderStatus()
        .then((response) => {
          if (response.data) {
            this.statusOptions = [{ value: null, label: '全部' }].concat(
              response.data
            )
          }
        })
        .catch(() => {})
    },
    async getOrderRefundStatus() {
      await getOrderRefundStatus()
        .then((response) => {
          if (response.data) {
            this.refundStatusOptions = [{ value: null, label: '全部' }].concat(
              response.data
            )
          }
        })
        .catch(() => {})
    }
  }
}
</script>
