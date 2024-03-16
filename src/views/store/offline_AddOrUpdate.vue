<template>
  <div class="app-container">
    <el-steps slot="header" simple :active="active" finish-status="success">
      <el-step title="基本信息" />
    </el-steps>
    <el-tab-pane v-show="active === 0" label="基本信息" name="one">
      <el-form
        ref="baseInfoForm"
        :model="baseInfoForm"
        :rules="baseInfoRules"
        label-width="160px"
      >
        <el-form-item label="IMIE码:" prop="imie">
          <el-input
            v-model="baseInfoForm.imie"
            placeholder="IMIE码"
            clearable
          />
        </el-form-item>
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
        <el-form-item label="机型:" prop="cate_id">
          <el-cascader
            ref="category"
            v-model="baseInfoForm.cate_id"
            :props="category"
          />
        </el-form-item>

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
        <el-form-item prop="image" label="商品封面">
          <goods-images v-model="goodsPoster" :limit="1" />
          <p class="u-help__block">建议尺寸：800*800像素</p>
        </el-form-item>
        <el-form-item prop="pics" label="商品图片">
          <goods-images v-model="goodsImages" :limit="15" multipe="multipe" />
          <p class="u-help__block">
            建议尺寸：800*800像素，你可以拖拽图片调整顺序，最多上传15张
          </p>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="btnLoading"
            @click="submitHandle()"
          >
            {{ $t("table.confirm") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </div>
</template>

<script>
import { goodsInfo, addOrUpdate } from "@/api/store/offline";
export default {
  name: "StoreOfflineLogEdit",
  data() {
    return {
      active: 0,
      btnLoading: false,
      // 商品初始数据
      goodsRawData: {},
      // 基础信息
      baseInfoForm: {
        id: 0,
        name: "",
        date: "",
        base_price: 0,
        price: 0,
        sales_volume: 0,
      },
      baseInfoRules: {
        price: [
          { required: true, message: "价格不能为空", trigger: "blur" },
          { validator: this.validateExampleField, trigger: "blur" },
        ],
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
      },
    };
  },
  computed: {
    goods_id() {
      const {
        params: { goods_id },
      } = this.$route;

      return goods_id;
    },
    isEdit() {
      return !!this.goods_id;
    },
  },
  watch: {
    $route(to, from) {
      // 监听路由是否变化
      if (to.params.goods_id !== from.params.goods_id) {
        this.init(); // 重新加载数据
      }
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化页面数据
    init() {
      const { goods_id } = this.$route.params;

      // 重置表单
      const forms = ["baseInfoForm", "attrs", "goodsDetail"];
      forms.forEach((form) => {
        this.$refs[form] && this.$refs[form].resetFields();
      });

      if (goods_id > 0) {
        goodsInfo(goods_id)
          .then(({ data: goods }) => {
            if (goods) {
              // 保留商品原始信息
              this.goodsRawData = goods;

              // 商品基础信息
              ["baseInfoForm", "goodsDetail"].forEach((model) => {
                Object.keys(this[model]).forEach((key) => {
                  this[model][key] = goods[key];
                });
              });
   
          
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
    },
    validateExampleField(rule, value, callback) {
      // 自定义验证函数，确保字段值大于0
      value = parseFloat(value);
      if (value > 0) {
        callback(); // 验证通过
      } else {
        callback(new Error("该字段必须大于0")); // 验证失败，返回错误信息
      }
    },
    next() {
      if (this.active === 0) {
        this.$refs["baseInfoForm"].validate((valid) => {
          if (valid) {
            this.active++;
            if (
              this.attrs === null ||
              this.attrs === undefined ||
              Object.keys(this.attrs).length === 0
            ) {
              this.getAttr()
                .then(() => {})
                .catch(() => {});
            }
          }
        });
      } else if (this.active === 1) {
        this.active++;
      }
    },
    prev() {
      if (this.active-- < 1) this.active = 0;
    },
    // 保存
    submitHandle() {
      if (this.submitting) return;
      this.submitting = true;

      // 详情
      const details = this.goodsDetail.details;
      if (details.length === 0) {
        this.submitting = false;
        return;
      }

      // 图片
      const pics = [...this.goodsPoster, ...this.goodsImages].map(
        (image) => image.filename
      );

      let tempSku = this.attrs;
      // skus
      const params = {
        ...this.baseInfoForm,
        spec_type: this.spec_type,
        skus: tempSku,
        details,
        pics,
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

          if (this.isAdd) {
            this.baseInfoForm.id = 0;
          }

          if (data.code !== 0) {
            this.$message.error(msg + "失败：" + data.msg);
            this.submitting = false;
            return;
          }

          this.attrs = [];
          this.specs_properties = [];
          this.$message.success(msg + "成功，跳转至商品列表页");

          this.submitting = false;

          const route_index = this.$store.state.tagsView.visitedViews.findIndex(
            (item) => item.path === this.$route.path
          );
          this.$store.state.tagsView.visitedViews[route_index].params = {};

          this.$store.state.tagsView.visitedViews.splice(route_index, 1);

          const that = this;
          setTimeout(function () {
            Object.assign(that.$data, that.$options.data());
          }, 1000);

          this.$router.push({
            name: "StoreOfflineList",
            params: { refresh: true },
          });
        })
        .catch((_error) => {
          this.submitting = false;
        });
    },
  },
};
</script>
<style scoped>
.el-tab-pane {
  margin-top: 20px;
}

.pics-uploader {
  display: inline-block;
  width: 100px;
  height: 100px;
}

.pics-uploader >>> .el-upload {
  border: 1px dashed #d9d9d9;
  box-sizing: border-box;
  border-radius: 6px;
  width: 100px;
  height: 100px;
  line-height: 100px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.pics-uploader .el-upload:hover {
  border-color: #409eff;
}

.pics-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
}

::v-deep .el-dialog {
  width: 1000px;
}

::v-deep .filter-list-box .wrapper {
  display: inline;
  vertical-align: top;
}

.upload-images {
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: 100px;
  height: 100px;
  margin: 0 8px 8px 0;
  display: inline-block;
  position: relative;
  cursor: grabbing;
}

.upload-images .upload-image {
  width: 100%;
  height: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
}

.upload-images .upload-image > img {
  width: 100%;
}

.upload-images .upload-actions {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;
  display: none;
}

.upload-images:hover .upload-actions {
  display: block;
}

.upload-images .upload-actions i {
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}

.o-goodsSpecs-items {
  margin: 10px 0;
}

.goodsSpecs {
  width: 200px;
  margin-right: 10px;
}
</style>
