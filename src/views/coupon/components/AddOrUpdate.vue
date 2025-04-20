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
      <!-- <el-form-item label="广告标识" prop="type">
        <el-select v-model="form.type" placeholder="请选择">
          <el-option v-for="item in posList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="广告类型" prop="url_type">
        <el-radio-group v-model="form.url_type" @change="onChangeUrlType">
          <el-radio :label="0">静态展示</el-radio>
          <el-radio :label="1">外部广告</el-radio>
          <el-radio :label="2">内部广告</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.url_type !== 0" label="广告链接" prop="url">
        <el-input v-model="form.url" placeholder="请输入广告链接, 如: http://www.baidu.com" clearable />
      </el-form-item> -->
      <el-form-item label="广告海报" prop="image">
        <local-upload
          class-name="avatar-uploader"
          type="ads"
          @handleBeforeUpload="beforeAvatarUpload"
          @handleSuccess="handleAvatarSuccess"
        >
          <img v-if="form.image" :src="showImage" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </local-upload>
        <p>建议尺寸{{ imageInfo }}，点击图片可替换</p>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" placeholder="排序" />
      </el-form-item>
      <el-form-item
        v-if="form.type === 0"
        label="显示间隔"
        prop="display_interval"
      >
        <el-input-number
          v-model="form.display_interval"
          :min="0"
          placeholder="显示间隔(s)"
        />
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
import { addOrUpdate } from "@/api/ad";
import { posList } from "@/api/main";
import LocalUpload from "@/components/Upload/LocalUpload";
import { getBaseUrl } from "@/utils/auth";

export default {
  name: "AddOrUpdate",
  components: { LocalUpload },
  data() {
    const validateUrl = (rule, value, callback) => {
      if (!value && [1, 2].includes(this.form.url_type)) {
        callback(new Error("请输入广告连接"));
      } else {
        callback();
      }
    };
    return {
      visible: false,
      btnLoading: false,
      domin: getBaseUrl(),
      posList: [],
      imageInfo: "",
      showImage: "",
      form: {
        id: 0,
        type: 1,
        image: "",
        url: "",
        url_type: 0,
        sort: 0,
        status: 0,
        display_interval: 0,
      },
      rules: {
        // url: [{ validator: validateUrl, trigger: ["blur", "change"] }],
        // type: [
        //   {
        //     required: true,
        //     message: "请选择广告标识",
        //     trigger: ["blur", "change"],
        //   },
        // ],
        image: [
          {
            required: true,
            message: "请上传广告海报",
            trigger: ["blur", "change"],
          },
        ],
      },
    };
  },
  methods: {
    init(data) {
      this.visible = true;
      this.getPosList()
        .then(() => {
          if (data) {
            this.form = JSON.parse(JSON.stringify(data));
            this.showImage = this.domin + this.form.image;
          }
        })
        .catch(() => {});
    },
    onFormSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.btnLoading = true;
          const s = this.form.image.indexOf(process.env.VUE_APP_IMAGE);
          if (s > -1) {
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
      this.form = {
        id: 0,
        type: "",
        image: "",
        url: "",
        url_type: 0,
        sort: 0,
        display_interval: 0,
      };
      this.imageInfo = "";
    },
    onChangeUrlType() {
      this.$refs.form.clearValidate();
    },
    onClose() {
      this.btnLoading = false;
      this.clearForm();
      this.$refs["form"].resetFields();
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
    async getPosList() {
      await posList().then((response) => {
        this.posList = response.data;
      });
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
