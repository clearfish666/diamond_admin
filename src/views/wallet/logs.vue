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
        <el-form-item label="昵称">
          <el-input
            v-model="search.name"
            placeholder="昵称"
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
        <el-form-item label="钱包类型">
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
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="search.type"
            clearable
            @clear="getList(1)"
            @change="getList(1)"
          >
            <el-option
              v-for="item in walletLogOptions"
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
          {{ $t("table.search") }}
        </el-button>
        <el-button :loading="downloadLoading" type="primary" icon="el-icon-document" @click="handleDownload">
          {{ $t('excel.export') }} Excel
        </el-button>
      </el-form>
    </div>
    <el-table
      v-loading="loading"
      border
      :data="list"
      :height="pageheight"
    >
      <el-table-column prop="id" label="id" align="center" />
      <el-table-column label="账号" align="center" width="200">
        <template slot-scope="{ row }">
          <user-info :user="row.user" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column
        prop="currency"
        label="钱包"
        width="80"
        align="center"
      >
        <template slot-scope="{ row }">
          {{ row.currency | paraphrase(currencyOptions) }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="数量" align="center" />
      <el-table-column
        prop="status"
        label="状态"
        align="center"
      >
        <template slot-scope="{ row: { status } }">
          <el-tag :type="status | paraphrase(statusOptions,'value', 'tagType')">
            {{ status | paraphrase(statusOptions) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="created_at"
        label="创建时间"
        width="200"
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
import { getWalletLogList, onExport } from '@/api/wallet'
import { getCurrencyType, getWalletLogType } from '@/api/main'
import { DominKey, getToken } from '@/utils/auth'
import { mixin } from '@/utils/mixin'
import UserInfo from '@/components/User/info'

export default {
  name: 'WalletLogList',
  components: { Pagination, UserInfo },
  mixins: [mixin],
  data() {
    return {
      domin: getToken(DominKey),
      list: [],
      dateRangeValue: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近24小时',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      search: {
        uid: null,
        name: null,
        phone: null,
        currency: null,
        type: null,
        status: null,
        start_time: null,
        end_time: null
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      statusOptions: [
        { label: '全部', value: null, tagType: 'info' },
        { label: '待审核', value: 0, tagType: 'warning' },
        { label: '成功', value: 1, tagType: 'success' },
        { label: '驳回', value: 2, tagType: 'danger' }
      ],
      currencyOptions: [],
      walletLogOptions: [],
      loading: false,
      downloadLoading: false
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getCurrencyType()
        .then(() => {
          this.getWalletLogType()
            .then(() => {
              this.getList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    },
    getList(page = this.pages.current, loading = true) {
      if (this.loading) return
      this.loading = loading
      if (page === 1) this.pages.current = page
      getWalletLogList({ page, ...this.search, limit: this.pages.limit })
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
            this.currencyOptions = [{ value: null, label: '全部' }].concat(
              response.data
            )
          }
        })
        .catch(() => {})
    },
    async getWalletLogType() {
      await getWalletLogType()
        .then((response) => {
          if (response.data) {
            this.walletLogOptions = [{ value: null, label: '全部' }].concat(
              response.data
            )
          }
        })
        .catch(() => {})
    },
    onChangeDateRange(value) {
      if (Array.isArray(value)) {
        this.search.start_time = value[0]
        this.search.end_time = value[1]
      } else {
        this.search.start_time = ''
        this.search.end_time = ''
        this.getList(1)
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
    }
  }
}
</script>
