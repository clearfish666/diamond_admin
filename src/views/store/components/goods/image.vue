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

      <el-form-item label="详情" prop="details" label-width="100px">
        <tinymce v-model="goodsDetail.details" :height="300" :width="1000" />
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
import GoodsImages from "../GoodsImages";
import { goodsInfo, addOrUpdate } from "@/api/store/goods";
import formatGoodsImages from "../formatGoodsImages";
import Tinymce from "@/components/Tinymce";

export default {
  name: "image",
  components: { GoodsImages, Tinymce },
  data() {
    return {
      visible: false,
      btnLoading: false,
      title: "新增图片信息",
      goodsRawData: {},

      baseInfoForm: {
        id: 0,
        image: "",
      },
      goodsDetail: {
        details: "",
      },
      goodsDetailRules: {
        details: [
          { required: true, message: "请填写商品详情", trigger: "blur" },
        ],
      },
      goodsPoster: [],
      goodsImages: [],
      baseInfoRules: {
        image: [{ required: true, message: "请上传封面图", trigger: "change" }],
      },
    };
  },
  watch: {
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
                // 保留商品原始信息
                this.goodsRawData = goods;

                // 商品基础信息
                ["baseInfoForm", "goodsDetail"].forEach((model) => {
                  Object.keys(this[model]).forEach((key) => {
                    this[model][key] = goods[key];
                  });
                });

                // const category = this.$refs["category"];
                // category.panel.lazyLoad();
                console.log(this.baseInfoForm.image);

                const { pics, attrsValues } = goods;

                for (const i in pics) {
                  pics[i] = { file_url: pics[i], filename: pics[i] };
                }

                // 格式化商品图片信息
                pics && (this.goodsPoster = formatGoodsImages([pics.shift()]));

                pics.length > 0 && (this.goodsImages = formatGoodsImages(pics));

                // this.tinymceVisible = true;
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

    onFormSubmit() {
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

      // skus
      const params = {
        ...this.baseInfoForm,
        details,
        pics,
        step: "image",
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
