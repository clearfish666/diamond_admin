<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions(data) {
      this.chart.setOption({
        xAxis: {
          data: data.date,
          boundaryGap: false,
          axisTick: {
            show: false
          },
          axisLabel: {
            rotate: 45
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['推荐奖励', '新手奖励', '兑换DSTT总额', '兑换HD总额', '消耗DSTT兑换HD', '消耗HD兑换DSTT']
        },
        series: [{
          name: '推荐奖励',
          smooth: true,
          type: 'line',
          data: data.invite_reward_num
        },
        {
          name: '新手奖励',
          smooth: true,
          type: 'line',
          data: data.novice_reward_num
        },
        {
          name: '兑换DSTT总额',
          smooth: true,
          type: 'line',
          data: data.exchange_dstt_num
        },
        {
          name: '兑换HD总额',
          smooth: true,
          type: 'line',
          data: data.exchange_hd_num
        },
        {
          name: '消耗DSTT兑换HD',
          smooth: true,
          type: 'line',
          data: data.exchange_hd_dstt_num
        },
        {
          name: '消耗HD兑换DSTT',
          smooth: true,
          type: 'line',
          data: data.exchange_dstt_hd_num
        }]
      })
    }
  }
}
</script>
