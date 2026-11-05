<template>
  <div>
    <div class="pictures">
      <div v-for="(url,index) in value" :key="index" class="picture">
        <el-image :src="pictureUrl(url)" :preview-src-list="pictureUrls" fit="cover" />
        <div><template v-if="limit>1"><el-button type="text" :disabled="index===0 || uploading" @click="move(index,-1)">前移</el-button><el-button type="text" :disabled="index===value.length-1 || uploading" @click="move(index,1)">后移</el-button></template><el-button type="text" :disabled="uploading" @click="remove(index)">删除</el-button></div>
        <small v-if="index===0 && limit>1">封面图</small>
      </div>
      <el-upload action="#" :show-file-list="false" :http-request="upload" :before-upload="before" :disabled="uploading || value.length>=limit" accept="image/png,image/jpeg,image/gif,image/webp,image/bmp">
        <div class="picker"><i :class="uploading?'el-icon-loading':'el-icon-plus'" /><span>{{ uploading?'上传中':'选择图片' }}</span></div>
      </el-upload>
    </div>
    <div class="hint">最多{{ limit }}张，每张不超过5MB。点击图片可放大预览。</div>
  </div>
</template>
<script>
import request from '@/utils/request'
import { diamondImageUrl } from '@/utils/diamondImage'
export default {
  props: { value: { type: Array, default: () => [] }, limit: { type: Number, default: 10 }, uploadType: { type: String, default: 'goods' } },
  data() { return { uploading: false } },
  computed: { pictureUrls() { return this.value.map(this.pictureUrl) } },
  methods: {
    pictureUrl: diamondImageUrl,
    before(file) {
      if (!['image/png','image/jpeg','image/gif','image/webp','image/bmp'].includes(file.type) || file.size > 5 * 1024 * 1024) { this.$message.error('请选择5MB以内的PNG、JPG、GIF、WebP或BMP图片'); return false }
      return true
    },
    async upload(options) {
      this.uploading = true; this.$emit('busy', true)
      try {
        const data = new FormData(); data.append('file', options.file); data.append('type', this.uploadType)
        const result = await request.post('/upload', data)
        const url = diamondImageUrl(result.data.filename)
        this.$emit('input', this.value.concat(url)); options.onSuccess(result)
      } catch (error) { options.onError(error) } finally { this.uploading = false; this.$emit('busy', false) }
    },
    remove(index) { this.$emit('input', this.value.filter((url,i) => i !== index)) },
    move(index,step) { const pics = this.value.slice(); const swap = pics[index+step]; pics[index+step] = pics[index]; pics[index] = swap; this.$emit('input', pics) }
  }
}
</script>
<style scoped>.pictures{display:flex;gap:12px;flex-wrap:wrap}.picture{width:142px;text-align:center}.picture .el-image{width:142px;height:142px;border:1px solid #eee;border-radius:6px}.picture .el-button{padding:5px}.picker{width:142px;height:142px;border:1px dashed #c0c4cc;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#909399}.picker i{font-size:28px}.hint{color:#909399;font-size:12px}</style>
