<template>
  <div class="app-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-loading="loading" label="累计统计" name="first">
        <el-descriptions direction="vertical" :column="4" border>
          <el-descriptions-item label="累计充值BUSD">{{ recharge.busd_total }}</el-descriptions-item>
          <el-descriptions-item label="累计充值BNB">{{ recharge.bnb_total }}</el-descriptions-item>
          <el-descriptions-item label="累计充值MUCP">{{ recharge.mucp_total }}</el-descriptions-item>
          <el-descriptions-item label="今日充值BUSD">{{ recharge.busd_today }}</el-descriptions-item>
          <el-descriptions-item label="今日充值BNB">{{ recharge.bnb_today }}</el-descriptions-item>
          <el-descriptions-item label="今日充值MUCP">{{ recharge.mucp_today }}</el-descriptions-item>
        </el-descriptions>
        <div>
          <div id="home_chart" :style="'width:100%;height:' + (pageheight - 90) + 'px;'" />
        </div>
      </el-tab-pane>
      <el-tab-pane v-loading="loading" label="每日统计" name="second">
        <div class="app-container">
          <div id="search-box" class="filter-container">
            <el-form :inline="true" :model="search">
              <el-form-item label="筛选时间">
                <el-date-picker
                  v-model="search.date"
                  type="datetimerange"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  :picker-options="pickerOptions"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right"
                />
              </el-form-item>
              <el-button icon="el-icon-search" @click="getRecharge(1)">
                {{ $t("table.search") }}
              </el-button>
            </el-form>
          </div>
          <el-table
            :data="recharges"
            border
            :max-height="pageheight"
            stripe
            :row-class-name="tableRowClassName"
          >
            <el-table-column
              fixed
              label="日期"
              :align="tableAlign"
              prop="date"
            />
            <el-table-column
              label="BUSD"
              prop="busd"
              :align="tableAlign"
            />
            <el-table-column
              label="BNB"
              prop="bnb"
              :align="tableAlign"
            />
            <el-table-column
              label="MUCP"
              prop="mucp"
              :align="tableAlign"
            />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getRechargeHome, getRecharge } from '@/api/statistical'
import { mixin } from '@/utils/mixin'
import * as echarts from 'echarts'

export default {
  name: 'MUCGOutputStatistical',
  mixins: [mixin],
  data() {
    return {
      loading: true,
      activeName: 'first',
      tableAlign: 'center',
      recharge: [],
      chart: null,
      search: {
        date: []
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      recharges: [],
      tableRowClassName({ row, rowIndex }) {
        if (rowIndex === 0) {
          return 'today-row'
        }
        return ''
      },
      option: {
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          show: true,
          feature: {
            magicType: { type: ['line', 'bar'] }
          }
        },
        legend: {
          data: ['BUSD', 'BNB', 'MUCP']
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'BUSD',
            data: [],
            type: 'line',
            smooth: true
          },
          {
            name: 'BNB',
            data: [],
            type: 'line',
            smooth: true
          },
          {
            name: 'MUCP',
            data: [],
            type: 'line',
            smooth: true
          }
        ]
      }
    }
  },
  created() {
    this.init()
  },
  mounted() {
    this.initChartTrend()
  },
  methods: {
    init() {
      this.getRechargeHome('count')
    },
    getRechargeHome() {
      this.loading = true
      this.chart && this.chart.showLoading()
      getRechargeHome().then((response) => {
        this.recharge = response.data
        this.option.xAxis.data = this.recharge.statistical.x_axis
        for (const index in this.recharge.statistical.y_axis) {
          this.option.series[index].data = this.recharge.statistical.y_axis[index]
        }
        this.chart.setOption(this.option)
        this.chart.hideLoading()
        this.loading = false
      })
    },
    getRecharge() {
      this.loading = true
      getRecharge({ ...this.search }).then((response) => {
        this.recharges = response.data
        this.loading = false
      }).catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    handleClick() {
      if (this.activeName === 'second') {
        this.getRecharge()
      } else {
        this.getRechargeHome()
      }
    },
    initChartTrend() {
      this.chart = echarts.init(
        document.getElementById('home_chart')
      )
      this.chart.showLoading()
      this.$nextTick(() => {
        this.chart.setOption(this.option)
      })
    }
  }
}
</script>

<style>
.clear-cache-button {
  margin-bottom: 20px;
}
.today-row td {
  background: #4caf50 !important;
  color: #fff !important;
  font-weight: bold !important;
}
.el-date-editor.el-input {
  width: 115px !important;
}
.danger {
  color: #f56c6c;
  background: #fef0f0;
}
</style>
