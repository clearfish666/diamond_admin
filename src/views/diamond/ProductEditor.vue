<template>
  <el-dialog title="商品与可售规格" :visible.sync="visible" width="92%" :close-on-click-modal="false" :show-close="!uploading" :close-on-press-escape="!uploading">
    <el-form label-width="110px">
      <el-row :gutter="20">
        <el-col v-if="form.product_type!=='loose'" :span="12"><el-form-item label="商品名称"><el-input v-model="form.name" maxlength="150" /></el-form-item></el-col>
        <el-col v-if="form.product_type!=='loose'" :span="12"><el-form-item label="商品编号"><el-input v-model="form.goods_no" maxlength="64" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="业务类型"><el-select v-model="form.product_type" :disabled="!!form.id" @change="form.categories=[]"><el-option v-for="(text,key) in types" :key="key" :label="text" :value="key" v-if="key!=='loose'" /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="分类"><el-select v-model="form.categories" multiple><el-option v-for="item in availableCategories" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="提成比例 %"><el-checkbox v-model="useDefaultRate">使用全局比例</el-checkbox><el-input-number v-if="!useDefaultRate" v-model="form.commission_rate" :min="0" :max="100" :precision="2" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="商品上架"><el-switch v-model="form.enabled" /></el-form-item></el-col>
      </el-row>
      <el-form-item v-if="form.product_type!=='loose'" label="商品图片"><product-pictures v-model="form.pics" @busy="uploading=$event" /></el-form-item>
      <el-form-item v-if="form.product_type!=='loose'" label="商品介绍"><el-input v-model="form.description" type="textarea" :rows="3" maxlength="20000" /></el-form-item>
      <el-alert v-if="form.product_type==='loose'" title="散货按单粒ct × 粒数 × 每ct价格计算。可售库存单位为粒；单粒重量请使用供货数据。" type="info" :closable="false" />
      <el-alert v-else title="单颗钻石和成品按件计价；库存填写当前可售数量，单颗SKU最多1件。历史订单快照不会随商品编辑变化。" type="info" :closable="false" />
      <loose-editor v-show="form.product_type==='loose'" ref="loose" :shapes="shapes" :colors="colorOptions" :colored="isColoredLoose" />
      <div v-for="(sku,index) in form.product_type==='loose'?[]:form.skus" :key="sku.id || 'new-'+index" class="sku">
        <h4>规格 {{ index+1 }} <el-switch v-model="sku.enabled" active-text="可售" /> <el-button v-if="!sku.id && form.skus.length>1" type="text" @click="form.skus.splice(index,1)">移除此新规格</el-button></h4>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="规格编号"><el-input v-model="sku.sku_no" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item :label="form.product_type==='loose'?'每ct价格':'每件价格'"><el-input-number v-model="sku.price" :precision="4" :min="0" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item :label="form.product_type==='loose'?'可售库存（粒）':'可售库存（件）'"><el-input-number v-model="sku.stock" :min="0" :max="form.product_type==='single'?1:100000000" /></el-form-item></el-col>
        </el-row>
        <el-row v-if="form.product_type!=='jewelry'" :gutter="16">
          <el-col v-for="field in specFields" :key="field.key" :span="8"><el-form-item :label="field.label"><el-select v-if="field.key==='shape'" v-model="sku.spec.shape"><el-option v-for="shape in shapes" :key="shape.id" :label="shape.name" :value="shape.name"><img :src="shapeImage(shape.image)" style="width:26px;height:26px;vertical-align:middle;margin-right:8px">{{ shape.name }}</el-option></el-select><el-input v-else v-model="sku.spec[field.key]" :placeholder="field.placeholder || ''" /></el-form-item></el-col>
        </el-row>
        <el-row v-else :gutter="16">
          <el-col v-for="field in jewelryFields" :key="field.key" :span="8"><el-form-item :label="field.label"><el-input v-model="sku.attrs[field.key]" /></el-form-item></el-col>
        </el-row>
      </div>
      <el-button v-if="form.product_type!=='loose'" icon="el-icon-plus" @click="addSku">增加可售规格</el-button>
    </el-form>
    <span slot="footer"><el-button :disabled="uploading" @click="visible=false">取消</el-button><el-button type="primary" :disabled="uploading" :loading="saving" @click="save">保存商品</el-button></span>
  </el-dialog>
</template>

