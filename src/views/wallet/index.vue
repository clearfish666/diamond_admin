<template>
    <div class="app-container">
        <div id="search-box" class="filter-container">
            <el-form :inline="true" :model="search">
                <el-form-item label="UID">
                    <el-input
                        v-model="search.uid"
                        placeholder="UID"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                    />
                </el-form-item>
                <!-- <el-form-item label="昵称">
                    <el-input
                        v-model="search.name"
                        placeholder="昵称"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                    />
                </el-form-item> -->
                <el-form-item label="手机号">
                    <el-input
                        v-model="search.phone"
                        placeholder="手机号"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                    />
                </el-form-item>
                <!-- <el-form-item label="类型">
                    <el-select
                        v-model="search.currency"
                        clearable
                        @clear="getList(1)"
                        @change="getList(1)"
                    >
                        <el-option
                            v-for="item in currencyOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item> -->
                <!-- <el-form-item label="最低余额">
                    <el-input-number
                        v-model="search.balance"
                        controls-position="right"
                        placeholder="最低余额"
                        :min="0"
                        :disabled="!search.currency"
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                        @blur="onblur()"
                    />
                </el-form-item> -->
                <el-button icon="el-icon-search" @click="getList(1)">
                    {{ $t('table.search') }}
                </el-button>
                <!-- <el-button :loading="downloadLoading" type="primary" icon="el-icon-document" @click="handleDownload">
          {{ $t('excel.export') }} Excel
        </el-button> -->
            </el-form>
        </div>
        <el-table v-loading="loading" border :data="list" :height="pageheight">
            <el-table-column prop="id" label="Uid" align="center" />
            <el-table-column label="账号" align="center" width="200">
                <template slot-scope="{ row }">
                    <user-info :user="row" />
                </template>
            </el-table-column>
            <el-table-column label="余额" align="center">
                <template slot-scope="{ row }">
                    {{
                        'RMB' | currencyType(row.wallets, 'currency', 'balance')
                    }}</template
                >
            </el-table-column>
            <!-- <el-table-column label="分享权益" align="center">
        <template slot-scope="{ row }">
          {{
            "share_equity" | currencyType(row.wallets, "currency", "balance")
          }}</template>
      </el-table-column>
      <el-table-column label="配售权益" align="center">
        <template slot-scope="{ row }">
          {{ "ration_equity" | currencyType(row.wallets, "currency", "balance") }}
        </template>
      </el-table-column> -->
            <el-table-column
                v-if="false"
                prop="today_income"
                label="今日收益"
                align="center"
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
</template>

<script>
import Pagination from '@/components/Pagination'
import { getWalletList } from '@/api/wallet'
import { getCurrencyType } from '@/api/main'
import { DominKey, getToken } from '@/utils/auth'
import { mixin } from '@/utils/mixin'
import UserInfo from '@/components/User/info'

export default {
    name: 'WalletList',
    components: { Pagination, UserInfo },
    filters: {
        currencyType: function (
            value,
            options,
            condition = 'value',
            result = 'label'
        ) {
            if (!value && !options) return ''
            const data = options.filter(function (v, i) {
                return value === v[condition]
            })
            return data.length === 1 ? data[0][result] : 0
        }
    },
    mixins: [mixin],
    data() {
        return {
            domin: getToken(DominKey),
            list: [],
            search: {
                uid: null,
                name: null,
                phone: null,
                currency: null,
                balance: 0
            },
            pages: {
                total: 0,
                limit: 20,
                current: 1
            },
            currencyOptions: [],
            systemOptions: [],
            loading: false,
            downloadLoading: false
        }
    },
    watch: {
        'search.currency'(val) {
            if (!val) {
                this.search.balance = 0
            }
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            this.getCurrencyType()
                .then(() => {
                    this.getList()
                })
                .catch(() => {})
        },
        getList(page = this.pages.current, loading = true) {
            if (this.loading) return
            this.loading = loading
            if (page === 1) this.pages.current = page
            getWalletList({ page, ...this.search, limit: this.pages.limit })
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
        async getCurrencyType() {
            await getCurrencyType()
                .then((response) => {
                    if (response.data) {
                        this.currencyOptions = [
                            { value: null, label: '全部' }
                        ].concat(response.data)
                    }
                })
                .catch(() => {})
        },
        onblur() {
            if (this.search.balance === undefined) {
                this.search.balance = 0
            }
        },
        handleDownload() {
            this.downloadLoading = true
            // exportExcel(search)
            //   .then((response) => {
            //     this.$router.push({
            //       name: 'data_output',
            //       params: { id: response.data.id }
            //     })
            //   })
            //   .catch((error) => {
            //     this.$message.error(error.msg)
            //   })
            //   .finally(() => {
            //     this.downloadLoading = false
            //   })
        }
    }
}
</script>
<style scoped>
.el-input-number {
    width: 200px;
}
::v-deep .el-table .warning-column {
    background: #f0f9eb;
}
</style>
