<template>
    <div class="app-container">
        <div id="search-box" class="filter-container">
            <el-form :inline="true" :model="search">
                <!-- <el-form-item label="商品名称">
                    <el-input
                        v-model="search.name"
                        placeholder="商品名称"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                    />
                </el-form-item> -->

                <el-form-item label="场地类型:" prop="category_id">
                    <!-- <el-cascader
                        ref="category"
                        v-model="search.category_id"
                        :props="category"
                        clearable
                        @change="getList(1)"
                    /> -->

                    <el-select
                        v-model="search.category_id"
                        clearable
                        @change="getList(1)"
                    >
                        <el-option
                            v-for="item in categoryOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="手机号">
                    <el-input
                        v-model="search.phone"
                        placeholder="手机号"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                    />
                </el-form-item>

                <el-form-item label="支付状态">
                    <el-select
                        v-model="search.pay_status"
                        clearable
                        @clear="getList(1)"
                        @change="getList(1)"
                    >
                        <el-option
                            v-for="item in payStatusOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="订单状态">
                    <el-select
                        v-model="search.status"
                        clearable
                        @clear="getList(1)"
                        @change="getList(1)"
                    >
                        <el-option
                            v-for="item in statusOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-button icon="el-icon-search" @click="getList(1)">
                    {{ $t('table.search') }}
                </el-button>
                <el-button
                    :loading="downloadLoading"
                    type="primary"
                    icon="el-icon-document"
                    @click="handleDownload"
                >
                    {{ $t('excel.export') }} Excel
                </el-button>
            </el-form>
        </div>
        <el-table
            v-loading="loading"
            border
            highlight-current-row
            :data="list"
            :height="pageheight"
        >
            <el-table-column prop="id" label="ID" width="80" align="center" />

            <el-table-column
                prop="order_no"
                label="订单编号"
                width="160"
                align="center"
            />
            <el-table-column
                prop="user.phone"
                label="用户手机号码"
                align="center"
            />
            <!-- <el-table-column prop="date" label="日期" align="center" /> -->

            <!-- <el-table-column label="手机号码" width="200" header-align="center">
                <template slot-scope="{ row }">
                    <user-info :user="row.user" />
                </template>
            </el-table-column> -->

            <el-table-column prop="order_no" label="订场信息" align="center">
                <template slot-scope="{ row }">
                    <div>
                        <div>类型：{{ row.category.name }}</div>
                        <div>场地：{{ row.goods.name }}</div>
                    </div>
                </template>
            </el-table-column>

            <el-table-column
                prop="order_no"
                label="订场时间"
                width="138"
                align="center"
            >
                <template slot-scope="{ row }">
                    <div>
                        <div>日期：{{ row.date }}</div>

                        <div>开始时间：{{ row.start_time }}</div>
                        <div>结束时间：{{ row.end_time }}</div>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="价格信息" width="138" header-align="center">
                <template slot-scope="{ row }">
                    <div>总价：{{ row.pay_price }}</div>
                    <div>实际支付：{{ row.pay_price }}</div>
                    <div>优惠券抵扣：{{ row.coupon_discount_price }}</div>
                </template>
            </el-table-column>
            <el-table-column
                prop="pay_type_string"
                label="支付方式"
                align="center"
            />
            <el-table-column label="支付状态" width="90" align="center">
                <template slot-scope="{ row }">
                    <el-popover
                        placement="bottom-start"
                        max-width="280"
                        trigger="hover"
                        :content="row.close_reason"
                    >
                        <el-tag
                            slot="reference"
                            :type="payStatusColors[row.pay_status]"
                        >
                            {{ row.pay_status | paraphrase(payStatusOptions) }}
                            <i
                                v-if="row.pay_status == -1"
                                class="el-icon-info"
                            />
                        </el-tag>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="订单状态" width="100" align="center">
                <template slot-scope="{ row }">
                    <el-tag
                        v-if="row.pay_status == 1"
                        :type="statusColors[row.status]"
                    >
                        {{ row.status | paraphrase(statusOptions) }}
                    </el-tag>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column label="售后状态" width="100" align="center">
                <template slot-scope="{ row }">
                    <el-tag
                        v-if="row.pay_status == 1 && row.refund_status != 0"
                        :type="refundStatusColors[row.refund_status]"
                        style="cursor: pointer"
                        @click="onRefundLog(row)"
                    >
                        {{
                            row.refund_status | paraphrase(refundStatusOptions)
                        }}
                        <i class="el-icon-info" />
                    </el-tag>
                    <span v-else>-</span>
                </template>
            </el-table-column>

            <el-table-column label="时间" width="200" align="center">
                <template slot-scope="{ row }">
                    <div>创建时间： {{ row.created_at }}</div>
                    <div>付款时间： {{ row.pay_at }}</div>
                </template></el-table-column
            >

            <el-table-column
                label="操作"
                width="180"
                align="center"
                fixed="right"
            >
                <template slot-scope="{ row }">
                    <!-- <el-button-group>
                        <el-button
                            v-if="hasPermissionNode('StoreOrderDetailed')"
                            type="primary"
                            @click="onDetailed(row)"
                            >订单明细</el-button
                        >
                    </el-button-group> -->
                    <el-button-group>
                        <el-button
                            v-if="
                                row.pay_status == 0 &&
                                row.status == 0 &&
                                row.refund_status == 0
                            "
                            type="warning"
                            @click="onClose(row)"
                            >关闭</el-button
                        >
                    </el-button-group>
                    <el-button-group
                        v-if="row.pay_status == 1 && row.refund_status > 0"
                    >
                        <el-button
                            v-if="row.refund_status == 1"
                            type="success"
                            @click="agree(row)"
                            >通过</el-button
                        >
                        <el-button
                            v-if="row.refund_status == 1"
                            type="danger"
                            @click="reject(row)"
                            >驳回</el-button
                        >
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>
        <pagination
            v-show="pages.total > 0"
            :total="pages.total"
            :page.sync="pages.current"
            :limit.sync="pages.limit"
            @pagination="getList()"
        />

        <!-- 发货 -->
        <!-- <order-ship
            v-if="shipVisible"
            ref="orderShip"
            @refreshList="getList()"
        /> -->

        <!-- 物流 -->
        <!-- <logistics v-if="logisticsVisible" ref="orderLogistics" /> -->

        <!-- 售后记录 -->
        <!-- <refund-log v-if="refundLogVisible" ref="orderRefundLog" /> -->

        <!-- 订单明细 -->
        <!-- <detailed v-if="detailedVisible" ref="orderDetailed" /> -->
    </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getOrderList, close, agree, reject, onExport } from '@/api/store/order'
