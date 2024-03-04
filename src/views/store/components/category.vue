<template>
  <el-dialog v-loading="loading" :top="'2vh'" :title="form.id ? $t('table.edit') : $t('table.add')"
    :visible.sync="visible" :close-on-click-modal="false" class="el-form-dialog" @closed="onClose()">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="名称" clearable />
      </el-form-item>
      <el-form-item label="图标" prop="pic">
        <local-upload class-name="pic-uploader" type="category" @handleBeforeUpload="beforePicUpload"
          @handleSuccess="handlePicSuccess">
          <img v-if="form.pic" :src="showImage" class="pic">
          <i v-else class="el-icon-plus pic-uploader-icon" />
        </local-upload>
        <p>
          建议尺寸，点击图片可替换
        </p>
      </el-form-item>
      <el-form-item label="父级:" prop="sort">
        <el-select v-model="form.pid" placeholder="请选择">
          <el-option v-for="item in category" :key="item.value" :label="item.label" :value="item.value"
            :disabled="item.value > 0 && form.id == item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序:" prop="sort">
        <el-input-number v-model="form.sort" :min="0" placeholder="排序" />
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
import { addOrUpdate } from '@/api/store/category'
import LocalUpload from '@/components/Upload/LocalUpload'
import { getCategory } from '@/api/main'
import { getBaseUrl } from '@/utils/auth'

export default {
  name: 'Category',
  components: { LocalUpload },
  data() {
    return {
      loading: true,
      visible: false,
      btnLoading: false,
      showImage: '',
      domin: getBaseUrl(),
      form: {
        id: 0,
        name: null,
        pic: null,
        pid: 0,
        sort: 0
      },
      rules: {
        name: [
          {
            required: true,
            message: '名称不能为空',
            trigger: ['blur', 'change']
          }
        ],
        pid: [
          {
            required: true,
            message: '父级不能为空',
            trigger: ['blur', 'change']
          }
        ]
      },
      category: []
    }
  },
  methods: {
    init(data) {
      this.visible = true
      this.onGetCategory()
        .then(() => {
          if (data) {
            this.form = Object.assign({}, data)
            this.showImage = this.domin + this.form.pic
          }
        })
        .catch(() => { })
      this.loading = false
    },
    onFormSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          const s = this.form.pic.indexOf(process.env.VUE_APP_IMAGE)
          if (s > -1) {
            this.showImage = this.domin + this.form.pic
          }
          addOrUpdate(this.form)
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
    async onGetCategory() {
      await getCategory()
        .then((response) => {
          this.category = [{ value: 0, label: '顶级' }].concat(
            response.data
          )
        })
        .catch(() => { })
    },
    onClose() {
      this.btnLoading = false
      this.$reset()
    },
    handlePicSuccess(response, file) {
      this.form.pic = response.data.filename
      this.showImage = this.domin + response.data.filename
    },
    beforePicUpload(file, cb) {
      const type = ['image/jpeg', 'image/jpg', 'image/png']
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!type.includes(file.type)) {
        this.$message.error('上传图片只能是 ' + type.join(',') + ' 格式!')
        cb(false)
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2M')
        cb(false)
      }
      cb(true)
    },
    handlePicError(error) {
      if (JSON.parse(error.message).error.indexOf('token') !== -1) {
        this.$message.error('上传功能已失效，请重新登录')
      }
    },
    async getPosList() {
      await posList().then((response) => {
        this.posList = response.data
      })
    }
  }
}
</script>

<style scoped>
.pic-uploader>>>.el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.pic-uploader .el-upload:hover {
  border-color: #409eff;
}

.pic-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.pic {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
