<template>
  <div class="app-container">
    <h2>商品分类</h2>
    <div class="filters"><el-input v-model="search" placeholder="分类名称或标识" clearable/><el-select v-model="type" clearable placeholder="业务类型"><el-option v-for="(label,key) in types" :key="key" :label="label" :value="key"/></el-select><el-button @click="load">刷新</el-button><el-button v-if="canEdit" type="primary" @click="edit()">新增分类</el-button></div>
    <el-table :data="filtered" v-loading="loading" border><el-table-column prop="id" label="ID" width="80"/><el-table-column label="分类图" width="100"><template slot-scope="{row}"><el-image v-if="row.pic" :src="row.pic" :preview-src-list="[row.pic]" style="width:60px;height:60px" fit="contain"/><span v-else>未设置</span></template></el-table-column><el-table-column prop="name" label="分类名称"/><el-table-column prop="code" label="分类标识"/><el-table-column label="业务类型"><template slot-scope="{row}">{{ types[row.product_type] }}</template></el-table-column><el-table-column prop="sort" label="排序"/><el-table-column label="状态"><template slot-scope="{row}">{{ row.enabled?'启用':'停用' }}</template></el-table-column><el-table-column label="操作"><template slot-scope="{row}"><el-button v-if="canEdit" type="text" @click="edit(row)">编辑</el-button><el-button v-if="canEdit" type="text" @click="toggle(row)">{{ row.enabled?'停用':'启用' }}</el-button></template></el-table-column></el-table>
    <el-dialog title="商品分类" :visible.sync="visible" width="520px" :close-on-click-modal="false" :show-close="!uploading" :close-on-press-escape="!uploading"><el-form ref="form" :model="form" :rules="rules" label-width="110px"><el-form-item label="分类图"><product-pictures :value="form.pic?[form.pic]:[]" :limit="1" upload-type="category" @input="form.pic=$event[0]||null" @busy="uploading=$event"/><div>建议使用正方形图片，用于小程序分类入口。</div></el-form-item><el-form-item label="名称" prop="name"><el-input v-model="form.name" maxlength="80"/></el-form-item><el-form-item label="标识" prop="code"><el-input v-model="form.code" :disabled="!!form.id" placeholder="例如 loose_white"/></el-form-item><el-form-item label="业务类型" prop="product_type"><el-select v-model="form.product_type" :disabled="!!form.id"><el-option v-for="(label,key) in types" :key="key" :label="label" :value="key"/></el-select></el-form-item><el-form-item label="排序"><el-input-number v-model="form.sort" :precision="0"/></el-form-item><el-form-item label="启用"><el-switch v-model="form.enabled"/></el-form-item><el-alert title="已有分类的标识与业务类型不可修改。停用不删除历史商品和订单。首页仍使用原先固定入口。" :closable="false"/></el-form><span slot="footer"><el-button :disabled="uploading" @click="visible=false">取消</el-button><el-button type="primary" :loading="saving" :disabled="uploading" @click="save">保存</el-button></span></el-dialog>
  </div>
</template>
<script>
import ProductPictures from './ProductPictures'
import { diamondGet, diamondPost } from '@/api/diamond'
export default {
  components: { ProductPictures },
  data() { return { rows: [], search: '', type: '', loading: false, saving: false, uploading: false, visible: false, form: {}, types: { loose: '培育散货', single: '单颗钻石', jewelry: '成品钻饰' }, rules: { name: [{ required: true, message: '请填写分类名称' }], code: [{ required: true, pattern: /^[a-zA-Z0-9_-]+$/, message: '请填写字母、数字、下划线组成的标识' }], product_type: [{ required: true, message: '请选择业务类型' }] } } },
  computed: {
    canEdit() { try { return JSON.parse(localStorage.getItem('permissionsList') || '[]').includes('DiamondCategoriesEdit') } catch (e) { return false } },
    filtered() { return this.rows.filter(row => (!this.type || row.product_type === this.type) && (!this.search || row.name.includes(this.search) || row.code.includes(this.search))) }
  },
  created() { this.load() },
  methods: {
    async load() { this.loading = true; try { this.rows = (await diamondGet('category-management')).data } finally { this.loading = false } },
    edit(row) { this.form = row ? { ...row } : { pic: null, name: '', code: '', product_type: 'loose', sort: 0, enabled: true }; this.visible = true; this.$nextTick(() => this.$refs.form.clearValidate()) },
    save() { this.$refs.form.validate(async valid => { if (!valid) return; this.saving = true; try { await diamondPost('categories', this.form); this.visible = false; this.$message.success('分类已保存'); await this.load() } finally { this.saving = false } }) },
    async toggle(row) { await this.$confirm('确认'+(row.enabled?'停用':'启用')+'此分类？', '分类状态'); await diamondPost('categories', { ...row, enabled: !row.enabled }); this.load() }
  }
}
</script>
<style scoped>.filters{display:flex;gap:12px;margin:20px 0}.filters .el-input{width:260px}</style>

