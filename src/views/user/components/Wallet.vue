<template>
    <div>
        <el-dialog
            class="el-dialog-wallet"
            :title="data.nickname + ':钱包详情'"
            :visible.sync="visible"
            :top="'2vh'"
            :close-on-click-modal="false"
            @closed="onClose()"
        >
            <el-row style="margin-bottom: 4px">
                <el-button
                    v-if="hasPermissionNode('ChangeUserWallets')"
                    type="text"
                    @click="onSetWallet(data)"
                    >增加/扣除</el-button
                >
                <el-divider
                    v-if="hasPermissionNode('ChangeUserWallets')"
                    direction="vertical"
                />
                <el-col
                    v-for="(wallet, index) in wallets"
                    :key="index"
                    :span="24"
                >
                    <span>{{ wallet.name }}：</span>
                    <span>{{ wallet.balance }}</span
                    ><span v-if="wallet.currency == 'RATION_EQUITY'">
                        待释放：{{ wallet.freeze }}</span
                    >
                </el-col>
            </el-row>
            <el-divider />
            <div id="search-box" class="filter-container">
                <el-form :inline="true" :model="search">
                    <el-form-item label="币种">
                        <el-select
                            v-model="search.currency"
                            clearable
                            @change="getList(1)"
                            @clear="getList(1)"
                        >
                            <el-option
                                v-for="item in currencyOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="收支">
                        <el-select
                            v-model="search.action"
                            clearable
                            @change="getList(1)"
                            @clear="getList(1)"
                        >
                            <el-option
                                v-for="item in actionOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select
                            v-model="search.status"
                            clearable
                            @change="getList(1)"
                            @clear="getList(1)"
                        >
                            <el-option
                                v-for="item in statusOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="时间">
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
                </el-form>
            </div>
            <el-table
                v-loading="loading"
                border
                highlight-current-row
                :data="list"
                :height="pageheight - 120"
            >
                <el-table-column
                    prop="id"
                    label="ID"
                    width="80"
                    align="center"
                />
                <el-table-column prop="title" label="标题" align="center" />
                <el-table-column prop="amount" label="数量" align="center" />
                <!-- <el-table-column label="贡献者" min-width="120" header-align="center">
          <template slot-scope="{ row }">
            <div v-if="row.target_user">
              <el-avatar :key="row.id" icon="el-icon-user-solid" :src="
                row.target_user
                  ? row.target_user.avatar
                    ? domin + row.target_user.avatar
                    : ''
                  : ''
              " />
              <div style="display: inline-block; margin-left: 10px">
                <div>
                  {{ row.target_user ? row.target_user.name : "-" }}
                </div>
                <div>
                  {{ row.target_user ? row.target_user.tel : "-" }}
                </div>
              </div>
            </div>
            <div v-else style="text-align: center">-</div>
          </template>
        </el-table-column> -->
                <el-table-column prop="currency" label="货币" align="center">
                    <template slot-scope="{ row }">
                        {{ row.currency | paraphrase(currencyOptions) }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="extend"
                    label="操作人"
                    header-align="center"
                >
                    <template slot-scope="{ row }">
                        <div v-if="row.extend">
                            <div># {{ row.extend.id }}</div>
                            <div>
                                {{ row.extend.name }}
                            </div>
                        </div>
                        <div v-else>-</div>
                    </template>
                </el-table-column>
                <el-table-column prop="action" label="收支" align="center">
                    <template slot-scope="{ row }">
                        <el-tag :type="row.action === 1 ? 'success' : 'danger'"
                            >{{ row.action | paraphrase(actionOptions) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" align="center">
                    <template slot-scope="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : 'danger'"
                            >{{ row.status | paraphrase(statusOptions) }}
                        </el-tag>
                    </template></el-table-column
                >
                <el-table-column
                    prop="created_at"
                    label="创建时间"
                    width="160"
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
        </el-dialog>

        <!-- 增加/扣除 -->
        <SetWallet
            v-if="setWalletVisible"
            ref="setWallet"
            @refreshList="getList(1)"
        />
    </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getCurrencyType } from '@/api/main'
import { getUserWallet, getWalletLog } from '@/api/user'
import { DominKey, getToken } from '@/utils/auth'
import SetWallet from './SetWallet'
import { mixin } from '@/utils/mixin'

export default {
    name: 'Wallet',
    components: { Pagination, SetWallet },
    mixins: [mixin],
    data() {
        return {
            visible: false,
            domin: getToken(DominKey),
            data: {
                id: 0,
                name: '',
                avatar: ''
            },
            wallets: [],
            list: [],
            search: {
                currency: null,
                action: null,
                status: null,
                start: null,
                end: null
            },
            pages: {
                total: 0,
                limit: 20,
                current: 1
            },
            currencyOptions: [],
            actionOptions: [
                { label: '全部', value: null },
                { label: '收入', value: 1 },
                { label: '支出', value: 2 }
            ],
            statusOptions: [
                { label: '全部', value: null },
                { label: '待入帐', value: 0 },
                { label: '已入帐', value: 1 },
                { label: '入帐失败', value: 2 }
            ],
            dateRangeValue: [],
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近24小时',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24)
                            picker.$emit('pick', [start, end])
                        }
                    },
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
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 90
                            )
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
            loading: false,
            setWalletVisible: false
        }
    },
    methods: {
        init(data) {
            this.onGetCurrencyType()
                .then(() => {
                    if (data) {
                        this.visible = true
                        this.onGetUserWallet(data.id)
                            .then(() => {
                                this.data = data
                                this.getList()
                            })
                            .catch(() => {})
                    }
                })
                .catch(() => {})
        },
        getList(page = this.pages.current, loading = true) {
            if (this.loading) return
            this.loading = loading
            if (page === 1) this.pages.current = page

            var search = Object.assign({}, this.search)
            Object.assign(search, { uid: this.data.id })

            getWalletLog({ page, ...search, limit: this.pages.limit })
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
        async onGetCurrencyType() {
            await getCurrencyType()
                .then((response) => {
                    this.currencyOptions = [
                        { value: null, label: '全部' }
                    ].concat(response.data)
                })
                .catch(() => {})
        },
        async onGetUserWallet(uid) {
            await getUserWallet(uid)
                .then((data) => {
                    this.wallets = data.data
                })
                .catch(() => {})
        },
        onChangeDateRange(value) {
            if (Array.isArray(value)) {
                this.search.start = value[0]
                this.search.end = value[1]
            } else {
                this.search.start = ''
                this.search.end = ''
                this.getList(1)
            }
        },
        onClose() {
            this.$reset('search', false)
            this.$reset('walletData', false)
            this.$reset('data', false)
        },
        onSetWallet(data) {
            this.setWalletVisible = true
            this.$nextTick(() => {
                this.$refs.setWallet && this.$refs.setWallet.init(data)
            })
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog-wallet .el-dialog {
    width: 1240px;
}

::v-deep .user-avatar {
    vertical-align: middle;
}
</style>
<style>
.el-dialog__body {
    padding: 0px 20px !important;
}
</style>
