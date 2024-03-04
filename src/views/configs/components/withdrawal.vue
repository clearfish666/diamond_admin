<template>
  <div>
    <el-form-item label="提现开关" prop="switch">
      <el-switch
        v-model="form.switch.value"
        active-value="1"
        inactive-value="0"
      />
    </el-form-item>
    <el-form-item label="单日免审核额度" prop="no_need_audit_limit">
      <el-input-number
        v-model="form.no_need_audit_limit.value"
        :min="0"
        :step="1"
        :precision="6"
        label="单日免审核额度"
      />
      <div class="notice">单日免审核额度</div>
    </el-form-item>
    <el-form-item label="用户单次最低提现数量" prop="user_min">
      <el-input-number
        v-model="form.user_min.value"
        :min="0"
        :step="1"
        :precision="2"
        label="用户单次最低提现数量"
      />
      <div class="notice">注意：用户单次最低提现数量,0为不限制</div>
    </el-form-item>
    <el-form-item label="用户单次最多提现数量" prop="user_max">
      <el-input-number
        v-model="form.user_max.value"
        :min="0"
        :step="1"
        :precision="2"
        label="用户单次最多提现数量"
      />
      <div class="notice">用户单次最多提现数量,0为不限制</div>
    </el-form-item>
    <el-form-item label="用户单日提现上限" prop="day_max">
      <el-input-number
        v-model="form.day_max.value"
        :min="0"
        :step="1"
        :precision="2"
        label="用户单日提现上限"
      />
      <div class="notice">注意：0为不限制</div>
    </el-form-item>
    <el-form-item label="提现手续费" prop="fee">
      <el-input-number
        v-model="form.fee.value"
        :min="0"
        :step="1"
        :precision="2"
        label="提现手续费"
      />
      <div class="notice">注意：提现手续费，单位(%)</div>
    </el-form-item>
    <el-form-item label="提现说明" prop="instructions">
      <el-input
        v-model="form.instructions.value"
        :rows="10"
        type="textarea"
        placeholder="提现说明"
        clearable
      />
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
