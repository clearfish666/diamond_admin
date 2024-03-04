<template>
  <div>
    <el-descriptions
      v-if="item.type == 'info'"
      :title="showTitle ? title : ''"
      :size="size"
      :column="columnMappings[item.type]"
      border
    >
      <el-descriptions-item>
        <template slot="label"> 身高 </template>
        {{ item.data.height }} cm
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label"> 体重 </template>
        {{ item.data.weight }} kg
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label"> 体脂 </template>
        {{ item.data.bmi }} BMI
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label"> 腰围 </template>
        {{ item.data.waist }} cm
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label"> 臀围 </template>
        {{ item.data.hipline }} cm
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label"> 总胆固醇 </template>
        {{ item.data.chol }}
      </el-descriptions-item>
      <el-descriptions-item :span="1">
        <template slot="label"> 结果分析 </template>
        {{ item.analyse }}
      </el-descriptions-item>
    </el-descriptions>
    <div v-if="item.type != 'info'">
      <div v-if="showTitle" style="font-size: 16px;font-weight: 700;color: #303133;margin-bottom: 20px;">{{ title }}</div>
      <div v-if="item.type === 'uwd'">
        <el-descriptions style="border: 1px solid #EBEEF5;padding: 6px 0;padding-left: 10px;">
          <el-descriptions-item label="HR">{{ item.data.hr }}bpm</el-descriptions-item>
          <el-descriptions-item label="QT/QTC">{{ item.data.QT }}/{{ item.data.QTC }}ms</el-descriptions-item>
          <el-descriptions-item label="RV5+SV1">{{ bcadd(item.data.RV5, item.data.SV1) }}mV</el-descriptions-item>
          <el-descriptions-item label="PR">{{ item.data.PR }}ms</el-descriptions-item>
          <el-descriptions-item label="P/QRS/T" :span="2">{{ item.data.P }}/{{ item.data.QRS }}/{{ item.data.T }}°</el-descriptions-item>
          <el-descriptions-item label="QRS">{{ item.data.QRS }}ms</el-descriptions-item>
          <el-descriptions-item label="QV5/SV1" :span="2">{{ item.data.QRS }}/{{ item.data.SV1 }}mV</el-descriptions-item>
        </el-descriptions>
        <el-image :src="domin + (item.extend && item.extend.file ? item.extend.file : '')" style="width: 100%;min-height: 100px;">
          <div slot="placeholder" class="image-slot">
            加载中<span class="dot">...</span>
          </div>
        </el-image>
      </div>
      <el-table v-else :data="item.metrical_data" border style="width: 100%">
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="result" label="检查结果" />
        <el-table-column prop="hint" label="提示" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="reference" label="参考值" />
      </el-table>
      <div style="border: 1px solid #EBEEF5;border-top: none;padding: 6px 0;padding-left: 10px;color:#909399;font-weight: bold;">结果分析：{{ item.analyse }}</div>
    </div>
  </div>
</template>

<script>
import { DominKey, getToken } from '@/utils/auth'

export default {
  props: {
    showTitle: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: '报告'
    },
    size: {
      type: String,
      default: 'medium'
    },
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      domin: getToken(DominKey),
      columnMappings: {
        'info': 2
      }
    }
  },
  methods: {
    bcadd(a, b) {
      return Number(a) + Number(b)
    }
  }
}
</script>
