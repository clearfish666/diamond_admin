<template>
  <div>
    <el-alert title="每行配置一种形状、颜色及尺寸；价格单位为元/ct，库存单位为粒。VVS-VS 与 SI 分别扣减库存。" :closable="false" />
    <el-table :data="rows" border>
      <el-table-column label="形状" min-width="130"><template slot-scope="{row}"><el-select v-model="row.shape"><el-option v-for="item in shapes" :key="item.id" :label="item.name" :value="item.name" /></el-select></template></el-table-column><el-table-column v-if="colored" label="颜色" min-width="130"><template slot-scope="{row}"><el-select v-model="row.color"><el-option v-for="item in colors" :key="item.id" :label="item.name" :value="item.name"><img :src="imageUrl(item.image)" style="width:24px;height:24px;vertical-align:middle">{{ item.name }}</el-option></el-select></template></el-table-column><el-table-column label="尺寸 mm"><template slot-scope="{row}"><el-input v-model="row.size" /></template></el-table-column>
      <el-table-column label="单粒 ct"><template slot-scope="{row}"><el-input v-model="row.weight" /></template></el-table-column>
      <el-table-column v-for="grade in grades" :key="grade.key" :label="grade.label+' 单价 / 库存'" min-width="210"><template slot-scope="{row}"><el-input-number v-model="row[grade.key].price" :min="0" :precision="4" /><el-input-number v-model="row[grade.key].stock" :min="0" :precision="0" /><el-switch v-model="row[grade.key].enabled" active-text="可售" /></template></el-table-column>
      <el-table-column label="操作" width="90"><template slot-scope="{row,$index}"><el-button v-if="!row.vvs.id && !row.si.id" type="text" @click="rows.splice($index,1)">移除</el-button></template></el-table-column>
    </el-table>
    <el-button @click="add">增加尺寸</el-button>
  </div>
</template>
<script>
const blank = () => ({ price: 0, stock: 0, enabled: true, attrs: {}, spec: {} })
export default {
  props: { shapes: { type: Array, default: () => [] }, colors: { type: Array, default: () => [] }, colored: Boolean },
  data() { return { rows: [], grades: [{ key: 'vvs', label: 'VVS-VS' }, { key: 'si', label: 'SI' }] } },
  methods: {
    imageUrl(path) { const base = new URL(process.env.VUE_APP_BASE_API || '/admin', window.location.origin); base.pathname = base.pathname.replace(/\/admin\/?$/, '/'); return new URL(path.replace(/^\//, ''), base).href },
    open(skus) {
      const groups = new Map()
      skus.forEach(sku => {
        const key = (sku.spec.shape || '圆形') + ':' + (sku.spec.color || '') + ':' + String(Number(sku.spec.size_mm))
        if (!groups.has(key)) groups.set(key, { shape: sku.spec.shape || '圆形', color: sku.spec.color || '', size: sku.spec.size_mm, weight: sku.spec.unit_weight_ct, vvs: blank(), si: blank() })
        const row = groups.get(key)
        const grade = sku.spec.clarity === 'SI' ? 'si' : 'vvs'
        if (row[grade].id) throw new Error('同尺寸存在多条旧净度规格，请先核对旧规格，不能自动合并库存')
        if (Number(row.weight) !== Number(sku.spec.unit_weight_ct)) throw new Error('同尺寸的单粒ct不一致，请先核对旧规格')
        row[grade] = JSON.parse(JSON.stringify(sku))
      })
      this.rows = Array.from(groups.values())
      if (!this.rows.length) this.add()
    },
    add() { this.rows.push({ shape: '圆形', color: '', size: '', weight: '', vvs: blank(), si: blank() }) },
    value() {
      const seen = new Set()
      return this.rows.reduce((skus, row) => {
        if (!(Number(row.size) > 0) || !(Number(row.weight) > 0)) throw new Error('请填写有效的mm和单粒ct')
        if (this.colored && !row.color) throw new Error('请选择培彩散货颜色')
        const key = row.shape + ':' + (this.colored ? row.color : '') + ':' + String(Number(row.size))
        if (seen.has(key)) throw new Error('同一形状、颜色和尺寸不能重复')
        seen.add(key)
        this.grades.forEach(grade => {
          const sku = row[grade.key]
          skus.push({ ...sku, spec: { shape: row.shape, color: this.colored ? row.color : null, size_mm: row.size, unit_weight_ct: row.weight, clarity: grade.label } })
        })
        return skus
      }, [])
    }
  }
}
</script>

