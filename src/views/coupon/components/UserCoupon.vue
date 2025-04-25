<template>
    <el-dialog
        class="el-dialog-wallet"
        title="优惠券用户"
        :visible.sync="visible"
        :top="'2vh'"
        :close-on-click-modal="false"
        width="70%"
        @closed="onClose()"
    >
        <div id="search-box" class="filter-container">
            <el-form :inline="true" :model="search">
                <el-form-item label="手机号码">
                    <el-input
                        v-model="search.phone"
                        placeholder="手机号码"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                    />
                </el-form-item>

                <el-button icon="el-icon-search" @click="getList(1)">
                    {{ $t('table.search') }}
                </el-button>
                <el-button
                    type="primary"
                    icon="el-icon-plus"
                    @click="onAddOrUpdate({ coupon_id: search.coupon_id })"
                >
                    {{ $t('table.add') }}
                </el-button>
            </el-form>
        </div>
        <el-table
            v-loading="loading"
            border
            highlight-current-row
            :data="list"
            :height="pageheight - 10"
        >
            <el-table-column prop="id" label="ID" align="center" />
            <el-table-column
                prop="user.phone"
                label="用户手机号码"
                align="center"
            />
            <el-table-column prop="name" label="名称" align="center" />

            <el-table-column prop="type" label="类型" align="center">
                <template slot-scope="{ row }">
                    <div>
                        {{ typeOptions[row.type] }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" align="center">
                <template slot-scope="{ row }">
                    <div>
                        {{ statusOptions[row.status] }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="discount_rate" label="折扣" align="center" />
            <el-table-column prop="amount" label="代金金额" align="center" />
            <el-table-column label="使用时间" width="220" align="center">
                <template slot-scope="{ row }">
                    <div>开始时间：{{ row.start_time }}</div>
                    <div>结束时间：{{ row.end_time }}</div>
                </template>
            </el-table-column>
            <el-table-column
                prop="created_at"
                label="创建时间"
                width="160"
                align="center"
            />
            <el-table-column label="操作" align="center">
                <template slot-scope="{ row }">
                    <!-- <el-button type="primary" @click="onAddOrUpdate(row)"
                        >修改</el-button
                    > -->
                    <el-button type="danger" @click="onDelete(row)"
                        >删除</el-button
                    >
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

        <!-- <reserve-goods-update
            v-if="reserveGoodsVisible"
            ref="reserveGoodsRef"
            @refreshList="getList(1)"
        /> -->

        <send-coupon
            v-if="sendCouponVisible"
            ref="sendCouponRef"
            @refreshList="getList(1)"
        />
    </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'
import { mixin } from '@/utils/mixin'
import { userCouponList, deleteUserData } from '@/api/coupon'
import SendCoupon from './SendCoupon'

export default {
    name: 'UserCoupon',
    components: { Pagination, SendCoupon },
    mixins: [mixin],
    data() {
        return {
            visible: false,
            data: {},
            search: {
                id: 0,
                coupon_id: 0,
                phone: ''
            },
            list: [],
            pages: {
                total: 0,
                limit: 20,
                current: 1
            },
            typeOptions: {
                2: '折扣券', // 类型 2 表示折扣券
                3: '代金券' // 类型 3 表示代金券
            },
            statusOptions: {
                1: '待使用',
                2: '已使用',
                3: '已失效'
            },
            loading: false,
            sendCouponVisible: false
        }
    },
    methods: {
        init(data) {
            this.visible = true
            this.search.coupon_id = data.id
            this.getList()
        },
        getList(page = this.pages.current, loading = true) {
            if (this.loading) return
            this.loading = loading
            if (page === 1) this.pages.current = page
            userCouponList({ page, ...this.search, limit: this.pages.limit })
                .then((response) => {
                    if (response.code !== 0) return
                    this.list = response.data.data
                    console.log(this.list)
                    this.pages.total = response.data.total
                })
                .catch((error) => {
                    this.$message.error(error.msg)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        onClose() {
            this.$reset('data', false)
            this.visible = false
        },
        onAddOrUpdate(row) {
            this.sendCouponVisible = true
            this.$nextTick(() => {
                this.$refs.sendCouponRef && this.$refs.sendCouponRef.init(row)
            })
        },
        onDelete({ name, id }) {
            this.$confirm(`确定对[${name}(#${id})]进行[删除]操作?`, '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            })
                .then(() => {
                    deleteUserData(id)
                        .then(({ msg = '删除成功' }) => {
                            this.$message.success(msg)
                            this.getList()
                        })
                        .catch(() => {})
                })

                .catch(() => {})
        }
    }
}
</script>
