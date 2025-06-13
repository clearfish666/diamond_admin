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
                <el-form-item label="手机">
                    <el-input
                        v-model="search.phone"
                        placeholder="手机"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select
                        v-model="search.state"
                        clearable
                        @change="getList(1)"
                    >
                        <el-option
                            v-for="item in stateOptions"
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
                    v-if="hasPermissionNode('UserAdd')"
                    type="primary"
                    icon="el-icon-plus"
                    @click="onAddOrUpdate()"
                >
                    {{ $t('table.add') }}
                </el-button>
            </el-form>
        </div>
        <el-table v-loading="loading" border :data="list" :height="pageheight">
            <el-table-column prop="id" label="ID" align="center" />
            <el-table-column label="帐号" width="200" header-align="center">
                <template slot-scope="{ row }">
                    <user-info :user="row" />
                </template>
            </el-table-column>
            <el-table-column label="等级" width="100" align="center">
                <template slot-scope="{ row: { level } }">
                    <span v-if="level">
                        {{ level.name }}
                    </span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="code" label="邀请码" align="center" /> -->
            <el-table-column prop="state" label="状态" align="center">
                <template slot-scope="{ row }">
                    <el-tag :type="row.state ? 'danger' : 'success'"
                        >{{ row.state | paraphrase(stateOptions) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="is_admin" label="管理员" align="center">
                <template slot-scope="{ row }">
                    <el-tag :type="row.is_admin ? 'danger' : 'success'"
                        >{{ row.is_admin | paraphrase(adminOptions) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="can_pay" label="允许订场" align="center">
                <template slot-scope="{ row }">
                    <el-tag :type="row.can_pay ? 'success' : 'danger'"
                        >{{ row.can_pay | paraphrase(canPayOptions) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column
                prop="created_at"
                label="创建时间"
                width="200"
                align="center"
            />
            <el-table-column label="操作" align="center" width="200">
                <template slot-scope="{ row }">
                    <el-button-group>
                        <el-button
                            v-if="hasPermissionNode('UserEdit')"
                            type="primary"
                            @click="onAddOrUpdate(row)"
                            >编辑
                        </el-button>
                        <el-button type="primary" @click="onWallet(row)"
                            >钱包</el-button
                        >
                    </el-button-group>
                    <p v-if="hasPermissionNode('LooKUserInvite')" />
                    <!-- <el-button-group>
            <el-button
              v-if="hasPermissionNode('LooKUserInvite')"
              type="primary"
              @click="onSubset(row)"
              >邀请</el-button
            >
          </el-button-group> -->
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
        <!-- 钱包 -->
        <wallet v-if="walletVisible" ref="wallet" />
        <!-- 邀请 -->
        <subset v-if="subsetVisible" ref="subset" />
    </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { dataList } from '@/api/user'
import AddOrUpdate from './components/AddOrUpdate'
import Subset from './components/Subset'
import Wallet from './components/Wallet'
import { getToken, DominKey } from '@/utils/auth'
import { mixin } from '@/utils/mixin'
import UserInfo from '@/components/User/info'

export default {
    name: 'UserList',
    components: {
        Pagination,
        AddOrUpdate,
        Subset,
        Wallet,
        UserInfo
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
                state: null
            },
            pages: {
                total: 0,
                limit: 20,
                current: 1
            },
            stateOptions: [
                { label: '全部', value: null },
                { label: '正常', value: 0 },
                { label: '禁用', value: 1 }
            ],
            adminOptions: [
                { label: '否', value: 0 },
                { label: '是', value: 1 }
            ],
            canPayOptions: [
                { label: '否', value: 0 },
                { label: '是', value: 1 }
            ],
            loading: false,
            addOrUpdateVisible: false,
            subsetVisible: false,
            walletVisible: false
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
                .catch(() => {})
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
        onSubset(data) {
            this.subsetVisible = true
            this.$nextTick(() => {
                this.$refs.subset && this.$refs.subset.init(data)
            })
        },
        onWallet(data) {
            this.walletVisible = true
            this.$nextTick(() => {
                this.$refs.wallet && this.$refs.wallet.init(data)
            })
        },
        onDelete({ name, id }) {
            this.$confirm(`确定对[${name}(#${id})]进行[删除]操作?`, '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            })
                .then(() => {
                    this.$message.success('删除成功')
                })
                .catch(() => {})
        }
    }
}
</script>

<style lang="scss" scoped>
.alert-wrapper {
    background: #303133;
    color: #fff;
    padding-top: 0;
    padding-bottom: 0;

    &[x-placement^='top'] .popper__arrow::after {
        border-top-color: #303133;
    }
}

::v-deep .image-slot {
    font-size: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
}

::v-deep .el-divider--horizontal {
    margin: 10px 0;
}

::v-deep .el-divider__text {
    padding: 0;
    color: #909399;
}
</style>
