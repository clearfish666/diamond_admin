<template>
    <div class="app-container">
        <!-- <el-descriptions direction="vertical" :column="6" border>
      <el-descriptions-item label="总用户数">{{
        recharge.user_count
      }}</el-descriptions-item>

      <el-descriptions-item label="总充值USDT">{{
        recharge.performance
      }}</el-descriptions-item>
      <el-descriptions-item label="总提现USDT">{{
        recharge.total_withdrawal
      }}</el-descriptions-item>
      <el-descriptions-item label="总兑换USDT">{{
        recharge.exchange_usdt
      }}</el-descriptions-item>
      <el-descriptions-item label="待提现USDT">{{
        recharge.wait_usdt
      }}</el-descriptions-item>
      <el-descriptions-item label="待兑换DNA">{{
        recharge.wait_dna
      }}</el-descriptions-item>
    </el-descriptions> -->

        <!-- 头部数量 -->
        <div class="tops3">
            <div class="topsList back1">
                <p>总用户数</p>
                <div>{{ recharge.user_count || 0 }}<span>人</span></div>
            </div>
            <div class="topsList back2">
                <p>总订场微信入金</p>
                <div>{{ recharge.total_reserve_amount || 0 }}</div>
            </div>
            <div class="topsList back3">
                <p>总充值入金</p>
                <div>{{ recharge.total_recharge_amount || 0 }}</div>
            </div>
            <div class="topsList back4">
                <p>总订场订单</p>
                <div>{{ recharge.total_reserve_count || 0 }}</div>
            </div>

            <!-- <div class="topsList back3">
        <p>总提现ALEO</p>
        <div>{{ recharge.total_aleo_withdrawal || 0 }}</div>
      </div>
      <div class="topsList back4">
        <p>待提现ALEO</p>
        <div>{{ recharge.ready_aleo_balance || 0 }}</div>
      </div> -->
        </div>
        <!-- <div class="tops3">

    </div> -->
        <!-- <div>
          <div id="home_chart" :style="'width:100%;height:' + (pageheight - 90) + 'px;'" />
        </div> -->
        <div class="app-container">
            <div id="search-box" class="filter-container">
                <el-form :inline="true" :model="search">
                    <el-form-item label="筛选时间">
                        <el-date-picker
                            v-model="dateRangeValue"
                            type="datetimerange"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            :picker-options="pickerOptions"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            align="right"
                            @change="onChangeDateRange"
                        />
                    </el-form-item>
                    <el-button icon="el-icon-search" @click="getList(1)">
                        {{ $t('table.search') }}
                    </el-button>
                    <!-- <el-button type="primary" @click="updateToday()">
            刷新今天数据
          </el-button>
          <el-tag style="margin-left:10px;" type="danger">今天数据默认10分钟自动刷新一次，可以手动刷新（限制10秒刷一次）</el-tag> -->
                </el-form>
            </div>
            <el-table
                :data="list"
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
                    label="新增用户"
                    prop="inc_user"
                    :align="tableAlign"
                />

                <el-table-column
                    label="订场入金"
                    prop="inc_reserve_amount"
                    :align="tableAlign"
                />
                <el-table-column
                    label="充值入金"
                    prop="inc_recharge_amount"
                    :align="tableAlign"
                />

                <el-table-column
                    label="订场订单"
                    prop="inc_reserve_count"
                    :align="tableAlign"
                />
            </el-table>
            <pagination
                v-show="pages.total > 0"
                :total="pages.total"
                :page.sync="pages.current"
                :limit.sync="pages.limit"
                @pagination="getList()"
            />
        </div>
    </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getRechargeHome, update } from '@/api/statistical'
import { mixin } from '@/utils/mixin'

export default {
    name: 'Statistical',
    components: { Pagination },

    mixins: [mixin],
    data() {
        return {
            loading: false,
            dateRangeValue: [],

            activeName: 'first',
            tableAlign: 'center',
            recharge: [],
            list: [],
            chart: null,
            search: {
                start_time: '',
                end_time: ''
            },
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 7
                            )
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 30
                            )
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
                    data: ['PIPA', 'MUCG', 'MUCNFT', 'BUSD']
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
                        name: 'PIPA',
                        data: [],
                        type: 'line',
                        smooth: true
                    },
                    {
                        name: 'MUCG',
                        data: [],
                        type: 'line',
                        smooth: true
                    },
                    {
                        name: 'MUCNFT',
                        data: [],
                        type: 'line',
                        smooth: true
                    },
                    {
                        name: 'BUSD',
                        data: [],
                        type: 'line',
                        smooth: true
                    }
                ]
            },
            pages: {
                total: 0,
                limit: 10,
                current: 1
            }
        }
    },
    created() {
        this.init()
    },
    mounted() {},
    methods: {
        init() {
            this.getList()
        },
        getList(page = this.pages.current, loading = true) {
            if (this.loading) return
            this.loading = loading
            if (page === 1) this.pages.current = page
            getRechargeHome({ page, ...this.search, limit: this.pages.limit })
                .then((response) => {
                    if (response.code !== 0) return
                    this.list = response.data.ret.data
                    this.pages.total = response.data.ret.total
                    this.recharge = response.data.total
                })
                .catch(() => {})
                .finally(() => {
                    this.loading = false
                })
        },
        updateToday() {
            update()
                .then((response) => {
                    if (response.code !== 0) return
                    this.getList()
                })
                .catch(() => {})
                .finally(() => {})
        },
        onChangeDateRange(value) {
            if (Array.isArray(value)) {
                this.search.start_time = value[0]
                this.search.end_time = value[1]
            } else {
                this.search.start_time = this.search.end_time = ''
                this.getList(1)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
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

::v-deep .el-select {
    width: 100%;
}
::v-deep .el-cascader {
    width: 100%;
}
.tops {
    position: relative;
    .boxShadow {
        position: absolute;
        top: 42px;
        left: 0px;
        width: 90%;
        // height: 100px;
        background: #fff;
        padding: 10px;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
        border-radius: 5px;
    }
}
.tops3 {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .topsList {
        width: 15%;
        padding: 8px;
        background: #86898f;
        border-radius: 10px;
        font-size: 18px;
        font-family: AlibabaPuHuiTiR;
        font-weight: 400;
        color: #fff;
        div {
            font-size: 22px;
            font-weight: bold;
            color: #fff;
            span {
                font-size: 14px;
            }
        }
    }
    .back1 {
        background: url(../img/back1.png);
        background-size: 100% 100%;
    }
    .back2 {
        background: url(../img/back2.png);
        background-size: 100% 100%;
    }
    .back3 {
        background: url(../img/back3.png);
        background-size: 100% 100%;
    }
    .back4 {
        background: url(../img/back4.png);
        background-size: 100% 100%;
    }
    .back5 {
        background: url(../img/back3.png);
        background-size: 100% 100%;
    }
    .back6 {
        background: url(../img/back4.png);
        background-size: 100% 100%;
    }
}
</style>
