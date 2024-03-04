<template>
  <div class="app-container">
    <el-form ref="forms" :model="forms" :rules="rules" label-width="220px">
      <el-tabs v-model="activeName">
        <el-tab-pane
          v-if="forms[activeName]"
          label="转仓配置"
          name="transfer"
          :style="'height:' + pageheight + 'px;overflow-y: auto;'"
        >
          <el-form-item :label="'转仓开关'" prop="switch">
            <el-switch
              v-model="forms.transfer.switch.value"
              active-value="1"
              inactive-value="0"
            />
          </el-form-item>
          <el-form-item :label="'用户单次最低转仓数量'" prop="user_min">
            <el-input-number
              v-model="forms.transfer.user_min.value"
              :min="0"
              :step="1"
              :precision="2"
              :label="'用户单次最低转仓数量'"
            />
            <div class="notice">注意：用户单次最低转仓粮票数量,0为不限制</div>
          </el-form-item>
          <el-form-item :label="'用户单次最多转仓数量'" prop="user_max">
            <el-input-number
              v-model="forms.transfer.user_max.value"
              :min="0"
              :step="1"
              :precision="2"
              :label="'用户单次最多转仓数量'"
            />
            <div class="notice">用户单次最多转仓粮票数量,0为不限制</div>
          </el-form-item>
          <el-form-item :label="'用户单日转仓上限'" prop="day_max">
            <el-input-number
              v-model="forms.transfer.day_max.value"
              :min="0"
              :step="1"
              :precision="2"
              :label="'用户单日转仓上限'"
            />
            <div class="notice">注意：0为不限制</div>
          </el-form-item>
          <el-form-item :label="'转仓手续费'" prop="fee">
            <el-input-number
              v-model="forms.transfer.fee.value"
              :min="0"
              :step="1"
              :precision="2"
              :label="'转仓手续费'"
            />
            <div class="notice">注意：转仓手续费，单位(%)</div>
          </el-form-item>
          <el-form-item :label="'转仓说明'" prop="instructions">
            <el-input
              v-model="forms.transfer.instructions.value"
              :rows="10"
              type="textarea"
              :placeholder="'转仓说明'"
              clearable
            />
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
          label="兑换粮票配置"
          name="exchange_food_stamps"
          :style="'height:' + pageheight + 'px;overflow-y: auto;'"
        >
          <el-form-item :label="'兑换开关'" prop="switch">
            <el-switch
              v-model="forms.exchange_food_stamps.switch.value"
              active-value="1"
              inactive-value="0"
            />
          </el-form-item>
          <el-form-item :label="'兑换比例'" prop="proportion">
            <el-input-number
              v-model="forms.exchange_food_stamps.proportion.value"
              :min="0"
              :step="1"
              :precision="2"
              :label="'兑换比例'"
              size="medium"
            />
            <div class="notice">注意：1:N</div>
          </el-form-item>
          <el-form-item :label="'用户单次最低兑换数量'" prop="user_min">
            <el-input-number
              v-model="forms.exchange_food_stamps.user_min.value"
              :min="0"
              :step="1"
              :precision="2"
              :label="'用户单次最低兑换数量'"
            />
            <div class="notice">注意：用户单次最低兑换粮票数量,0为不限制</div>
          </el-form-item>
          <el-form-item :label="'用户单次最多兑换数量'" prop="user_max">
            <el-input-number
              v-model="forms.exchange_food_stamps.user_max.value"
              :min="0"
              :step="1"
              :precision="2"
              :label="'用户单次最多兑换数量'"
            />
            <div class="notice">用户单次最多兑换粮票数量,0为不限制</div>
          </el-form-item>
          <el-form-item :label="'用户单日兑换上限'" prop="day_max">
            <el-input-number
              v-model="forms.exchange_food_stamps.day_max.value"
              :min="0"
              :step="1"
              :precision="2"
              :label="'用户单日兑换上限'"
            />
            <div class="notice">注意：0为不限制</div>
          </el-form-item>
          <el-form-item :label="'兑换手续费'" prop="fee">
            <el-input-number
              v-model="forms.exchange_food_stamps.fee.value"
              :min="0"
              :step="1"
              :precision="2"
              :label="'兑换手续费'"
            />
            <div class="notice">注意：兑换粮票手续费，单位(%)</div>
          </el-form-item>
          <el-form-item :label="'兑换说明'" prop="instructions">
            <el-input
              v-model="forms.exchange_food_stamps.instructions.value"
              :rows="10"
              type="textarea"
              :placeholder="'兑换说明'"
              clearable
            />
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
  name: 'RationEquityConfig',
  mixins: [mixin],
  data() {
    return {
      btnLoading: false,
      type: 'ration_equity_wallet',
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

<style scoped>
.el-input-number {
  width: 200px;
}
.notice {
  color: #909399;
  font-size: 12px;
}
</style>
