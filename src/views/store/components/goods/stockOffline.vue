<template>
  <el-dialog
    top="30px"
    class="el-form-dialog"
    width="50%"
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="onClose()"
  >
    <el-form
      ref="baseInfoForm"
      :model="baseInfoForm"
      :rules="rules"
      label-width="130px"
    >
      <el-form-item label="IMIE" prop="imie">
        <el-input
          v-model="baseInfoForm.imie"
          placeholder="IMIE"
          clearable
          @keyup.enter.native="getInfo()"
        />
      </el-form-item>
    </el-form>
    <el-descriptions class="margin-top" title="商品信息" :column="2" border>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-user"></i>
          名称
        </template>
        {{ baseInfoForm.name }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-mobile-phone"></i>
          属性
        </template>
        {{ baseInfoForm.phone_attr }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-tickets"></i>
          IMIE
        </template>
        {{ baseInfoForm.imie }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-office-building"></i>
          库存状态
        </template>
        {{ baseInfoForm.stock_status_txt }}
      </el-descriptions-item>
    </el-descriptions>
    <el-row :gutter="24">
      <el-col :span="8" :offset="8">
        <el-image
          v-if="baseInfoForm.image"
          style="width: 240px; height: 240px"
          :src="baseInfoForm.image"
        >
        </el-image>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        :disabled="btn_show"
        :loading="btnLoading"
        @click="submitHandle()"
      >
        {{ btn_txt }}
      </el-button>
      <el-button @click="visible = false">
        {{ $t("table.cancel") }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { stockOut, stockIn, goodsInfoByImie } from "@/api/store/goods";
import { goodsInfo, addOrUpdate } from "@/api/store/goods";

export default {
  name: "stockOffline",
  data() {
    return {
      visible: false,
      btnLoading: false,
      submitting: false,
      title: "线下出库", //弹窗标题
      btn_txt: "出库", //提交按钮文案
      btn_show: false, //提交按钮展示
      type: 1, //1出库  2回库
      baseInfoForm: {
        id: 0,
        imie: "",
        name: "",
        phone_attr: "",
        stock_status_txt: "",
        image: "",
        pics: [],
      },

      rules: {
        imie: [
          {
            required: true,
            message: "请上填写IMIE",
            trigger: ["blur", "change"],
          },
        ],
      },
    };
  },
  methods: {
    init(type) {
      this.visible = true;

      if (type === 2) {
        this.title = "线下回库";
        this.btn_txt = "回库";
      } else {
        this.title = "线下出库";
        this.btn_txt = "出库";
      }
      this.type = type;
      // if (data) {
      //   this.baseInfoForm = Object.assign({}, data);
      //   this.title = "编辑";
      // }
    },

    getInfo() {
      let temp_imie = this.baseInfoForm.imie;
      goodsInfoByImie({ imie: temp_imie })
        .then(({ data: goods }) => {
          if (goods) {
            // 保留商品原始信息
            this.goodsRawData = goods;

            // 商品基础信息
            ["baseInfoForm"].forEach((model) => {
              Object.keys(this[model]).forEach((key) => {
                this[model][key] = goods[key];
              });
            });
            if (this.baseInfoForm.pics.length > 0) {
              this.baseInfoForm.image = this.baseInfoForm.pics[0];
            }

            //出库按钮展示
            if (this.type === 1 && goods.stock_status == 1) {
              this.btn_show = true;
            }

            //  `stock_status` tinyint(3) NOT NULL DEFAULT '0' COMMENT '库存状态：0-在库 1-已出仓',

            //回库按钮展示
            if (this.type === 2 && goods.stock_status == 0) {
              this.btn_show = true;
            }

            this.loading = false;
          }
        })
        .catch(
          ({
            message: errMsg,
            response: { data: { message } } = {
              data: { message: errMsg || "获取“商品详情失败”！" },
            },
          }) => {
            console.error(message);
            this.loading = false;
          }
        );
    },
    // 保存
    submitHandle() {
      if (this.submitting) return;
      this.submitting = true;
      // skus
      const params = {
        ...this.baseInfoForm,
      };

      this.$confirm(
        `确定对[${this.baseInfoForm.name}]进行[${this.title}]操作?`,
        `${this.title}`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error",
        }
      )
        .then(() => {
          if (this.type === 1) {
            stockOut(params)
              .then(({ msg = "成功" }) => {
                this.$message.success(msg);
                this.visible = false;
                this.$emit("refreshList");
                this.submitting = false;
              })
              .catch(() => {});
          } else {
            stockIn(params)
              .then(({ msg = "成功" }) => {
                this.$message.success(msg);
                this.submitting = false;

                this.visible = false;
                this.$emit("refreshList");
              })
              .catch(() => {});
          }
        })

        .catch(() => {});

      // addOrUpdate(params)
      //   .then((data) => {
      //     const { msg } = {
      //       msg: this.isEdit ? "编辑" : "保存",
      //     };

      //     if (data.code !== 0) {
      //       this.$message.error(msg + "失败：" + data.msg);
      //       this.submitting = false;
      //       return;
      //     }
      //     this.$message.success(msg + "成功，跳转至商品列表页");

      //     this.submitting = false;

      //     const that = this;
      //     setTimeout(function () {
      //       Object.assign(that.$data, that.$options.data());
      //     }, 1000);

      //     this.$message.success(msg);
      //     this.visible = false;
      //     this.$emit("refreshList");
      //   })
      //   .catch((_error) => {
      //     this.submitting = false;
      //   });
    },

    onClose() {
      this.btnLoading = false;
      this.$reset("baseInfoForm");
    },
  },
};
</script>
