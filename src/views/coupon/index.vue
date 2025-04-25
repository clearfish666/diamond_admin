<template>
    <div class="app-container">
        <div id="search-box" class="filter-container">
            <el-form :inline="true" :model="search">
                <el-button
                    type="primary"
                    icon="el-icon-plus"
                    @click="onAddOrUpdate()"
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
            :height="pageheight"
        >
            <el-table-column prop="id" label="ID" align="center" />
            <el-table-column prop="name" label="名称" align="center" />
            <el-table-column prop="coupon_code" label="领取码" align="center" />
            <el-table-column prop="total" label="发行量" align="center" />
            <el-table-column
                prop="received"
                label="已领取数量"
                align="center"
            />

            <el-table-column prop="type" label="类型" align="center">
                <template slot-scope="{ row }">
                    <div>
                        {{ typeOptions[row.type] }}
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
                    <el-button-group>
                        <el-button type="primary" @click="onUserCoupon(row)"
                            >领取记录</el-button
                        >
                    </el-button-group>
                    <el-button-group>
                        <el-button type="primary" @click="onAddOrUpdate(row)"
                            >修改</el-button
                        >
                        <el-button type="danger" @click="onDelete(row)"
                            >删除</el-button
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

        <!-- 弹窗, 新增 / 修改 -->
        <add-or-update
            v-if="addOrUpdateVisible"
            ref="addOrUpdate"
            @refreshList="getList(1)"
        />
        <user-coupon
            v-if="userCouponVisible"
            ref="userCouponRef"
            @refreshList="getList(1)"
        />
    </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import AddOrUpdate from './components/AddOrUpdate'
import UserCoupon from './components/UserCoupon'
import { dataList, deleteData } from '@/api/coupon'
import { getBaseUrl } from '@/utils/auth'
import { mixin } from '@/utils/mixin'

export default {
    name: 'Coupon',
    components: { Pagination, AddOrUpdate, UserCoupon },
    mixins: [mixin],
    data() {
        return {
            image_domin: getBaseUrl(),
            list: [],
            search: {
                url_type: '',
                type: ''
            },
            pages: {
                total: 0,
                limit: 20,
                current: 1
            },
            typeOptions: {
                2: '折扣券', // 类型 2 表示折扣券
                3: '代金券' // 类型 3 表示代金券
            },
            loading: false,
            addOrUpdateVisible: false,
            userCouponVisible: false
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            this.getList()
        },
        getList(page = this.pages.current, loading = true) {
            if (this.loading) return
            this.loading = loading
            if (page === 1) this.pages.current = page
            dataList({ page, ...this.search, limit: this.pages.limit })
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
        onAddOrUpdate(data) {
            this.addOrUpdateVisible = true
            this.$nextTick(() => {
                this.$refs.addOrUpdate && this.$refs.addOrUpdate.init(data)
            })
        },
        onUserCoupon(data) {
            this.userCouponVisible = true
            this.$nextTick(() => {
                this.$refs.userCouponRef && this.$refs.userCouponRef.init(data)
            })
        },
        onDelete({ id }) {
            this.$confirm(`确定对[(#${id})]进行[删除]操作?`, '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            })
                .then(() => {
                    deleteData(id)
                        .then(({ msg = '删除成功' }) => {
                            this.$message.success(msg)
                            this.init()
                        })
                        .catch(() => {
                            this.$message.error('删除失败')
                        })
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

