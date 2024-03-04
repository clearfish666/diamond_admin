<template>
  <el-dialog
    class="el-dialog-wallet"
    :title="data.order_no + ':订单明细'"
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
      <el-table-column prop="name" label="商品" align="center" />
      <el-table-column label="属性图" width="120" align="center">
        <template slot-scope="{ row }">
          <el-image
            v-if="row.pic"
            style="width: 50px; height: 50px"
            :src="row.pic"
          />
        </template>
      </el-table-column>
      <el-table-column prop="attrs_string" label="属性" align="center" />
      <el-table-column prop="unit_price" label="单价" align="center" />
      <el-table-column prop="num" label="数量" align="center" />
      <el-table-column prop="total_price" label="总价" align="center" />
    </el-table>
  </el-dialog>
</template>

<script>
import { getOrderDetailedList } from '@/api/store/order'
import { mixin } from '@/utils/mixin'
import { getOrderStatus, getOrderRefundStatus } from '@/api/main'

export default {
  name: 'Detailed',
  mixins: [mixin],
  data() {
    return {
      visible: false,
      data: {},
      search: {
        id: 0
      },
      list: [],
      loading: false
    }
  },
  methods: {
    init(data) {
      this.visible = true

      if (data) {
        this.data = Object.assign({}, data)
        this.getList(data.id)
      }
    },
    getList(order_id) {
      getOrderDetailedList(order_id)
        .then((response) => {
          if (response.code !== 0) return
          this.list = response.data
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
