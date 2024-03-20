<template>
  <el-dialog
    top="30px"
    class="el-form-dialog"
    width="70%"
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="onClose()"
  >
    <el-form
      ref="baseInfoForm"
      :model="baseInfoForm"
      :rules="baseInfoRules"
      label-width="130px"
    >
      <el-form-item label="进货价:" prop="base_price">
        <el-input-number
          v-model="baseInfoForm.base_price"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="进货价"
        />
      </el-form-item>

      <el-form-item label="售卖价:" prop="price">
        <el-input-number
          v-model="baseInfoForm.price"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="售卖价"
        />
      </el-form-item>

      <el-form-item label="整备费用:" prop="fix_price">
        <el-input-number
          v-model="baseInfoForm.fix_price"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="整备费用"
        />
      </el-form-item>

      <el-form-item label="整备费用备注:" prop="fix_intro">
        <el-input
          v-model="baseInfoForm.fix_intro"
          placeholder="整备费用备注：换屏花费200"
          clearable
        />
      </el-form-item>

      <el-form-item label="运费:" prop="trans_fee">
        <el-input-number
          v-model="baseInfoForm.trans_fee"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="运费"
        />
      </el-form-item>

      <el-form-item label="排序:" prop="sort">
        <el-input-number
          v-model="baseInfoForm.sort"
          :min="0"
          placeholder="排序"
        />
      </el-form-item>
      <el-form-item label="状态:" prop="status">
        <el-radio-group v-model="baseInfoForm.status">
          <el-radio :label="0">下架</el-radio>
          <el-radio :label="1">上架</el-radio>
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
import { goodsInfo, addOrUpdate } from "@/api/store/goods";

export default {
  name: "price",
  components: {},
  data() {
    return {
      visible: false,
      btnLoading: false,
      title: "新增价格信息",
      goodsRawData: {},
      // 基础信息
      baseInfoForm: {
        id: 0,
        level: "S",
        name: "",
        trans_fee: 0,
        base_price: 0,
        price: 0,
        fix_price: 0,
        fix_intro: "",
        sort: 0,
        status: 0,
      },
      baseInfoRules: {
        price: [
          { required: true, message: "价格不能为空", trigger: "blur" },
          { validator: this.validateExampleField, trigger: "blur" },
        ],
        status: [{ required: true, message: "请选择状态" }],
      },
    };
  },
  watch: {},
  methods: {
    init(data) {
      this.visible = true;
      if (data) {
        this.form = Object.assign({}, data);
        this.title = "编辑";

        if (data.id > 0) {
          let goods_id = data.id;
          goodsInfo(goods_id)
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
                this.baseInfoForm.price = Number(this.baseInfoForm.price);
                this.baseInfoForm.trans_fee = Number(
                  this.baseInfoForm.trans_fee
                );
                this.baseInfoForm.base_price = Number(
                  this.baseInfoForm.base_price
                );
                this.baseInfoForm.fix_price = Number(
                  this.baseInfoForm.fix_price
                );

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
        }
      }
    },
    validateExampleField(rule, value, callback) {
      // 自定义验证函数，确保字段值大于0
      value = Number(value);
      if (value > 0) {
        callback(); // 验证通过
      } else {
        callback(new Error("该字段必须大于0")); // 验证失败，返回错误信息
      }
    },
    // 保存
    onFormSubmit() {
      if (this.submitting) return;
      this.submitting = true;
      // skus
      const params = {
        ...this.baseInfoForm,
        step: "price",
      };

      // Object.entries(params.skus).forEach(([key, value]) => {
      //   this.specs_properties.forEach((item, index) => {
      //     if (key == item.name) {
      //       params.skus[key] = item.properties[value];
      //     }
      //   });
      // });

      addOrUpdate(params)
        .then((data) => {
          const { msg } = {
            msg: this.isEdit ? "编辑" : "保存",
          };

          if (data.code !== 0) {
            this.$message.error(msg + "失败：" + data.msg);
            this.submitting = false;
            return;
          }
          this.$message.success(msg + "成功，跳转至商品列表页");

          this.submitting = false;

          const that = this;
          setTimeout(function () {
            Object.assign(that.$data, that.$options.data());
          }, 1000);

          this.$message.success(msg);
          this.visible = false;
          this.$emit("refreshList");
        })
        .catch((_error) => {
          this.submitting = false;
        });
    },

    onClose() {
      this.btnLoading = false;
      this.$reset("baseInfoForm");
    },
  },
};
</script>
