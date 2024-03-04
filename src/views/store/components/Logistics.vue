<template>
  <el-dialog class="el-form-dialog order-refund" title="查看物流信息" :visible.sync="visible">
    <el-form
      v-loading="loading"
      class="m-auto"
      label-width="90px"
      label-position="left"
      label-suffix="："
    >
      <template v-if="1">
        <el-form-item label="快递单号"><span>{{ order.express_no }}</span></el-form-item>
        <el-form-item label="快递公司"><span>{{ order.express_name }}</span></el-form-item>
        <el-form-item label="物流信息">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.time"
              placement="top"
            >
              <el-link
                :underline="false"
                :type="index === 0?'success':'info'"
              >{{ activity.desc }}</el-link>
            </el-timeline-item>
          </el-timeline>
        </el-form-item>
      </template>
    </el-form>
  </el-dialog>
</template>

<script>
import { logistics } from '@/api/store/order'

export default {
  name: 'OrderLogistics',
  data() {
    return {
      order: [],
      activities: [],
      visible: false,
      loading: false
    }
  },
  methods: {
    init(order) {
      this.visible = true
      if (order) {
        this.order = order
        this.getList(order.id)
      }
    },
    getList(orderId, loading = true) {
      if (this.loading) return
      this.loading = loading
      logistics(orderId, { type: this.order.l_type })
        .then(({ data }) => {
          this.order.express_name = data.express_name
          this.order.express_no = data.express_no
          this.activities = data.logistics
        })
        .catch((error) => {
          this.$message.error(error.msg)
        })
        .finally(() => {
          this.loading = false
        })
    },
    onClose() {
      this.order = []
      this.activities = []
      this.$reset()
    }
  }
}
</script>
