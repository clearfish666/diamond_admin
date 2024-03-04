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
        <el-form-item label="手机号">
          <el-input
            v-model="search.phone"
            placeholder="手机号"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="search.currency"
            clearable
            @change="getList(1)"
            @clear="getList(1)"
          >
            <el-option
              v-for="items in currencyOptions"
              :key="items.value"
              :label="items.label"
              :value="items.value"
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
              v-for="items in statusOptions"
              :key="items.value"
              :label="items.label"
              :value="items.value"
            />
          </el-select>
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t("table.search") }}
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
      <el-table-column label="帐号" width="200" header-align="center">
        <template slot-scope="{ row }">
          <user-info :user="row.user" />
        </template>
      </el-table-column>
      <el-table-column
        prop="currency"
        label="使用资产"
        width="80"
        align="center"
      >
        <template slot-scope="{ row }">
          {{ row.currency | paraphrase(currencyOptions) }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="数量" align="center" />
      <el-table-column label="转仓相关" header-align="center">
        <template slot-scope="{ row }">
          <div>转仓数量：{{ row.extend.num || 0 }}</div>
          <div>手续费：{{ row.extend.fee|| 0 }}</div>
          <div>实际数量：{{ row.extend.arrive_num || 0 }}</div>
        </template>
      </el-table-column>
      <el-table-column label="审核员" header-align="center">
        <template slot-scope="{ row: { admin } }">
          <div v-if="admin">
            <div># {{ admin.id }}</div>
            <div># {{ admin.name }}</div>
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="{ row: { status } }">
          <el-tag :type="status | paraphrase(statusOptions,'value', 'tagType')">
            {{ status | paraphrase(statusOptions) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" width="190">
        <template slot-scope="{ row: { created_at, updated_at } }">
          <div>创建: {{ created_at }}</div>
          <div>更新: {{ updated_at }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template slot-scope="{ row }">
          <div v-if="row.status === 0">
            <el-button v-if="hasPermissionNode('WalletWithdrawalAgree')" type="success" @click="agree(row)">通过</el-button>
            <el-button v-if="hasPermissionNode('WalletWithdrawalReject')" type="danger" @click="reject(row)">驳回</el-button>
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
import { getTransferLog, agreeTransfer, rejectTransfer } from '@/api/wallet'
import Pagination from '@/components/Pagination'
import { toFixedDigit } from '@/utils'
import { mixin } from '@/utils/mixin'
import { getCurrencyType } from '@/api/main'
import UserInfo from '@/components/User/info'

export default {
  name: 'WalletTransfer',
  components: { Pagination, UserInfo },
  mixins: [mixin],
  data() {
    return {
      loading: false,
      list: [],
      search: {
        uid: null,
        phone: null,
        status: null,
        currency: null
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      item: [],
      statusOptions: [
        { label: '全部', value: null, tagType: 'info' },
        { label: '待审核', value: 0, tagType: 'warning' },
        { label: '成功', value: 1, tagType: 'success' },
        { label: '驳回', value: 2, tagType: 'danger' }
      ],
      currencyOptions: []
    }
  },
  watch: {
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
      getTransferLog({ page, ...this.search, limit: this.pages.limit })
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
    toFixedNum(data) {
      return toFixedDigit(data, 4)
    },
    searchHandle() {
      this.$refs['wrapper'].searchHandle()
    },
    updateTableHandle() {
      this.$refs['wrapper'] && this.$refs['wrapper'].updateDataHandle()
    },
    agree(row) {
      const { id, amount } = row
      this.$confirm(`通过申请#${id}, 转仓数量:${amount}？`, `通过申请`)
        .then(() => {
          agreeTransfer(id)
            .then(({ msg = `通过成功！` }) => {
              this.$message.success(msg)
              this.getList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    },
    reject(row) {
      const { id, amount } = row
      this.$confirm(`驳回申请#${id}, 转仓数量:${amount}？`, `驳回申请`, {
        type: 'warning'
      })
        .then(() => {
          rejectTransfer(id)
            .then(({ msg = `驳回成功！` }) => {
              this.$message.success(msg)
              this.getList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    },
    async getCurrencyType() {
      await getCurrencyType()
        .then((response) => {
          if (response.data) {
            this.currencyOptions = [{ value: null, label: '全部' }].concat(
              response.data
            )
          }
        })
        .catch(() => {})
    }
  }
}
</script>
