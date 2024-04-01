<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="panel-group">
      <el-col :span="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">总用户数量</div>
            <span class="card-panel-num">
              {{ count.registerTotal }}
            </span>
          </div>
        </div>
      </el-col>
      <el-col :span="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日登录用户</div>
            <span class="card-panel-num">
              {{ count.Logintoday }}
            </span>
          </div>
        </div>
      </el-col>
      <el-col :span="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日新增用户</div>
            <span class="card-panel-num">
              {{ count.Registertoday }}
            </span>
          </div>
        </div>
      </el-col>
      <el-col :span="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日营业额</div>
            <span class="card-panel-num">
              {{ count.TodayTotal }}
            </span>
          </div>
        </div>
      </el-col>
      <!-- <el-col :span="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img :src="avatar + '?imageView2/1/w/80/h/80'" style="width: 45px">
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日退款</div>
            <span class="card-panel-num">
              {{ count.Refundtoday }}
            </span>
          </div>
        </div>
      </el-col> -->
      <!-- <el-col :span="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日成本价</div>
            <span class="card-panel-num">
              {{ count.Todaycostprice }}
            </span>
          </div>
        </div>
      </el-col> -->
      <el-col :span="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日利润</div>
            <span class="card-panel-num">
              {{ count.Todayprofit }}
            </span>
          </div>
        </div>
      </el-col>
      <el-col :span="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">本月营业额</div>
            <span class="card-panel-num">
              {{ count.Monthperformance }}
            </span>
          </div>
        </div>
      </el-col>
      <!-- <el-col :span="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">本月退款</div>
            <span class="card-panel-num">
              {{ count.Monthrefund }}
            </span>
          </div>
        </div>
      </el-col> -->
      <!-- <el-col :span="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">本月成本价</div>
            <span class="card-panel-num">
              {{ count.Monthcost }}
            </span>
          </div>
        </div>
      </el-col> -->
      <el-col :span="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              style="width: 45px"
            />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">本月利润</div>
            <span class="card-panel-num">
              {{ count.Monthprofit }}
            </span>
          </div>
        </div>
      </el-col>
    </el-row>

    <div
      id="registerTotal"
      class="c-chart-box"
      :style="{
        minHeight: height,
        width: width,
      }"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import * as echarts from "echarts";
import { userCount } from "@/api/stats";

export default {
  name: "Statistical",
  props: {
    id: {
      type: String,
      default: "J_chart__trend",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "450px",
    },
  },
  data() {
    return {
      count: {
        registerTotal: 0, //总注册数
        Logintoday: 0, //今天登录人数
        Registertoday: 0, //今天注册人数
        TodayTotal: 0, //今天营业额
        Refundtoday: 0,
        Todaycostprice: 0,
        Todayprofit: 0, //今天利润
        Monthperformance: 0, //本月营业额
        Monthrefund: 0,
        Monthcost: 0,
        Monthprofit: 0, //本月利润
      },
      loading: false,
      registerChart: null,
      registerChartOption: {
        title: {
          text: "每日营业额",
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          data: [],
        },
        yAxis: {
          type: "value",
        },
        series: [],
      },
    };
  },
  computed: {
    ...mapGetters(["avatar"]),
  },
  created() {
    this.init();
  },
  mounted() {
    this.initChartTrend();
  },
  methods: {
    init() {
      this.getCount();
    },
    getCount() {
      if (this.registerChart) {
        this.registerChart.showLoading();
      }
      userCount()
        .then((response) => {
          this.count = response.data;
          this.updateTrendChartData();
        })
        .catch(() => {})
        .finally(() => {
          this.registerChart.hideLoading();
        });
    },
    updateTrendChartData() {
      const xAxisData = this.count.time;
      const userData = this.count.userCount;
      const xAxis = {
        type: "category",
        boundaryGap: false,
        data: xAxisData,
      };

      //设置Y轴数据
      const userSeries = {
        data: userData,
        type: "line",
        smooth: true,
      };

      this.registerChart.setOption({ xAxis, series: userSeries });
      //this.registerChart.setOption({ xAxis, series: costSeries });
    },
    initChartTrend() {
      this.registerChart = echarts.init(
        document.getElementById("registerTotal")
      );
      this.registerChart.showLoading();
      this.$nextTick(() => {
        this.registerChart.setOption(this.registerChartOption);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.dashboard-container {
  padding: 32px;
  background-color: #f0f2f5;
  position: relative;
}

.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);
    display: flex;

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-shopping {
        background: #34bfa3;
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3;
    }

    .card-panel-icon-wrapper {
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
