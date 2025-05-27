<template>
    <div class="app-container">
        <div id="search-box" class="filter-container">
            <el-form :inline="true" :model="search">
                <el-form-item label="场地类型:" prop="category_id">
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

                <el-button icon="el-icon-search" @click="getList(1)">
                    {{ $t('table.search') }}
                </el-button>
                <el-button
                    type="primary"
                    icon="el-icon-plus"
                    @click="onAddOrUpdate()"
                >
                    {{ $t('table.add') }}
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

            <el-table-column prop="order_no" label="订场信息" align="center">
                <template slot-scope="{ row }">
                    <div>
                        <div>类型：{{ row.category.name }}</div>
                        <div>场地：{{ row.goods.name }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                prop="start_date"
                label="开始日期"
                align="center"
            />
            <el-table-column prop="end_date" label="结束日期" align="center" />
            <el-table-column label="订场时间" width="138" align="center">
                <template slot-scope="{ row }">
                    <div>
                        <div>开始时间：{{ row.start_time }}</div>
                        <div>结束时间：{{ row.end_time }}</div>
                    </div>
                </template>
            </el-table-column>

            <el-table-column
                label="创建时间"
                prop="created_at"
                align="center"
            />

            <el-table-column label="操作" width="200" align="center">
                <template slot-scope="{ row }">
                    <el-button type="primary" @click="onAddOrUpdate(row)"
                        >修改</el-button
                    >
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
        <!-- 弹窗, 新增 / 修改 -->
        <lock-add-or-update
            v-if="addOrUpdateVisible"
            ref="addOrUpdate"
            @refreshList="getList(1)"
        />
    </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { dataList, deleteData, onExport } from '@/api/lock_order'
import { mixin } from '@/utils/mixin'
import LockAddOrUpdate from './components/LockAddOrUpdate'
import { getCategory } from '@/api/main'

export default {
    name: 'LockOrderList',
    components: {
        Pagination,
        LockAddOrUpdate
    },
    mixins: [mixin],
    data() {
        return {
            list: [],
            search: {
                name: null,
                cate_id: null
            },

            pages: {
                total: 0,
                limit: 20,
                current: 1
            },

            categoryOptions: [], // 存储分类数据
            loading: false,
            addOrUpdateVisible: false
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            this.getCategory()
            this.getList()
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
        }
    }
}
</script>
<style>
.el-button-group {
    margin: 5px 0;
}
</style>
