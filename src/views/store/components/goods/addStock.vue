<template>
  <el-dialog
    top="30px"
    class="el-form-dialog"
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
        <el-input v-model="baseInfoForm.imie" placeholder="IMIE" clearable />
      </el-form-item>

      <el-form-item label="机型:" prop="cate_id">
        <el-cascader
          ref="category"
          v-model="baseInfoForm.cate_id"
          :props="category"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="btnLoading" @click="submitHandle()">
        {{ $t("table.confirm") }}
      </el-button>
      <el-button @click="visible = false">
        {{ $t("table.cancel") }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getCategory } from "@/api/main";
import { addOrUpdate } from "@/api/store/goods";

export default {
  name: "addStock",
  data() {
    return {
      visible: false,
      btnLoading: false,
      title: "新增库存",
      baseInfoForm: {
        id: 0,
        cate_id: [],
        imie: "",
      },
      category: {
        lazy: true,
        lazyLoad(node, resolve) {
          getCategory({ pid: node.value })
            .then((response) => {
              const category = response.data.map((item) => ({
                value: item.value,
                label: item.label,
                leaf: item.pid > 0,
              }));
              resolve(category);
            })
            .catch(() => {});
        },
      },
      rules: {
        // express_no: [
        //   {
        //     required: true,
        //     message: "请上填写IMIE号",
        //     trigger: ["blur", "change"],
        //   },
        // ],
        cate_id: [{ required: true, message: "请选择机型", trigger: "change" }],

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
    init(data) {
      this.visible = true;
      if (data) {
        this.baseInfoForm = Object.assign({}, data);
        this.title = "编辑";
        console.log(this.baseInfoForm);
      }
    },
    // 保存
    submitHandle() {
      if (this.submitting) return;
      this.submitting = true;
      // skus
      const params = {
        ...this.baseInfoForm,
        step: "stock",
      };

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
      this.visible = false;
      this.$reset("baseInfoForm");
    },
  },
};
</script>
