<template>
    <el-dialog
        class="el-dialog-wallet"
        title="场地列表"
        :visible.sync="visible"
        :top="'2vh'"
        :close-on-click-modal="false"
        width="80%"
        @closed="onClose()"
    >
        <div id="search-box" class="filter-container">
            <el-form :inline="true" :model="search">
                <el-form-item label="名称">
                    <el-input
                        v-model="search.name"
                        placeholder="名称"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
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
            :height="pageheight - 10"
        >
            <el-table-column prop="id" label="ID" align="center" />

            <el-table-column prop="name" label="名称" align="center" />
            <el-table-column label="操作" align="center" width="150">
                <template slot-scope="{ row }">
                    <el-button-group>
                        <el-button type="primary" @click="onAddOrUpdate(row)"
                            >编辑
                        </el-button>
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
    </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'
import { mixin } from '@/utils/mixin'
import { getGoodsList, deleteData } from '@/api/store/goods'

export default {
    name: 'ReserveGoods',
    components: { Pagination },
    mixins: [mixin],
    data() {
        return {
            visible: false,
            goodsVisible: false,
            data: {},
            search: {
                id: 0,
                arr_goods_id: ''
            },
            list: [],
            pages: {
                total: 0,
                limit: 20,
                current: 1
            },
            loading: false
        }
    },
    methods: {
        init(data) {
            this.visible = true
            this.search.arr_goods_id = data
            this.getList()
        },
        getList(page = this.pages.current, loading = true) {
            if (this.loading) return
            this.loading = loading
            if (page === 1) this.pages.current = page
            getGoodsList({ page, ...this.search, limit: this.pages.limit })
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
            this.categoryVisible = true
            this.$nextTick(() => {
                this.$refs.category && this.$refs.category.init(row)
            })
        },
        onAttrAddOrUpdate(row) {
            this.goodsVisible = true
            this.$nextTick(() => {
                this.$refs.categoryRule && this.$refs.categoryRule.init(row)
            })
        },
        onDelete({ name, id }) {
            this.$confirm(`确定对[${name}(#${id})]进行[删除]操作?`, '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            })
                .then(() => {
                    deleteData(id)
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
