<template>
  <el-dialog
    v-loading="loading"
    :top="'2vh'"
    :title="form.user_id ? $t('table.edit') : $t('table.add')"
    :visible.sync="visible"
    :close-on-click-modal="false"
    class="el-form-dialog"
    @closed="onClose()"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="等级" prop="level">
        <el-radio-group v-model="form.level" size="mini">
          <el-radio-button v-for="(item,index) in levelOptions" :key="index" :label="item.value">{{ item.label }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="btnLoading" @click="onFormSubmit()">
        {{ $t("table.confirm") }}
      </el-button>
      <el-button @click="visible = false">
        {{ $t("table.cancel") }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { change } from '@/api/vip'
import { getUserLevel } from '@/api/main'

export default {
  name: 'VipLevelChange',
  data() {
    return {
      loading: true,
      visible: false,
      btnLoading: false,
      form: {
        id: 0,
        user_id: 0,
        level: null
      },
      rules: {},
      levelOptions: []
    }
  },
  methods: {
    init(data) {
      this.visible = true
      this.onGetUserLevel(data.id)
        .then(() => {
          if (data) {
            this.form = Object.assign({}, data)
          }
        })
        .catch(() => {})
      this.loading = false
    },
    async onGetUserLevel() {
      await getUserLevel()
        .then((response) => {
          this.levelOptions = response.data
        })
        .catch(() => {})
    },
    onFormSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          change(this.form)
            .then(({ msg }) => {
              this.$message.success(msg)
              this.visible = false
              this.$emit('refreshList')
            })
            .catch(() => {
              this.btnLoading = false
            })
        }
      })
    },
    onClose() {
      this.btnLoading = false
      this.$reset()
    }
  }
}
</script>
