<template>
  <el-dialog
    v-loading="loading"
    :top="'2vh'"
    :title="'属性编辑'"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="60%"
    class="el-form-dialog"
    @closed="onClose()"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="1024px">
      <div class="el-form-item__content" style="margin-left: 20px">
        <div
          v-for="(specs, index) in specs_properties"
          :key="`o-goodsSpecs-${index}`"
          class="o-goodsSpecs"
        >
          <div class="o-goodsSpecs-items">
            <span>规格名：</span>
            <el-tag
              :key="specs.name"
              type="success"
              :closable="specs.id > 218"
              style="height: 28px; line-height: 26px"
              @close="deleteSpecSHandle(index)"
              >{{ specs.name }}</el-tag
            >
          </div>
          <div class="o-goodsSpecs-items">
            <span>规格值：</span>
            <el-tag
              v-for="(item, subIndex) in specs.properties"
              :key="`o-goodsSpecs-item${item}-${subIndex}`"
              type="danger"
              :closable="!isInSpec"
              style="height: 28px; line-height: 26px; margin-right: 15px"
              @close="deleteSpecSItemHandle(index, subIndex)"
              >{{ item }}</el-tag
            >
            <div
              class="o-goodsSpecs__addInput el-input el-input--mini el-input-group el-input-group--append goodsSpecs"
              style="margin: 0 10px"
            >
              <input
                ref="newSpecsItemInput"
                class="el-input__inner"
                type="text"
                autocomplete="off"
                placeholder="添加规格值"
                @keyup.enter="addSpecsItemHandle(index)"
              />
              <div class="el-input-group__append">
                <el-button
                  icon="el-icon-check"
                  @click="addSpecsItemHandle(index)"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="o-goodsSpecs-items">
          <div>
            <span>添加规格：</span>
            <el-input
              ref="_newSpecs:name"
              v-model.trim="newSpecs.key"
              clearable
              size="mini"
              type="text"
              :disabled="!isCanSpecsAdd"
              class="goodsSpecs"
              @keyup.enter.native="addSpecsHandle()"
              ><span slot="prepend">规格名</span></el-input
            >
            <el-input
              ref="_newSpecs:value"
              v-model.trim="newSpecs.value"
              clearable
              size="mini"
              type="text"
              :disabled="!isCanSpecsAdd"
              class="goodsSpecs"
              @keyup.enter.native="addSpecsHandle()"
              ><span slot="prepend">规格值</span></el-input
            >
            <el-button
              size="mini"
              type="primary"
              :disabled="!isCanSpecsAdd"
              @click="addSpecsHandle()"
              >添加</el-button
            ><span
              class="u-help__block"
              style="margin-left: 8px; color: #f56c6c"
              >{{ newSpecs.tips }}</span
            >
          </div>
        </div>
      </div>
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
import { getCategoryAttr, addOrUpdateAttr } from "@/api/store/category";
import LocalUpload from "@/components/Upload/LocalUpload";
import GoodsSkuModel from "./GoodsSkuModel";
import { getCategory } from "@/api/main";
import { getBaseUrl } from "@/utils/auth";

export default {
  name: "Category",
  components: { LocalUpload },
  data() {
    return {
      loading: true,
      visible: false,
      btnLoading: false,
      category_id: 0,
      showImage: "",
      domin: getBaseUrl(),
      specs_properties: [],
      isCanSpecsAdd: true,
      isInSpec: false,
      //最新一个属性ID
      lastId: 0,
      // 添加新规格
      newSpecs: {
        key: "",
        value: "",
        tips: "",
      },
      // skus 模型
      goodsSku: new GoodsSkuModel(),
      form: {
        category_id: 0,
        specs_properties: null,
      },
      rules: {
        name: [
          {
            required: true,
            message: "名称不能为空",
            trigger: ["blur", "change"],
          },
        ],
        pid: [
          {
            required: true,
            message: "父级不能为空",
            trigger: ["blur", "change"],
          },
        ],
      },
      category: [],
    };
  },
  methods: {
    init(data) {
      this.visible = true;
      this.category_id = data.id;
      this.form.category_id = this.category_id;
      this.getAttr()
        .then(() => {})
        .catch(() => {});
      this.loading = false;
    },
    // 新增 规格
    addSpecsHandle() {
      const { key: name, value } = this.newSpecs;

      if (!name && name === "") {
        this.$refs["newSpecs:name"].focus();
        this.newSpecs.tips = "请填写规格名";
        return;
      }

      if (!value && value === "") {
        this.$refs["newSpecs:value"].focus();
        this.newSpecs.tips = "请填写规格值";
        return;
      }

      this.lastId += 1;
      let id = this.lastId;
      this.specs_properties.push({
        id,
        name,
        properties: [value],
      });

      this.newSpecs = {
        key: "",
        value: "",
        tips: "",
      };

      this.$nextTick(this.formatSkusTableData);
    },
    // 新增 规格值
    addSpecsItemHandle(index) {
      const specs = this.specs_properties[index];
      if (!specs) return;

      const input = this.$refs["newSpecsItemInput"][index];
      if (!input) return;

      const name = input.value.trim();
      if (!name && name === "") return;

      if (!Array.isArray(specs["properties"])) return;

      if (specs["properties"].includes(name)) {
        this.$alert("存在同名”规格值“，请重新输入", "提示", {
          type: "warning",
        });
        return;
      }

      specs["properties"].push(name);

      this.$set(this.specs_properties, index, specs);

      input.value = "";
      this.$nextTick(this.formatSkusTableData);
    },
    // 删除规格
    deleteSpecSHandle(index) {
      if (this.isInSpec) return;
      this.$confirm("确认删除该规格？", "提示", { type: "danger" })
        .then(() => {
          this.specs_properties.splice(index, 1);

          this.$nextTick(this.formatSkusTableData);
        })
        .catch(() => {});
    },
    // 删除规格值
    deleteSpecSItemHandle(index, subIndex) {
      if (this.isInSpec) return;
      this.$confirm("确认删除该规格值？", "提示", { type: "danger" })
        .then(() => {
          this.specs_properties[index]["properties"].splice(subIndex, 1);

          this.$nextTick(this.formatSkusTableData);
        })
        .catch(() => {});
    },
    onFormSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.btnLoading = true;
          this.form.specs_properties = this.specs_properties;
          addOrUpdateAttr(this.form)
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
    async onGetCategory() {
      await getCategory()
        .then((response) => {
          this.category = [{ value: 0, label: "顶级" }].concat(response.data);
        })
        .catch(() => {});
    },
    onClose() {
      this.btnLoading = false;
      this.$reset();
    },
    async getAttr() {
      await getCategoryAttr({ category_id: this.category_id }).then(
        (response) => {
          let attrsValues = response.data.attrsValues;

          // 商品规格信息
          for (const i in attrsValues) {
            this.lastId = attrsValues[i].id;
            attrsValues[i] = {
              id: attrsValues[i].id,
              name: attrsValues[i].name,
              properties: attrsValues[i].value,
            };
          }
          this.specs_properties = attrsValues;
        }
      );
    },
  },
};
</script>

<style scoped>
.o-goodsSpecs-items {
  margin: 10px 0;
  vertical-align: middle;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04); */
}

.goodsSpecs {
  width: 200px;
  margin-right: 10px;
}
</style>
