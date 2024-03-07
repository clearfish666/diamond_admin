<template>
  <div class="app-container">
    <el-steps slot="header" simple :active="active" finish-status="success">
      <el-step title="基本信息" />
      <el-step title="商品规格" />
      <el-step title="商品详情" />
    </el-steps>
    <el-tab-pane v-show="active === 0" label="基本信息" name="one">
      <el-form
        ref="baseInfoForm"
        :model="baseInfoForm"
        :rules="baseInfoRules"
        label-width="160px"
      >
        <!-- <el-form-item label="商品名称:" prop="name">
          <el-input v-model="baseInfoForm.name" placeholder="商品名称" clearable />
        </el-form-item> -->
        <el-form-item label="机型:" prop="cate_id">
          <el-cascader
            ref="category"
            v-model="baseInfoForm.cate_id"
            :props="category"
          />
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
        <el-form-item label="排序:" prop="sort">
          <el-input-number
            v-model="baseInfoForm.sort"
            :min="0"
            placeholder="排序"
          />
        </el-form-item>

        <el-form-item label="运费:" prop="trans_fee">
          <el-input-number
            v-model="baseInfoForm.trans_fee"
            :min="0"
            :step="1"
            :precision="2"
            placeholder="排序"
          />
        </el-form-item>
        <el-form-item label="状态:" prop="status">
          <el-radio-group v-model="baseInfoForm.status">
            <el-radio :label="0">下架</el-radio>
            <el-radio :label="1">上架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button style="margin-top: 12px" @click="next">下一步</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
    <el-tab-pane v-show="active === 1" label="物品信息" name="two">
      <el-form ref="attrs" :model="attrs" label-width="160px">
        <div class="el-form-item__content" style="margin-left: 20px">
          <div
            v-for="(specs, index) in specs_properties"
            :key="`o-goodsSpecs-${index}`"
            class="o-goodsSpecs"
          >
            <el-form-item :label="specs.name">
              <el-radio-group v-model="attrs[specs.name]">
                <el-radio
                  v-for="(item, subIndex) in specs.properties"
                  :label="subIndex"
                  :key="`o-goodsSpecs-item${item}-${subIndex}`"
                  >{{ item }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </div>
        </div>

        <el-form-item>
          <el-button style="margin-top: 12px" @click="next">下一步</el-button>
          <el-button style="margin-top: 12px" @click="prev">上一步</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
    <el-tab-pane v-show="active === 2" label="商品详情" name="three">
      <el-form
        ref="goodsDetail"
        :model="goodsDetail"
        :rules="goodsDetailRules"
        label-width="100px"
      >
        <el-form-item label="详情" prop="details" label-width="100px">
          <tinymce v-model="goodsDetail.details" :height="300" :width="1000" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="btnLoading"
            @click="submitHandle()"
          >
            {{ $t("table.confirm") }}
          </el-button>
          <el-button style="margin-top: 12px" @click="prev">上一步</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </div>
</template>

<script>
import GoodsImages from "./components/GoodsImages";
import formatGoodsImages from "./components/formatGoodsImages";
import { combine } from "@/utils";
import Tinymce from "@/components/Tinymce";
import { goodsInfo, addOrUpdate } from "@/api/store/goods";
import { getCategory } from "@/api/main";
import { getCategoryAttr } from "@/api/store/category";

export default {
  name: "StoreGoodsEdit",
  components: { GoodsImages, Tinymce },
  data() {
    return {
      active: 0,
      btnLoading: false,
      tinymceVisible: false,
      // 商品初始数据
      goodsRawData: {},
      // 基础信息
      baseInfoForm: {
        id: 0,
        name: "",
        image: "",
        cate_id: [],
        trans_fee: 0,
        pics: [],
        sort: 0,
        status: 0,
      },
      goodsPoster: [],
      goodsImages: [],
      baseInfoRules: {
        // name: [{ required: true, message: "商品名不能为空", trigger: "blur" }],
        // image: [{ required: true, message: '请上传封面图', trigger: 'change' }],
        cate_id: [{ required: true, message: "请选择机型", trigger: "change" }],
        status: [{ required: true, message: "请选择状态" }],
      },
      attrs: {
        存储容量: 0,
        购买渠道: 0,
        机身颜色: 0,
        苹果保修期时长: 0,
        边框背板: 0,
        屏幕外观: 0,
        屏幕显示: 0,
        机身弯曲情况: 0,
        前摄维修情况: 0,
        后摄维修情况: 0,
        后壳维修情况: 0,
        零件维修情况: 0,
        维修情况: 0,
        受潮情况: 0,
        售后案例情况: 0,
        开机情况: 0,
        是否可回复出厂设置: 0,
        前摄拍摄功能: 0,
        后摄拍摄功能: 0,
        通话功能: 0,
        声音功能: 0,
        iClound是否可注销: 0,
        充电功能: 0,
        无线充电功能: 0,
        无线功能: 0,
        指南针功能: 0,
        触摸功能: 0,
        面容识别功能: 0,
        屏幕传感器功能: 0,
        振动功能: 0,
        数据连接功能: 0,
        侧键: 0,
        电池健康度: 0,
      },
      goodsDetail: {
        details: "",
      },
      goodsDetailRules: {
        details: [
          { required: true, message: "请填写商品详情", trigger: "blur" },
        ],
      },
      specs_properties: [],
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
    goodsPoster(images) {
      if (Array.isArray(images) && images.length) {
        const poster = images[0];

        if (poster && poster.filename) {
          poster.filename !== this.baseInfoForm.image &&
            (this.baseInfoForm.image = poster.filename);
        }

        // 触发表单验证
        this.$refs["baseInfoForm"].validateField("image");
      } else {
        this.baseInfoForm.image = "";
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

      // 重置 图片
      this.poster = [];
      this.goodsImages = [];

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
              this.attrs = goods.attrs;

              const category = this.$refs["category"];
              category.panel.lazyLoad();

              const { pics, attrsValues } = goods;

              for (const i in pics) {
                pics[i] = { file_url: pics[i], filename: pics[i] };
              }

              // 格式化商品图片信息
              pics && (this.goodsPoster = formatGoodsImages([pics.shift()]));

              pics.length > 0 && (this.goodsImages = formatGoodsImages(pics));

              // 商品规格信息
              for (const i in attrsValues) {
                attrsValues[i] = {
                  name: attrsValues[i].name,
                  properties: attrsValues[i].value,
                };
              }
              this.specs_properties = attrsValues;

              console.log(this.attrs);

              this.tinymceVisible = true;
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
    next() {
      if (this.active === 0) {
        this.$refs["baseInfoForm"].validate((valid) => {
          if (valid) {
            this.active++;
            this.getAttr()
              .then(() => {})
              .catch(() => {});
          }
        });
      } else if (this.active === 1) {
        this.active++;
      }
    },
    prev() {
      if (this.active-- < 1) this.active = 0;
    },
    getSpecsPath(specs) {
      if (!Array.isArray(specs)) return "";
      return specs.map(({ p_name }) => p_name).join("/");
    },

    async getAttr() {
      // let category_id =
      // this.baseInfoForm.cate_id[this.baseInfoForm.cate_id.length - 1];

      await getCategoryAttr({ category_id: this.baseInfoForm.cate_id }).then(
        (response) => {
          let attrsValues = response.data.attrsValues;

          // 商品规格信息
          for (const i in attrsValues) {
            attrsValues[i] = {
              name: attrsValues[i].name,
              properties: attrsValues[i].value,
            };
          }
          this.specs_properties = attrsValues;
        }
      );
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
            name: "StoreGoodsList",
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
