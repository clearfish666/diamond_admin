<template>
  <div>
    <el-form-item :label="'自动获取价格开关'" prop="auto_get_price_switch">
      <el-switch
        v-model="form.auto_get_price_switch.value"
        active-value="1"
        inactive-value="0"
      />
    </el-form-item>
    <el-form-item :label="'价值usdt'" prop="to_usdt">
      <el-input-number
        v-model="form.to_usdt.value"
        :min="0"
        :step="1"
        :precision="6"
        :label="'价值usdt'"
        :disabled="form.auto_get_price_switch && form.auto_get_price_switch.value == 1"
        size="medium"
      />
      <div class="notice">注意：价值usdt(个)</div>
    </el-form-item>
    <el-form-item v-if="form.auto_to_mucg_switch" :label="'自动转换MUCG开关'" prop="auto_to_mucg_switch">
      <el-switch
        v-model="form.auto_to_mucg_switch.value"
        active-value="1"
        inactive-value="0"
      />
      <div class="notice">注意：自动配置兑换MUCG比例</div>
    </el-form-item>
    <el-form-item v-if="form.auto_to_mucnft_switch" :label="'自动转换MUCNFT开关'" prop="auto_to_mucnft_switch">
      <el-switch
        v-model="form.auto_to_mucnft_switch.value"
        active-value="1"
        inactive-value="0"
      />
      <div class="notice">注意：自动配置兑换MUCNFT比例</div>
    </el-form-item>
    <el-form-item v-if="form.auto_to_pipa_switch" :label="'自动转换PIPA开关'" prop="auto_to_pipa_switch">
      <el-switch
        v-model="form.auto_to_pipa_switch.value"
        active-value="1"
        inactive-value="0"
      />
      <div class="notice">注意：自动配置兑换PIPA比例</div>
    </el-form-item>
    <el-form-item v-if="form.auto_to_busd_switch" :label="'自动转换BUSD开关'" prop="auto_to_busd_switch">
      <el-switch
        v-model="form.auto_to_busd_switch.value"
        active-value="1"
        inactive-value="0"
      />
      <div class="notice">注意：自动配置兑换BUSD比例</div>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :loading="btnLoading"
        @click="emitclick()"
      >
        {{ $t("table.confirm") }}
      </el-button>
    </el-form-item>
  </div>
</template>

<script>

export default {
  props: {
    type: {
      type: String,
      default: ''
    },
    btnLoading: {
      type: Boolean,
      default: true
    },
    form: {
      type: Object,
      default: null
    }
  },
  methods: {
    emitclick() {
      this.$emit('onFormSubmit')
    }
  }
}
</script>
