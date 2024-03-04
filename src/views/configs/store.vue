<template>
  <div class="app-container">
    <el-form ref="forms" :model="forms" :rules="rules" label-width="220px">
      <el-tabs v-model="activeName">
        <el-tab-pane
          v-if="forms[activeName]"
          label="基础配置"
          name="basis"
          :style="'height:' + pageheight + 'px;overflow-y: auto;'"
        >
          <el-form-item :label="'订单关闭时长'" prop="order_expired">
            <el-input-number
              v-model="forms.basis.order_expired.value"
              size="small"
              :label="'订单关闭时长'"
            />
            <div class="notice">注意：订单自动关闭时长(分钟)</div>
          </el-form-item>
          <el-form-item :label="'订单确认收货时长'" prop="auto_confirm_receipt">
            <el-input-number
              v-model="forms.basis.auto_confirm_receipt.value"
              size="small"
              :label="'订单确认收货时长'"
            />
            <div class="notice">注意：订单自动确认收货时长(天)</div>
          </el-form-item>
          <el-form-item :label="'订单可售后时长'" prop="service_days">
            <el-input-number
              v-model="forms.basis.service_days.value"
              size="small"
              :label="'订单可售后时长'"
            />
            <div class="notice">注意：订单确认收货后可售后时长(天)</div>
          </el-form-item>
          <el-form-item label="退货原因" prop="return_reason_list">
            <el-input
              v-model="forms.basis.return_reason_list.value"
              type="textarea"
              :rows="10"
              :label="'退货原因'"
            />
            <div class="notice">注意：退货原因，逗号(<b>,</b>)隔开</div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="btnLoading"
              @click="onFormSubmit()"
            >
              {{ $t("table.confirm") }}
            </el-button>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane
          v-if="forms[activeName]"
          label="售后地址配置"
          name="return_address"
          :style="'height:' + pageheight + 'px;overflow-y: auto;'"
        >
          <el-form-item :label="'收件人'" prop="name">
            <el-input
              v-model="forms.return_address.name.value"
              size="small"
              :label="'收件人'"
            />
            <div class="notice">注意：收件人</div>
          </el-form-item>
          <el-form-item :label="'联系方式'" prop="phone">
            <el-input
              v-model="forms.return_address.phone.value"
              size="small"
              :label="'联系方式'"
            />
            <div class="notice">注意：联系方式</div>
          </el-form-item>
          <el-form-item :label="'收货地址'" prop="address">
            <el-input
              v-model="forms.return_address.address.value"
              size="small"
              :label="'收货地址'"
            />
            <div class="notice">收货地址</div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="btnLoading"
              @click="onFormSubmit()"
            >
              {{ $t("table.confirm") }}
            </el-button>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </div>
</template>

<script>
import { getConfig, setConfig } from '@/api/configs'
import { mixin } from '@/utils/mixin'

export default {
  name: 'SystemConfig',
  mixins: [mixin],
  data() {
    return {
      btnLoading: false,
      type: 'store',
      forms: {},
      rules: {},
      activeName: null
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getList()
    },
    getList() {
      getConfig(this.type)
        .then((response) => {
          this.activeName = response.data.groups.shift()
          this.forms = response.data.values
        })
        .catch(({ msg = '加载失败' }) => {
          this.$message.error(msg)
        })
    },
    onFormSubmit() {
      this.$refs['forms'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          setConfig({ type: this.type, data: this.forms })
            .then(({ msg }) => {
              this.$message.success(msg)
              this.getList()
            })
            .catch(() => {})
            .finally(() => {
              this.btnLoading = false
            })
        }
      })
    }
  }
}
</script>
