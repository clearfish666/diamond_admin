<template>
  <el-dialog
    :title="form.id ? $t('table.edit') : $t('table.add')"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :top="'2vh'"
    class="el-form-dialog"
    @closed="onClose()"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="名称:" prop="name">
        <el-input v-model="form.name" placeholder="名称" clearable />
      </el-form-item>
      <el-form-item label="封面图" prop="cover">
        <local-upload
          class-name="avatar-uploader"
          @handleBeforeUpload="beforeCoverUpload"
          @handleSuccess="handleCoverSuccess"
        >
          <img v-if="form.cover" :src="showCover" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </local-upload>
        <p>点击图片可替换</p>
      </el-form-item>
      <el-form-item label="当日价格" prop="image">
        <local-upload
          class-name="avatar-uploader"
          @handleBeforeUpload="beforeAvatarUpload"
          @handleSuccess="handleAvatarSuccess"
        >
          <img v-if="form.image" :src="showImage" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </local-upload>
        <p>点击图片可替换</p>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="0">隐藏</el-radio>
          <el-radio :label="1">显示</el-radio>
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
import { addOrUpdate } from "@/api/store/link";
import LocalUpload from "@/components/Upload/LocalUpload";
import { getBaseUrl } from "@/utils/auth";

export default {
  name: "AddOrUpdate",
  components: { LocalUpload },
  data() {
    return {
      visible: false,
      btnLoading: false,
      domin: getBaseUrl(),
      showCover: "",
      showImage: "",
      form: {
        id: 0,
        name: "",
        cover: "",
        image: "",
        status: 0,
      },
      rules: {},
    };
  },
  methods: {
    init(data) {
      this.visible = true;
      this.form = Object.assign({}, data);
      this.showCover = this.domin + this.form.cover;
      this.showImage = this.domin + this.form.image;
      // this.getPosList()
      //   .then(() => {
      //     if (data) {
      //       this.form = JSON.parse(JSON.stringify(data))
      //       this.showCover = this.domin + this.form.cover
      //       this.showImage = this.domin + this.form.image
      //     }
      //   })
      //   .catch(() => { })
    },
    onFormSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.btnLoading = true;
          const s = this.form.cover.indexOf(process.env.VUE_APP_IMAGE);
          const d = this.form.image.indexOf(process.env.VUE_APP_IMAGE);
          if (s > -1) {
            this.showCover = this.domin + this.form.cover;
          }
          if (d > -1) {
            this.showImage = this.domin + this.form.image;
            // this.form.image = this.form.image.slice(process.env.VUE_APP_IMAGE.length, this.form.image.length)
          }
          addOrUpdate(this.form)
            .then(({ msg }) => {
              this.$message.success(msg);
              this.visible = false;
              this.$emit("refreshList");
            })
            .catch(() => {
              this.btnLoading = false;
            });
        }
      });
    },
    clearForm() {
      this.showImage = "";
      this.showCover = "";
      this.form = {
        id: 0,
        name: "",
        image: "",
        cover: "",
      };
    },
    onChangeUrlType() {
      this.$refs.form.clearValidate();
    },
    onClose() {
      this.btnLoading = false;
      this.clearForm();
      this.$refs["form"].resetFields();
    },
    handleCoverSuccess(response, file) {
      this.form.cover = response.data.filename;
      this.showCover = this.domin + response.data.filename;
    },
    beforeCoverUpload(file, cb) {
      const type = ["image/jpeg", "image/jpg", "image/png"];
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!type.includes(file.type)) {
        this.$message.error("上传图片只能是 " + type.join(",") + " 格式!");
        cb(false);
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2M");
        cb(false);
      }
      cb(true);
    },
    handleAvatarSuccess(response, file) {
      this.form.image = response.data.filename;
      this.showImage = this.domin + response.data.filename;
    },
    beforeAvatarUpload(file, cb) {
      const type = ["image/jpeg", "image/jpg", "image/png"];
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!type.includes(file.type)) {
        this.$message.error("上传图片只能是 " + type.join(",") + " 格式!");
        cb(false);
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2M");
        cb(false);
      }
      cb(true);
    },
    handleAvatarError(error) {
      if (JSON.parse(error.message).error.indexOf("token") !== -1) {
        this.$message.error("上传功能已失效，请重新登录");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.img-cover {
  width: 200px;
  height: auto;
}

.avatar-uploader >>> .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 178px;
  max-height: 178px;
  display: block;
}
</style>
