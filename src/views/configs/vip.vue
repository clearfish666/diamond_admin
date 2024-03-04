<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="110px">
      <el-form-item :label="'会员价格'" prop="price">
        <el-input-number v-model="form.basis.price.value" :min="0" :step="1" :precision="2" :label="'会员价格'" />
        <div class="notice">注意：会员价格(人民币)</div>
      </el-form-item>
      <!-- <el-form-item label="配售数量" prop="ration_list">
        <el-input v-model="form.basis.ration_list.value" type="textarea" :rows="10" placeholder="配售数量" />
        <div class="notice">注意：配售数量，英文逗号(<b>,</b>)隔开</div>
      </el-form-item> -->
      <el-form-item label="说明" prop="explain">
        <el-input v-model="form.basis.explain.value" type="textarea" :rows="10" placeholder="说明" />
      </el-form-item>
      <el-form-item label="会员赠送商品" prop="goods">
        <el-input v-model="form.basis.goods.value" :label="'会员赠送商品ID'" />
        <div class="notice">注意：会员赠送商品ID</div>
      </el-form-item>
      <el-form-item :label="'直推返粮票'" prop="grain_coupon">
        <el-input-number v-model="form.basis.grain_coupon.value" :min="0" :step="1" :precision="2" :label="'直推返粮票'" /> %
        <div class="notice">注意直推，单位(%[0-100])</div>
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
  name: 'VipConfig',
  mixins: [mixin],
  data() {
    return {
      btnLoading: false,
      type: 'vip',
      form: {},
      rules: {},
      options: []
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
