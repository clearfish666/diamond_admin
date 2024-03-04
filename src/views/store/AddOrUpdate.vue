<template>
  <div class="app-container">
    <el-steps slot="header" simple :active="active" finish-status="success">
      <el-step title="基本信息" />
      <el-step title="商品规格" />
      <el-step title="商品详情" />
    </el-steps>
    <el-tab-pane v-show="active === 0" label="基本信息" name="one">
      <el-form ref="baseInfoForm" :model="baseInfoForm" :rules="baseInfoRules" label-width="160px">
        <el-form-item label="商品名称:" prop="name">
          <el-input v-model="baseInfoForm.name" placeholder="商品名称" clearable />
        </el-form-item>
        <el-form-item prop="image" label="商品封面">
          <goods-images v-model="goodsPoster" :limit="1" />
          <p class="u-help__block">建议尺寸：800*800像素</p>
        </el-form-item>
        <el-form-item prop="pics" label="商品图片">
          <goods-images v-model="goodsImages" :limit="15" multipe="multipe" />
          <p class="u-help__block">建议尺寸：800*800像素，你可以拖拽图片调整顺序，最多上传15张</p>
        </el-form-item>
        <el-form-item label="排序:" prop="sort">
          <el-input-number v-model="baseInfoForm.sort" :min="0" placeholder="排序" />
        </el-form-item>
        <el-form-item label="分类:" prop="cate_id">
          <el-cascader ref="category" v-model="baseInfoForm.cate_id" :props="category" />
        </el-form-item>
        <el-form-item label="运费:" prop="trans_fee">
          <el-input-number v-model="baseInfoForm.trans_fee" :min="0" :step="1" :precision="2" placeholder="排序" />
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
    <el-tab-pane v-show="active === 1" label="商品规格" name="two">
      <el-form ref="goodsSku" :model="goodsSku" :rules="goodsSkuRules" label-width="160px">
        <el-form-item label="规格列表:">
          <div class="el-form-item__content" style="margin-left: 20px">
            <div v-for="(specs, index) in specs_properties" :key="`o-goodsSpecs-${index}`" class="o-goodsSpecs">
              <div class="o-goodsSpecs-items">
                <span>规格名：</span>
                <el-tag :key="specs.name" type="success" :closable="!isInSpec" style="height: 28px; line-height: 26px"
                  @close="deleteSpecSHandle(index)">{{ specs.name }}</el-tag>
              </div>
              <div class="o-goodsSpecs-items">
                <span>规格值：</span>
                <el-tag v-for="(item, subIndex) in specs.properties" :key="`o-goodsSpecs-item${item}-${subIndex}`"
                  type="danger" :closable="!isInSpec" style="height: 28px; line-height: 26px; margin-right: 15px"
                  @close="deleteSpecSItemHandle(index, subIndex)">{{ item }}</el-tag>
                <div
                  class="o-goodsSpecs__addInput el-input el-input--mini el-input-group el-input-group--append goodsSpecs"
                  style="margin: 0 10px">
                  <input ref="newSpecsItemInput" class="el-input__inner" type="text" autocomplete="off"
                    placeholder="添加规格值" @keyup.enter="addSpecsItemHandle(index)">
                  <div class="el-input-group__append">
                    <el-button icon="el-icon-check" @click="addSpecsItemHandle(index)" />
                  </div>
                </div>
              </div>
            </div>
            <div class="o-goodsSpecs-items">
              <div>
                <span>添加规格：</span>
                <el-input ref="_newSpecs:name" v-model.trim="newSpecs.key" clearable size="mini" type="text"
                  :disabled="!isCanSpecsAdd" class="goodsSpecs" @keyup.enter.native="addSpecsHandle()"><span
                    slot="prepend">规格名</span></el-input>
                <el-input ref="_newSpecs:value" v-model.trim="newSpecs.value" clearable size="mini" type="text"
                  :disabled="!isCanSpecsAdd" class="goodsSpecs" @keyup.enter.native="addSpecsHandle()"><span
                    slot="prepend">规格值</span></el-input>
                <el-button size="mini" type="primary" :disabled="!isCanSpecsAdd"
                  @click="addSpecsHandle()">添加</el-button><span class="u-help__block"
                  style="margin-left: 8px; color: #f56c6c">{{ newSpecs.tips }}</span>
              </div>
            </div>
            <p v-if="!isInSpec" class="u-help__block">
              “规格”最多添加3种，“规格值”数量不限，建议不超过5个
            </p>
          </div>
        </el-form-item>
        <el-form-item label="规格明细:">
          <div class="el-form-item__content" style="margin-left: 20px">
            <el-table border="border" stripe="stripe" :data="skus">
              <el-table-column prop="image" label="商品图片" align="center" width="120px"><template
                  slot-scope="{ row, $index }">
                  <goods-images :limit="1" :src="row.image" placeholder="添加规格图"
                    @change="specsImageChangeHandle($index, arguments)" /> </template></el-table-column>
              <el-table-column v-for="(specs, index) in specs_properties" :key="index" align="center"
                :label="specs.name" :prop="`specs_properties[${index}][p_name]`" />
              <el-table-column prop="original_price" :label="'原价(元)'" align="center" min-width="150"><template
                  slot-scope="{ row, $index }">
                  <el-form-item class="el-form-item--error-center" style="margin-top: 20px"
                    :rules="goodsSkuRules['original_price']" :props="`skus[${$index}][original_price]`">
                    <el-input-number v-model.number="row.original_price" size="mini" :min="0" :step="1"
                      :precision="2" />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column prop="price" :label="'售价(元)'" align="center" min-width="150"><template
                  slot-scope="{ row, $index }">
                  <el-form-item class="el-form-item--error-center" style="margin-top: 20px"
                    :rules="goodsSkuRules['price']" :props="`skus[${$index}][price]`">
                    <el-input-number v-model.number="row.price" size="mini" :min="0" :step="1" :precision="2" />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column prop="deduction" :label="'粮票抵扣(%)'" align="center" min-width="150"><template
                  slot-scope="{ row, $index }">
                  <el-form-item class="el-form-item--error-center" style="margin-top: 20px"
                    :rules="goodsSkuRules['deduction']" :props="`skus[${$index}][deduction]`">
                    <el-input-number v-model.number="row.deduction" size="mini" :min="0" :max="100" :step="1"
                      :precision="2" />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column prop="stock_num" label="库存" align="center" min-width="150"><template
                  slot-scope="{ row, $index }">
                  <el-form-item class="el-form-item--error-center" :props="`skus[${$index}][stock_num]`"
                    :rules="goodsSkuRules['stock_num']" style="margin-top: 20px">
                    <el-input-number v-model.number="row.stock_num" size="mini" :min="0" :step="1" :precision="0" />
                  </el-form-item>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="skus.length &gt; 1" class="page-edit__table-ft">
              <el-form inline="inline" size="mini" label-suffix="：" label-width="85px"><span
                  style="margin-right: 15px">批量设置：</span><template v-if="!customInput.show">
                  <el-button v-for="(label, key) in customInputMaps" :key="key" type="text"
                    @click="switchCustomInputStatus(key)">{{ label }}</el-button>
                </template>
                <template v-else>
                  <el-input-number v-model.number="customInput.value" size="mini" :min="0" :step="1" :precision="2"
                    controls-position="right" />
                  <el-button-group style="margin-left: 15px">
                    <el-button size="mini" @click="applyCustomInput()">设置{{ customInputMaps[customInput.key]
                    }}</el-button>
                    <el-button size="mini" icon="el-icon-close" @click="switchCustomInputStatus()" />
                  </el-button-group> </template></el-form>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button style="margin-top: 12px" @click="next">下一步</el-button>
          <el-button style="margin-top: 12px" @click="prev">上一步</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
    <el-tab-pane v-show="active === 2" label="商品详情" name="three">
      <el-form ref="goodsDetail" :model="goodsDetail" :rules="goodsDetailRules" label-width="100px">
        <el-form-item label="详情" prop="details" label-width="100px">
          <tinymce v-model="goodsDetail.details" :height="300" :width="1000" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="btnLoading" @click="submitHandle()">
            {{ $t("table.confirm") }}
          </el-button>
          <el-button style="margin-top: 12px" @click="prev">上一步</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </div>
