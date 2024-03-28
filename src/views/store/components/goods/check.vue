<template>
  <el-dialog
    top="30px"
    class="el-form-dialog"
    width="80%"
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
      <el-tabs v-model="activeName">
        <el-tab-pane label="物品信息" name="first">
          <el-form-item label="等级:" prop="level">
            <el-select ref="level" v-model="baseInfoForm.level"
              ><el-option
                v-for="item in levelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <div class="el-form-item__content" style="margin-left: 20px">
            <div
              v-for="(specs, index) in specs_properties"
              :key="`o-goodsSpecs-${index}`"
              class="o-goodsSpecs"
            >
              <el-form-item v-if="index < 4" :label="specs.name">
                <el-radio-group v-model="attrs[specs.id]">
                  <el-radio
                    v-for="(item, subIndex) in specs.properties"
                    :label="item"
                    :key="`o-goodsSpecs-item${item}-${subIndex}`"
                    >{{ item }}</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="成色情况" name="second">
          <div class="el-form-item__content" style="margin-left: 20px">
            <div
              v-for="(specs, index) in specs_properties"
              :key="`o-goodsSpecs-${index}`"
              class="o-goodsSpecs"
            >
              <el-form-item v-if="index > 4 && index < 14" :label="specs.name">
                <el-radio-group v-model="attrs[specs.id]">
                  <el-radio
                    v-for="(item, subIndex) in specs.properties"
                    :label="item"
                    :key="`o-goodsSpecs-item${item}-${subIndex}`"
                    >{{ item }}</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="功能情况" name="third">
          <div class="el-form-item__content" style="margin-left: 20px">
            <div
              v-for="(specs, index) in specs_properties"
              :key="`o-goodsSpecs-${index}`"
              class="o-goodsSpecs"
            >
              <el-form-item v-if="index > 14" :label="specs.name">
                <el-radio-group v-model="attrs[specs.id]">
                  <el-radio
                    v-for="(item, subIndex) in specs.properties"
                    :label="item"
                    :key="`o-goodsSpecs-item${item}-${subIndex}`"
                    >{{ item }}</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </div>
          </div></el-tab-pane
        >
      </el-tabs>
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
import { getCategory } from "@/api/main";
import { goodsInfo, addOrUpdate } from "@/api/store/goods";
import { getCategoryAttr } from "@/api/store/category";
export default {
  name: "check",
  data() {
    return {
      visible: false,
      btnLoading: false,
      submitting: false,
      title: "新增质检",
      baseInfoForm: {
        id: 0,
        level: "S",
        cate_id: [],
      },
      //tab 第一个
      activeName: "first",
      attrs: [],
      specs_properties: [],
      active_properties: [],
      rules: {
        // express_no: [
        //   {
        //     required: true,
        //     message: "请上填写IMIE号",
        //     trigger: ["blur", "change"],
        //   },
        // ],
        level: [{ required: true, message: "请选择等级", trigger: "change" }],

        imie: [
          {
            required: true,
            message: "请上填写IMIE",
            trigger: ["blur", "change"],
          },
        ],
      },
      levelOptions: [
        {
          label: "S",
          value: "S",
        },
        {
          label: "A",
          value: "A",
        },
        {
          label: "B",
          value: "B",
        },
        {
          label: "C",
          value: "C",
        },
      ],
    };
  },
  methods: {
    init(data) {
      this.visible = true;
      if (data) {
        this.form = Object.assign({}, data);
        this.title = "编辑";

        // const category = this.$refs["category"];
        // category.panel.lazyLoad();

        if (data.id > 0) {
          let goods_id = data.id;
          goodsInfo(goods_id)
            .then(({ data: goods }) => {
              if (goods) {
                // console.log(Object.keys(goods.attrs).length);
                if (Object.keys(goods.attrs).length > 0) {
                  this.attrs = goods.attrs;
                  ["baseInfoForm"].forEach((model) => {
                    Object.keys(this[model]).forEach((key) => {
                      this[model][key] = goods[key];
                    });
                  });
                } else {
                  this.getAttr(goods.cate_id);
                  this.baseInfoForm.id = data.id;
                }

                const { pics, attrsValues } = goods;
                // 商品规格信息
                for (const i in attrsValues) {
                  attrsValues[i] = {
                    id: attrsValues[i].id,
                    name: attrsValues[i].name,
                    properties: attrsValues[i].value,
                  };
                }
                this.specs_properties = attrsValues;

                // this.tinymceVisible = true;
                // this.loading = false;
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
    async getAttr(cate_id) {
      await getCategoryAttr({ category_id: cate_id }).then((response) => {
        let attrsValues = response.data.attrsValues;

        // 商品规格信息
        for (const k in attrsValues) {
          var key = attrsValues[k].id;

          // console.log("key" + key);
          // console.log("attrs length" + this.attrs.length);

          this.$set(this.attrs, key, attrsValues[k].value[0]);
        }

        // this.attrs = this.attrs.filter(
        //   (value) => value !== undefined && value !== null && value !== ""
        // );

        // console.log("attrs" + this.attrs);
      });
    },
    onFormSubmit() {
      let tempSku = this.attrs;
      // skus

      // tempSku = tempSku.filter(
      //   (value, key) => value !== undefined && value !== null && value !== ""
      // );

      // console.log("attrs" + tempSku);
      const params = {
        ...this.baseInfoForm,
        skus: tempSku,
        step: "check",
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

          this.attrs = [];
          this.specs_properties = [];
          this.$message.success(msg + "成功，跳转至商品列表页");

          this.submitting = false;

          // const route_index = this.$store.state.tagsView.visitedViews.findIndex(
          //   (item) => item.path === this.$route.path
          // );
          // this.$store.state.tagsView.visitedViews[route_index].params = {};

          // this.$store.state.tagsView.visitedViews.splice(route_index, 1);

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