import { mixin } from '@/utils/mixin'
import UserInfo from '@/components/User/info'
import {
    getOrderPayStatus,
    getOrderStatus,
    getOrderRefundStatus
} from '@/api/main'
import OrderShip from './components/OrderShip'
import Logistics from './components/Logistics'
import RefundLog from './components/RefundLog'
import Detailed from './components/Detailed'
import { getCategory } from '@/api/main'

export default {
    name: 'StoreOrderList',
    components: {
        Pagination,
        UserInfo,
        OrderShip,
        Logistics,
        RefundLog,
        Detailed
    },
    mixins: [mixin],
    data() {
        return {
            list: [],
            search: {
                name: null,
                uid: null,
                phone: null,
                pay_status: null,
                status: null,
                refund_status: null,
                cate_id: null
            },
            // category: {
            //     lazy: true,
            //     lazyLoad(node, resolve) {
            //         getCategory({ pid: node.value })
            //             .then((response) => {
            //                 const category = response.data.map((item) => ({
            //                     value: item.value,
            //                     label: item.label,
            //                     leaf: item.pid > 0
            //                 }))
            //                 resolve(category)
            //             })
            //             .catch(() => {})
            //     }
            // },
            pages: {
                total: 0,
                limit: 20,
                current: 1
            },
            payStatusOptions: [],
            statusOptions: [],
            categoryOptions: [], // 存储分类数据

            refundStatusOptions: [],
            payStatusColors: {
                '-1': 'danger',
                0: 'warning',
                1: 'success'
            },
            statusColors: {
                0: 'info',
                1: 'primary',
                2: 'success'
            },
            refundStatusColors: {
                '-1': 'info',
                0: '',
                1: 'warning',
                2: 'primary',
                3: 'primary',
                4: 'success'
            },
            loading: false,
            shipVisible: false,
            logisticsVisible: false,
            refundLogVisible: false,
            detailedVisible: false
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            this.getOrderPayStatus()
                .then(() => {
                    this.getOrderStatus().then(() => {
                        this.getOrderRefundStatus().then(() => {
                            this.getCategory()
                            this.getList()
                        })
                    })
                })
                .catch(() => {})
        },
        getList(page = this.pages.current, loading = true) {
            if (this.loading) return
            this.loading = loading
            if (page === 1) this.pages.current = page

            // // 判断变量是否为数组
            // let arr_cate_id = this.search.cate_id;
            // if (Array.isArray(arr_cate_id)) {
            //   // 获取数组的最后一位
            //   let lastItem = arr_cate_id[arr_cate_id.length - 1];
            //   console.log("最后一位:", lastItem);
            //   this.search.cate_id = lastItem;
            // } else {
            //   console.log("变量不是数组");
            // }

            getOrderList({ page, ...this.search, limit: this.pages.limit })
                .then((response) => {
                    if (response.code !== 0) return
                    this.list = response.data.data
                    this.pages.total = response.data.total
                })
                .catch((error) => {
                    this.$message.error(error.msg)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        async getOrderPayStatus() {
            await getOrderPayStatus()
                .then((response) => {
                    if (response.data) {
                        this.payStatusOptions = [
                            { value: null, label: '全部' }
                        ].concat(response.data)
                    }
                })
                .catch(() => {})
        },
        async getOrderStatus() {
            await getOrderStatus()
                .then((response) => {
                    console.log(response.data)
                    if (response.data) {
                        this.statusOptions = [
                            { value: null, label: '全部' }
                        ].concat(response.data)
                    }
                })
                .catch(() => {})
        },
        async getCategory() {
            await getCategory({ pid: 0 })
                .then((response) => {
                    this.categoryOptions = response.data.map((item) => ({
                        value: item.value,
                        label: item.label
                    }))
                    resolve(category)
                })
                .catch(() => {})
        },
        async getOrderRefundStatus() {
            await getOrderRefundStatus()
                .then((response) => {
                    if (response.data) {
                        this.refundStatusOptions = [
                            { value: null, label: '全部' }
                        ].concat(response.data)
                    }
                })
                .catch(() => {})
        },
        onClose(row) {
            const { id, order_no } = row
            this.$prompt(
                `#${order_no} 请输入关闭订单理由, 1-20字内`,
                '订单关闭',
                {
                    inputType: 'textarea',
                    inputPattern: /\S/,
                    inputErrorMessage: '关闭订单理由不能为空！',
                    cancelButtonClass: 'btn-custom-cancel',
                    type: 'warning'
                }
            )
                .then(({ value }) => {
                    this.$confirm(`确认关闭订单#${order_no}？`, `确认关闭订单`)
                        .then(() => {
                            close({ id, reason: value })
                                .then(() => {
                                    this.$message.success(`关闭订单成功！`)
                                    this.getList()
                                })
                                .catch(() => {})
                        })
                        .catch(() => {})
                })
                .catch(() => {})
        },
        onDetailed(row) {
            this.detailedVisible = true
            this.$nextTick(() => {
                this.$refs.orderDetailed && this.$refs.orderDetailed.init(row)
            })
        },
        onShip(row) {
            this.shipVisible = true
            row.express_no =
                row.address && row.address.express_no
                    ? row.address.express_no
                    : ''
            this.$nextTick(() => {
                this.$refs.orderShip && this.$refs.orderShip.init(row)
            })
        },
        onLogistics(row, l_type) {
            this.logisticsVisible = true
            row.l_type = l_type
            row.express_no =
                l_type !== 1 && row.address && row.address.express_no
                    ? row.address.express_no
                    : ''
            this.$nextTick(() => {
                this.$refs.orderLogistics && this.$refs.orderLogistics.init(row)
            })
        },
        onRefundLog(row) {
            this.refundLogVisible = true
            this.$nextTick(() => {
                this.$refs.orderRefundLog && this.$refs.orderRefundLog.init(row)
            })
        },
        agree(row) {
            const { id, order_no, refund_type, refund_status, pay_price } = row
            if (
                pay_price > 0 &&
                (refund_type === 0 ||
                    (refund_type === 1 && refund_status === 3))
            ) {
                const { id, order_no } = row
                this.$prompt(`#${order_no} 请输入退款金额`, '订单售后通过', {
                    inputType: 'textarea',
                    inputPattern: /\S/,
                    inputErrorMessage: '退款金额不能为空！',
                    cancelButtonClass: 'btn-custom-cancel',
                    type: 'warning'
                })
                    .then(({ value }) => {
                        this.$confirm(
                            `确认通过#${order_no}退款·申请？`,
                            `确认通过`
                        )
                            .then(() => {
                                agree(id, { reason: value })
                                    .then(() => {
                                        this.$message.success(`成功！`)
                                        this.getList()
                                    })
                                    .catch(() => {})
                            })
                            .catch(() => {})
                    })
                    .catch(() => {})
            } else {
                this.$confirm(`通过订单#${order_no}的退货申请？`, `通过申请`)
                    .then(() => {
                        agree(id)
                            .then(({ msg = `通过成功！` }) => {
                                this.$message.success(msg)
                                this.getList()
                            })
                            .catch(() => {})
                    })
                    .catch(() => {})
            }
        },
        handleDownload() {
            this.downloadLoading = true
            onExport(this.search)
                .then((response) => {
                    this.$router.push({
                        name: 'data_output',
                        params: { id: response.data.id }
                    })
                })
                .catch((error) => {
                    this.$message.error(error.msg)
                })
                .finally(() => {
                    this.downloadLoading = false
                })
        },
        reject(row) {
            const { id, order_no } = row
            this.$prompt(
                `#${order_no} 请输入驳回理由, 1-20字内`,
                '订单售后驳回',
                {
                    inputType: 'textarea',
                    inputPattern: /\S/,
                    inputErrorMessage: '驳回理由不能为空！',
                    cancelButtonClass: 'btn-custom-cancel',
                    type: 'warning'
                }
            )
                .then(({ value }) => {
                    this.$confirm(`确认驳回#${order_no}？`, `确认驳回`)
                        .then(() => {
                            reject(id, { reason: value })
                                .then(() => {
                                    this.$message.success(`关闭订单成功！`)
                                    this.getList()
                                })
                                .catch(() => {})
                        })
                        .catch(() => {})
                })
                .catch(() => {})
        }
    }
}
</script>
<style>
.el-button-group {
    margin: 5px 0;
}
</style>