</template>

<script>
import GoodsImages from './components/GoodsImages'
import formatGoodsImages from './components/formatGoodsImages'
import GoodsSkuModel from './components/GoodsSkuModel'
import { combine } from '@/utils'
import Tinymce from '@/components/Tinymce'
import { goodsInfo, addOrUpdate } from '@/api/store/goods'
import { getCategory } from '@/api/main'

export default {
  name: 'StoreGoodsEdit',
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
        name: '',
        image: '',
        cate_id: [],
        trans_fee: 0,
        pics: [],
        sort: 0,
        status: 0
      },
      goodsPoster: [],
      goodsImages: [],
      baseInfoRules: {
        name: [{ required: true, message: '商品名不能为空', trigger: 'blur' }],
        // image: [{ required: true, message: '请上传封面图', trigger: 'change' }],
        cate_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态' }]
      },
      skusForm: {},
      skusRules: {
        original_price: [{
          required: true,
          validator(_rule, value, callback) {
            if (!/^[0-9]\d*(?:\.\d{1,2})?$/.test(value)) { return callback(new Error('原价必须为数字，保留两位小数')) } else callback()
          }
        }],
        price: [{
          required: true,
          validator(_rule, value, callback) {
            if (!/^[0-9]\d*(?:\.\d{1,2})?$/.test(value)) { return callback(new Error('售价必须为数字，保留两位小数')) } else callback()
          }
        }],
        stock_num: [{ required: true, message: '请设置库存', trigger: 'blur' }]
      },
      goodsDetail: {
        details: ''
      },
      goodsDetailRules: {
        details: [{ required: true, message: '请填写商品详情', trigger: 'blur' }]
      },
      specs_properties: [],
      isCanSpecsAdd: true,
      isInSpec: false,
      // skus 模型
      goodsSku: new GoodsSkuModel(),
      goodsSkuRules: {
        original_price: [{
          required: true,
          validator(_rule, value, callback) {
            if (!/^[0-9]\d*(?:\.\d{1,2})?$/.test(value)) { return callback(new Error('原价必须为数字，保留两位小数')) } else callback()
          }
        }],
        price: [
          {
            required: true,
            validator(_rule, value, callback) {
              if (!/^[0-9]\d*(?:\.\d{1,2})?$/.test(value)) { return callback(new Error('售价必须为数字，保留两位小数')) } else callback()
            }
          }
        ],
        stock_num: [{ required: true, message: '请设置库存', trigger: 'blur' }]
      },
      // 添加新规格
      newSpecs: {
        key: '',
        value: '',
        tips: ''
      },
      // 批量设置
      customInput: {
        show: false,
        value: 0
      },
      skus: [],
      category: {
        lazy: true,
        lazyLoad(node, resolve) {
          getCategory({ pid: node.value })
            .then((response) => {
              const category = response.data.map(item => ({
                value: item.value,
                label: item.label,
                leaf: item.pid > 0
              }))
              resolve(category)
            })
            .catch(() => { })
        }
      }
    }
  },
  computed: {
    customInputMaps() {
      const baseMaps = {
        original_price: '原价',
        price: '售价',
        deduction: '抵扣',
        stock_num: '库存'
      }

      return baseMaps
    },
    goods_id() {
      const {
        params: { goods_id }
      } = this.$route

      return goods_id
    },
    isEdit() {
      return !!this.goods_id
    }
  },
  watch: {
    $route(to, from) {
      // 监听路由是否变化
      if (to.params.goods_id !== from.params.goods_id) {
        this.init() // 重新加载数据
      }
    },
    goodsPoster(images) {
      if (Array.isArray(images) && images.length) {
        const poster = images[0]

        if (poster && poster.filename) {
          poster.filename !== this.baseInfoForm.image &&
            (this.baseInfoForm.image = poster.filename)
        }

        // 触发表单验证
        this.$refs['baseInfoForm'].validateField('image')
      } else {
        this.baseInfoForm.image = ''
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 初始化页面数据
    init() {
      const { goods_id } = this.$route.params

      // 重置表单
      const forms = ['baseInfoForm', 'goodsSku', 'goodsDetail']
      forms.forEach(form => {
        this.$refs[form] && this.$refs[form].resetFields()
      })

      // 重置 图片
      this.poster = []
      this.goodsImages = []

      if (goods_id > 0) {
        goodsInfo(goods_id).then(({ data: goods }) => {
          if (goods) {
            // 保留商品原始信息
            this.goodsRawData = goods;

            // 商品基础信息
            ['baseInfoForm', 'goodsDetail'].forEach(model => {
              Object.keys(this[model]).forEach(key => {
                this[model][key] = goods[key]
              })
            })

            const category = this.$refs['category']
            category.panel.lazyLoad()

            const { skus, pics, attrsValues } = goods

            for (const i in pics) {
              pics[i] = { file_url: pics[i], filename: pics[i] }
            }

            // 格式化商品图片信息
            pics && (this.goodsPoster = formatGoodsImages([pics.shift()]))

            pics.length > 0 && (this.goodsImages = formatGoodsImages(pics))

            // 商品规格信息
            for (const i in attrsValues) {
              attrsValues[i] = {
                name: attrsValues[i].name,
                properties: attrsValues[i].value
              }
            }
            this.specs_properties = attrsValues

            this.skus = skus.map(v => {
              return {
                id: v.id,
                stock_num: v.stock,
                original_price: v.original_price,
                price: v.price,
                deduction: v.deduction,
                image: v.pic,
                specs_properties: v.attrs.map(s => {
                  return {
                    p_id: s.v_id,
                    p_name: s.value,
                    s_id: s.n_id,
                    s_name: s.name
                  }
                })
              }
            })
            this.tinymceVisible = true
            this.loading = false
          }
        })
          .catch(
            ({
              message: errMsg,
              response: { data: { message } } = {
                data: { message: errMsg || '获取“商品详情失败”！' }
              }
            }) => {
              console.error(message)
              this.loading = false
            }
          )
      }
    },
    next() {
      if (this.active === 0) {
        this.$refs['baseInfoForm'].validate(valid => {
          if (valid) {
            this.active++
          }
        })
      } else if (this.active === 1) {
        if (!this.skus.length) {
          this.$message.error('至少添加一个规格值')
        }
        let skuNum = 0
        this.skus.forEach(_v => {
          if (!_v.image) {
            this.$message.error('请添加[' + _v.specs_properties[0].s_name + '：' + _v.specs_properties[0].p_name + ']规格图片')
            return
          }
          skuNum++
        })
        if (skuNum === this.skus.length) {
          this.active++
        }
      }
    },
    prev() {
      if (this.active-- < 1) this.active = 0
    },
    getSpecsPath(specs) {
      if (!Array.isArray(specs)) return ''
      return specs.map(({ p_name }) => p_name).join('/')
    },
    // 根据规格列表生成规格详情列表
    formatSkusTableData() {
      // 1. 规格组合
      const groups = combine(
        this.specs_properties.map((o) => {
          return o.properties.map((p) => ({ s_name: o.name, p_name: p }))
        })
      )

      // 2. 构建默认 skus
      const defaultData = groups.map((properties) => {
        properties = properties.reverse()
        const path = this.getSpecsPath(properties)

        // 商品编辑前的 SKUS 信息
        const rawItem = (this.goodsRawData.skus || [])
          .map((v) => {
            return {
              stock_num: v.stock,
              price: v.price,
              image: v.pic,
              specs_properties: (v.attrs || []).map((s) => {
                return {
                  p_id: s.v_id,
                  p_name: s.value,
                  s_id: s.n_id,
                  s_name: s.name
                }
              })
            }
          })
          .filter(
            (o) =>
              o.path === path || this.getSpecsPath(o.specs_properties) === path
          )[0]

        // 商品修改后的 SKUS 信息
        const newItem = this.skus.filter((o) => {
          return (
            o.path === path || this.getSpecsPath(o.specs_properties) === path
          )
        })[0]

        const item = new GoodsSkuModel({
          ...rawItem,
          ...newItem,
          ...this.skus[0],
          specs_properties: properties
        })
        return item
      })
      this.$nextTick(() => {
        this.skus = defaultData
      })
    },
    // 新增 规格
    addSpecsHandle() {
      const { key: name, value } = this.newSpecs

      if (!name && name === '') {
        this.$refs['newSpecs:name'].focus()
        this.newSpecs.tips = '请填写规格名'
        return
      }

      if (!value && value === '') {
        this.$refs['newSpecs:value'].focus()
        this.newSpecs.tips = '请填写规格值'
        return
      }

      this.specs_properties.push({
        name,
        properties: [value]
      })

      this.newSpecs = {
        key: '',
        value: '',
        tips: ''
      }

      this.$nextTick(this.formatSkusTableData)
    },
    // 新增 规格值
    addSpecsItemHandle(index) {
      const specs = this.specs_properties[index]
      if (!specs) return

      const input = this.$refs['newSpecsItemInput'][index]
      if (!input) return

      const name = input.value.trim()
      if (!name && name === '') return

      if (!Array.isArray(specs['properties'])) return

      if (specs['properties'].includes(name)) {
        this.$alert('存在同名”规格值“，请重新输入', '提示', {
          type: 'warning'
        })
        return
      }

      specs['properties'].push(name)

      this.$set(this.specs_properties, index, specs)

      input.value = ''
      this.$nextTick(this.formatSkusTableData)
    },
    // 删除规格
    deleteSpecSHandle(index) {
      if (this.isInSpec) return
      this.$confirm('确认删除该规格？', '提示', { type: 'danger' })
        .then(() => {
          this.specs_properties.splice(index, 1)

          this.$nextTick(this.formatSkusTableData)
        })
        .catch(() => { })
    },
    // 删除规格值
    deleteSpecSItemHandle(index, subIndex) {
      if (this.isInSpec) return
      this.$confirm('确认删除该规格值？', '提示', { type: 'danger' })
        .then(() => {
          this.specs_properties[index]['properties'].splice(subIndex, 1)

          this.$nextTick(this.formatSkusTableData)
        })
        .catch(() => { })
    },
    specsImageChangeHandle(index, [[image]]) {
      this.$set(this.skus, index, {
        ...this.skus[index],
        image: image ? image.filename : ''
      })
    },
    // 显示隐藏批量设置输入框
    switchCustomInputStatus(key) {
      this.customInput.show = !!(this.customInput.key = key)
      key || (this.customInput.value = '')
    },
    // 应用用户输入
    applyCustomInput() {
      const { key, value } = this.customInput
      if (!key || value === '') return

      this.skus = this.skus.map((sku) => ({
        ...sku,
        [key]: value
      }))

      this.switchCustomInputStatus()
    },
    // 保存
    submitHandle() {
      if (this.submitting) return
      this.submitting = true

      // 详情
      const details = this.goodsDetail.details
      if (details.length === 0) {
        this.submitting = false
        return
      }

      // 图片
      const pics = [...this.goodsPoster, ...this.goodsImages].map(
        image => image.filename
      )

      // skus
      const params = {
        ...this.baseInfoForm,
        spec_type: this.spec_type,
        specs_properties: this.specs_properties,
        skus: this.skus,
        details,
        pics
      }
      params.attrs = params.specs_properties.map(v => {
        return {
          name: v.name,
          value: v.properties
        }
      })

      params.skus = params.skus.map(v => {
        return {
          stock: v.stock_num,
          original_price: v.original_price,
          price: v.price,
          deduction: v.deduction,
          pic: v.image,
          attrs: v.specs_properties.map(x => {
            return {
              name: x.s_name,
              value: x.p_name
            }
          })
        }
      })

      addOrUpdate(params)
        .then(data => {
          const { msg } = {
            msg: this.isEdit
              ? '编辑'
              : '保存'
          }

          if (this.isAdd) {
            this.baseInfoForm.id = 0
          }

          if (data.code !== 0) {
            this.$message.error(msg + '失败：' + data.msg)
            this.submitting = false
            return
          }

          this.skus = []
          this.specs_properties = []
          this.$message.success(msg + '成功，跳转至商品列表页')

          this.submitting = false

          const route_index = this.$store.state.tagsView.visitedViews.findIndex(
            (item) => item.path === this.$route.path
          )
          this.$store.state.tagsView.visitedViews[route_index].params = {}

          this.$store.state.tagsView.visitedViews.splice(route_index, 1)

          const that = this
          setTimeout(function () {
            Object.assign(that.$data, that.$options.data())
          }, 1000)

          this.$router.push({
            name: 'StoreGoodsList',
            params: { refresh: true }
          })
        }
        )
        .catch(_error => {
          this.submitting = false
        }
        )
    }
  }
}
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

.pics-uploader>>>.el-upload {
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

.upload-images .upload-image>img {
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
