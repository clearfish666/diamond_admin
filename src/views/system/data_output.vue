<template>
    <div class="app-container">
        <div id="search-box" class="filter-container">
            <el-form :inline="true" :model="search">
                <el-form-item label="ID">
                    <el-input
                        v-model="search.id"
                        placeholder="ID"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                    />
                </el-form-item>
                <el-form-item label="类型">
                    <el-select
                        v-model="search.type"
                        clearable
                        @change="getList(1)"
                        @clear="getList(1)"
                    >
                        <el-option
                            v-for="items in typeType"
                            :key="items.value"
                            :label="items.label"
                            :value="items.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="时间">
                    <el-date-picker
                        v-model="search.date"
                        type="date"
                        :value-format="`yyyy-MM-dd`"
                        placeholder="选择日期"
                        @change="getList(1)"
                    />
                </el-form-item>
                <el-button icon="el-icon-search" @click="getList(1)">
                    {{ $t('table.search') }}
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
            <el-table-column label="类型" align="center">
                <template slot-scope="{ row: { type } }">
                    <el-tag :type="typeFormat(type).type">
                        {{ typeFormat(type).label }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="进度" align="center">
                <template slot-scope="{ row: { planned_speed } }">
                    {{ planned_speed }}%
                </template>
            </el-table-column>
            <el-table-column
                prop="created_at"
                label="生成时间"
                align="center"
            />
            <el-table-column label="状态" align="center">
                <template slot-scope="{ row: { status } }">
                    <el-tag :type="statusType[status].type">
                        {{ statusType[status].label }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="管理员" align="center">
                <template slot-scope="{ row: { admin } }">
                    <div v-if="admin">
                        <div># {{ admin.id }}</div>
                        <div>{{ admin.name }}</div>
                    </div>
                    <div v-else>-</div>
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                width="180"
                align="center"
                fixed="right"
            >
                <template slot-scope="{ row }">
                    <div v-if="row.status === 1">
                        <el-button
                            type="success"
                            :loading="downloadLoading"
                            @click="onHandleDownload(row)"
                            >下载</el-button
                        >
                        <el-button type="danger" @click="onDelete(row)"
                            >删除</el-button
                        >
                    </div>
                    <div v-if="row.status === 2">
                        <el-button
                            type="primary"
                            :loading="rtryLoading"
                            @click="onHandleRetry(row)"
                            >重试</el-button
                        >
                    </div>
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
    </div>
</template>

<script>
import { parseTime } from '@/utils/index.js'
import {
    getDataOutputLogs,
    retryDataOutputLog,
    deleteDataOutputLogs
} from '@/api/common'
import Pagination from '@/components/Pagination'
import { mixin } from '@/utils/mixin'

export default {
    name: 'DataOutput',
    components: { Pagination },
    mixins: [mixin],
    data() {
        return {
            loading: false,
            list: [],
            search: {
                id: '',
                type: '',
                date: ''
            },
            pages: {
                total: 0,
                limit: 20,
                current: 1
            },
            typeType: [
                { label: '全部', value: '' },
                { label: '订场订单', value: 'orders' },
                { label: '充值订单', value: 'recharge_orders' }
            ],
            statusType: [
                { label: '生成中', value: 0, type: 'warning' },
                { label: '成功', value: 1, type: 'success ' },
                { label: '失败', value: 2, type: 'danger' },
                { label: '超时', value: 3, type: 'danger' }
            ],
            downloadLoading: false,
            rtryLoading: false
        }
    },
    watch: {
        $route(to, from) {
            // 监听路由是否变化
            if (to.params.id !== from.params.id) {
                this.init() // 重新加载数据
            }
        },
        time(val) {
            if (val) {
                this.search['start_time'] = val[0]
                this.search['end_time'] = val[1]
            } else {
                this.search.start_time = this.search.end_time = ''
            }
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            const { id } = this.$route.params
            if (id) {
                this.search.id = id
            }
            this.search.date = parseTime(new Date(), '{y}-{m}-{d}')
            this.getList()
        },
        getList(page = this.pages.current, loading = true) {
            if (this.loading) return
            this.loading = loading
            if (page === 1) this.pages.current = page
            getDataOutputLogs({ page, ...this.search, limit: this.pages.limit })
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
        typeFormat(data) {
            const typeItem = this.typeType.filter((v) => {
                return v.value === data
            })
            if (typeItem.length > 0) {
                return typeItem[0]
            } else {
                return {}
            }
        },
        onHandleDownload(row) {
            this.downloadLoading = true
            if (row.file) {
                let baseUrl = process.env.VUE_APP_BASE_API
                baseUrl = baseUrl.slice(0, -6)
                window.open(baseUrl + row.file)
            }
            this.downloadLoading = false
        },
        onDelete(row) {
            this.$confirm(`确定对[(#${row.id})]进行[删除]操作?`, '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            })
                .then(() => {
                    deleteDataOutputLogs(row.id)
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
        onHandleRetry(row) {
            this.rtryLoading = true
            this.$confirm(`确定对[(#${row.id})]进行[重试]操作?`, '重试', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            })
                .then(() => {
                    retryDataOutputLog(row.id)
                        .then(({ msg = '操作成功' }) => {
                            this.rtryLoading = false
                            this.$message.success(msg)
                            this.init()
                        })
                        .catch(() => {
                            this.rtryLoading = false
                            this.$message.error('操作失败')
                        })
                })
                .catch(() => {})
        }
    }
}
</script>
