<template>
  <el-dialog
    top="30px"
    class="el-form-dialog"
    :title="'订单:' + form.order_no + ' 发货'"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="onClose()"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="130px">
      <el-form-item label="快递单号" prop="express_no">
        <el-input v-model="form.express_no" placeholder="快递单号" clearable />
      </el-form-item>

      <el-form-item label="IMIE" prop="check_imie">
        <el-input
          v-model="form.check_imie"
          placeholder="check_imie"
          clearable
          @keyup.enter.native="checkImie()"
        />
      </el-form-item>
      <el-form-item label="应发货的IMIE码：">
        <el-tag type="danger">{{ form.imie }}</el-tag>
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
import { ship } from "@/api/store/order";

export default {
  name: "OrderShip",
  data() {
    return {
      visible: false,
      btnLoading: false,
      form: {
        express_no: "",
        imie: "",
        check_imie: "",
      },
      rules: {
        express_no: [
          {
            required: true,
            message: "请上填写快递单号",
            trigger: ["blur", "change"],
          },
        ],
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
        this.form = Object.assign({}, data);

        if (
          data.pay_status == 1 &&
          data.status == 1 &&
          data.refund_status < 1
        ) {
          this.form.check_imie = this.form.imie;
        }
      }
    },
    onFormSubmit() {
      if (this.form.check_imie !== this.form.imie) {
        this.$message.error("发错货了哦！");
        return;
      }
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.btnLoading = true;
          const data = [];
          data.order_id = this.form.id;
          data.express_no = this.form.express_no;
          ship(data)
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
    checkImie() {
      if (this.form.check_imie !== this.form.imie) {
        this.$message.error("发错货了哦！");
      } else {
        this.$message({
          message: "IMIE校验成功",
          type: "success",
        });
      }
    },
    onClose() {
      this.btnLoading = false;
      this.$reset();
    },
  },
};
</script>
