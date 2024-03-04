<template>
  <div>
    <el-form-item :label="'兑换' + type + '开关'" prop="switch">
      <el-switch
        v-model="form.switch.value"
        active-value="1"
        inactive-value="0"
      />
    </el-form-item>
    <el-form-item :label="'兑换' + type + '比例'" prop="proportion">
      <el-input-number
        v-model="form.proportion.value"
        :disabled="
          form['auto_to_' + type.toLowerCase() + '_switch'] &&
            form['auto_to_' + type.toLowerCase() + '_switch'].value == 1
        "
        :min="0"
        :step="1"
        :precision="8"
        :label="'兑换' + type + '比例'"
        size="medium"
      />
      <div class="notice">注意：1:N</div>
    </el-form-item>
    <el-form-item :label="'用户单次最低兑换' + type + '数量'" prop="user_min">
      <el-input-number
        v-model="form.user_min.value"
        :min="0"
        :step="1"
        :precision="2"
        :label="'用户单次最低兑换' + type + '数量'"
      />
      <div class="notice">注意：用户单次最低兑换{{ type }}数量,0为不限制</div>
    </el-form-item>
    <el-form-item :label="'用户单次最多兑换' + type + '数量'" prop="user_max">
      <el-input-number
        v-model="form.user_max.value"
        :min="0"
        :step="1"
        :precision="2"
        :label="'用户单次最多兑换' + type + '数量'"
      />
      <div class="notice">用户单次最多兑换{{ type }}数量,0为不限制</div>
    </el-form-item>
    <el-form-item :label="'用户单日兑换' + type + '上限'" prop="day_max">
      <el-input-number
        v-model="form.day_max.value"
        :min="0"
        :step="1"
        :precision="2"
        :label="'用户单日兑换' + type + '上限'"
      />
      <div class="notice">注意：0为不限制</div>
    </el-form-item>
    <el-form-item :label="'兑换' + type + '手续费'" prop="fee">
      <el-input-number
        v-model="form.fee.value"
        :min="0"
        :step="1"
        :precision="2"
        :label="'兑换' + type + '手续费'"
      />
      <div class="notice">注意：兑换{{ type }}手续费，单位(%)</div>
    </el-form-item>
    <el-form-item :label="'兑换' + type + '说明'" prop="instructions">
      <el-input
        v-model="form.instructions.value"
        :rows="10"
        type="textarea"
        :placeholder="'兑换' + type + '说明'"
        clearable
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="btnLoading" @click="emitclick()">
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
