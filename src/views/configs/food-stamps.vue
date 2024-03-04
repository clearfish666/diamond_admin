<template>
  <div class="app-container">
    <el-form ref="form" name="basis" :model="form" :rules="rules" label-width="110px">
      <el-form-item :label="'粮票单价'" prop="to_cny">
        <el-input-number v-model="form.basis.to_cny.value" :min="0" :step="1" :precision="2" :label="'粮票单价'" />
        <div class="notice">注意：粮票单价(人民币)</div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="btnLoading" @click="onFormSubmit()">
          {{ $t('table.confirm') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getConfig, setConfig } from '@/api/configs'
import { mixin } from '@/utils/mixin'

export default {
  name: 'FoodStampsConfig',
  mixins: [mixin],
  data() {
    return {
      btnLoading: false,
      type: 'food_stamps_wallet',
      form: {},
      rules: {}
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
          this.form = response.data.values
        })
        .catch(({ msg = '加载失败' }) => {
          this.$message.error(msg)
        })
    },
    onFormSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          setConfig({ type: this.type, data: this.form })
            .then(({ msg }) => {
              this.$message.success(msg)
              this.getList()
            })
            .catch(() => { })
            .finally(() => {
              this.btnLoading = false
            })
        }
      })
    }
  }
}
</script>
