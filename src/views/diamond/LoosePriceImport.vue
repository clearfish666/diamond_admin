<template>
  <span class="loose-price-import">
    <el-dropdown @command="download">
      <el-button :loading="downloading">导出模板<i class="el-icon-arrow-down el-icon--right" /></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="round">圆形白钻及彩钻</el-dropdown-item>
        <el-dropdown-item command="fancy">异形钻</el-dropdown-item>
        <el-dropdown-item command="details">规格库存明细（含现有数据）</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-button v-if="canEdit" :loading="busy" @click="$refs.file.click()">导入 Excel</el-button>
    <input ref="file" type="file" accept=".xlsx" hidden @change="preview">
    <el-dialog title="导入报价" :visible.sync="visible" width="85%" :close-on-click-modal="false">
      <p>新增 {{ result.created || 0 }} 个规格，修改 {{ result.updated - (result.created || 0) }} 个，{{ result.unchanged }} 个未变化。</p>
      <el-alert v-if="sheets['规格库存明细']" title="库存为可售粒数：填写后替换当前库存，留空保留，填0清零。新增规格会开放配货，未填库存默认为0。分类填写培育白钻或培育彩钻，形状、颜色使用后台名称；净度填写VVS-VS或SI。" type="info" :closable="false" />
      <el-alert v-else title="区间报价仅修改已有价格。新增规格、修改库存请使用规格库存明细。异形报价用于白钻现有净度档位，已标记CVD的规格不参与区间改价。" type="info" :closable="false" />
      <el-table :data="result.changes" height="340" border>
        <el-table-column prop="sku_no" label="规格编号" />
        <el-table-column prop="shape" label="形状" />
        <el-table-column prop="color" label="颜色" />
        <el-table-column prop="size_mm" label="尺寸 mm" />
        <el-table-column prop="clarity" label="净度" />
        <el-table-column prop="old_price" label="原价 元/ct" />
        <el-table-column prop="new_price" label="新价 元/ct" />
        <el-table-column v-if="sheets['规格库存明细']" prop="old_stock" label="原库存（粒）" />
        <el-table-column v-if="sheets['规格库存明细']" prop="new_stock" label="新库存（粒）" />
      </el-table>
      <el-collapse v-if="result.unmatched.length">
        <el-collapse-item :title="result.unmatched.length + ' 行未匹配到现有规格，不会导入'">
          <div v-for="row in result.unmatched" :key="row">{{ row }}</div>
        </el-collapse-item>
      </el-collapse>
      <span slot="footer"><el-button :disabled="busy" @click="visible=false">取消</el-button><el-button type="primary" :loading="busy" :disabled="!result.updated" @click="apply">确认导入</el-button></span>
    </el-dialog>
  </span>
</template>

<script>
import { diamondGet, diamondPost, downloadLoosePriceTemplate } from '@/api/diamond'

export default {
  props: { canEdit: Boolean },
  data() {
    return { downloading: false, busy: false, visible: false, sheets: {}, result: { changes: [], unmatched: [] }}
  },
  methods: {
    async download(type) {
      this.downloading = true
      try {
        if (type === 'details') {
          const response = await diamondGet('loose-price-templates/details')
          const XLSX = await import('xlsx')
          const workbook = XLSX.utils.book_new()
          const rows = response.data.rows
          if (rows.length === 1) rows.push(Array(8).fill(''))
          const sheet = XLSX.utils.aoa_to_sheet(rows)
          sheet['!cols'] = [18, 18, 12, 16, 16, 14, 18, 16].map(width => ({ wch: width }))
          XLSX.utils.book_append_sheet(workbook, sheet, response.data.name)
          XLSX.writeFile(workbook, '散钻规格库存明细.xlsx')
        } else await downloadLoosePriceTemplate(type)
      } catch (error) { this.$message.error(error.message) } finally { this.downloading = false }
    },
    async preview(event) {
      const file = event.target.files[0]
      event.target.value = ''
      if (!file) return
      this.busy = true
      try {
        if (!/\.xlsx$/i.test(file.name) || file.size > 5 * 1024 * 1024) throw new Error('请选择 5MB 以内的 xlsx 文件')
        const XLSX = await import('xlsx')
        const buffer = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(new Error('文件读取失败'))
          reader.readAsArrayBuffer(file)
        })
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheets = {}
        for (const name of workbook.SheetNames) {
          const sheet = workbook.Sheets[name]
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
          if (range.e.r > 2000 || range.e.c > 7) throw new Error(name + ' 超出模板行列范围')
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true })
          for (let index = 0; index < rows.length; index++) {
            if (rows[index].some((value, col) => {
              const cell = sheet[XLSX.utils.encode_cell({ r: index, c: col })]
              return cell && cell.f
            })) throw new Error('请将公式转换为数值后再导入')
          }
          sheets[name] = rows.map(row => row.map(value => String(value).trim()))
        }
        const response = await diamondPost('loose-prices/import', { sheets, apply: false })
        this.sheets = sheets
        this.result = response.data
        this.visible = true
      } catch (error) { this.$message.error(error.message || 'Excel 读取失败') } finally { this.busy = false }
    },
    async apply() {
      this.busy = true
      try {
        const response = await diamondPost('loose-prices/import', { sheets: this.sheets, apply: true, preview_hash: this.result.preview_hash })
        this.visible = false
        this.$message.success('已导入 ' + response.data.updated + ' 个规格')
        this.$emit('imported')
      } catch (error) { this.$message.error(error.message || '导入失败，请重新预览') } finally { this.busy = false }
    }
  }
}
</script>

<style scoped>
.loose-price-import { margin-left: 10px; }
.el-dropdown { margin-right: 10px; }
</style>
