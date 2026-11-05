<template><div class="app-container"><h2>今日报价</h2><p>上传报价图片，首页弹框按图片顺序展示，支持点击放大。最多10张。</p><product-pictures v-model="images" upload-type="goods" @busy="uploading=$event" /><el-button v-if="canEdit" type="primary" :disabled="uploading||loading" :loading="saving" @click="save">保存</el-button></div></template>
<script>
import ProductPictures from './ProductPictures'
import { diamondGet, diamondPut } from '@/api/diamond'
export default {
  components: { ProductPictures },
  data() { return { images: [], uploading: false, saving: false, loading: true } },
  computed: { canEdit() { try { return JSON.parse(localStorage.getItem('permissionsList') || '[]').includes('DiamondSettingsEdit') } catch (e) { return false } } },
  async created() { try { this.images = (await diamondGet('quote-images')).data } finally { this.loading = false } },
  methods: { async save() { this.saving = true; try { await diamondPut('quote-images', { images: this.images }); this.$message.success('今日报价已保存') } finally { this.saving = false } } }
}
</script>