<script>
import { diamondPost, diamondGet } from '@/api/diamond'
import LooseEditor from './LooseEditor'
import ProductPictures from './ProductPictures'
export default {
  components: { LooseEditor, ProductPictures },
  watch: { 'form.product_type'(value) { if (value === 'loose') this.$nextTick(() => { try { this.$refs.loose.open(this.form.skus.filter(sku => sku.id)) } catch (error) { this.$message.error(error.message); this.visible = false } }) } },
  data() {
    return { visible: false, saving: false, uploading: false, useDefaultRate: true, categories: [], shapes: [], colorOptions: [], form: { skus: [], pics: [] }, types: { loose: '培育散货', single: '单颗钻石', jewelry: '成品钻饰' },
      jewelryFields: [{ key: 'material', label: '材质/金色' }, { key: 'ring_size', label: '戒圈（适用时）' }, { key: 'chain_length', label: '链长（适用时）' }, { key: 'main_stone', label: '主石信息' }],
      fields: [{ key: 'shape', label: '形状' }, { key: 'size_mm', label: '尺寸 mm' }, { key: 'unit_weight_ct', label: '单粒重量 ct' }, { key: 'carat', label: '克拉 ct' }, { key: 'color', label: '颜色' }, { key: 'color_intensity', label: '彩钻浓度' }, { key: 'clarity', label: '净度' }, { key: 'growth_type', label: '培育类型', placeholder: 'HPHT 或 CVD' }, { key: 'cut', label: '切工' }, { key: 'polish', label: '抛光' }, { key: 'symmetry', label: '对称' }, { key: 'fluorescence', label: '荧光' }, { key: 'certificate_type', label: '证书类型' }, { key: 'certificate_no', label: '证书号' }] }
  },
  computed: {
    isColoredLoose() { return this.categories.some(item => item.code === 'loose_color' && this.form.categories && this.form.categories.includes(item.id)) },
    availableCategories() { return this.categories.filter(item => item.product_type === this.form.product_type) },
    specFields() { return this.fields.filter(item => this.form.product_type === 'loose' ? item.key !== 'carat' : item.key !== 'unit_weight_ct') }
  },
  methods: {
    shapeImage(path) { const base = new URL(process.env.VUE_APP_BASE_API || '/admin', window.location.origin); base.pathname = base.pathname.replace(/\/admin\/?$/, '/'); return new URL(path.replace(/^\//, ''), base).href },
    async open(product, categories) {
      this.shapes = (await diamondGet('shapes')).data
      this.colorOptions = (await diamondGet('colors')).data
      this.categories = categories
      this.form = product ? JSON.parse(JSON.stringify(product)) : { name: '', goods_no: '', product_type: 'single', categories: [], pics: [], description: '', commission_rate: undefined, enabled: false, skus: [] }
      if (product) this.form.categories = product.categories.map(item => item.id)
      this.form.skus.forEach(sku => { sku.original_stock = sku.stock; sku.price = Number(sku.price); sku.spec = sku.spec || {}; if (!sku.spec.shape) sku.spec.shape = '圆形'; sku.attrs = sku.attrs && !Array.isArray(sku.attrs) ? sku.attrs : {} })
      this.form.commission_rate = this.form.commission_rate == null ? undefined : Number(this.form.commission_rate)
      this.useDefaultRate = this.form.commission_rate == null
      if (!this.form.skus.length) this.addSku()
      this.visible = true
      if (this.form.product_type === 'loose') this.$nextTick(() => { try { this.$refs.loose.open(this.form.skus.filter(sku => sku.id)) } catch (error) { this.$message.error(error.message); this.visible = false } })
    },
    addSku() { this.form.skus.push({ sku_no: '', price: 0, stock: 0, enabled: true, attrs: {}, spec: { shape: '圆形' } }) },
    async save() {
      this.saving = true
      try {
        const payload = JSON.parse(JSON.stringify(this.form))
        payload.commission_rate = this.useDefaultRate ? null : this.form.commission_rate
        if (payload.product_type === 'loose') {
          payload.skus = this.$refs.loose.value()
          if (!payload.name) payload.name = this.categories.filter(category => payload.categories.includes(category.id)).map(category => category.name).join(' / ') || '培育散货'
          if (!payload.goods_no) payload.goods_no = 'LOOSE-' + Date.now().toString(36)
        }
        payload.skus.forEach(sku => { Object.keys(sku.spec).forEach(key => { if (sku.spec[key] === '') sku.spec[key] = null }) })
        await diamondPost('products', payload)
        this.$message.success('商品已保存')
        this.visible = false
        this.$emit('saved')
      } catch (error) { this.$message.error(error.message || '保存失败') } finally { this.saving = false }
    }
  }
}
</script>
<style scoped>.sku{padding:16px 0;border-bottom:1px solid #ebeef5}.hint{margin-left:8px;color:#909399}.el-select{width:100%}</style>




