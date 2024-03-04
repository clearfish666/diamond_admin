<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="昵称">
          <el-input v-model="search.name" placeholder="昵称" clearable @clear="getList(1)" @keyup.enter.native="getList(1)" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="search.phone" placeholder="手机号" clearable @clear="getList(1)" @keyup.enter.native="getList(1)" />
        </el-form-item>
        <el-form-item v-if="false" label="类型">
          <el-select v-model="search.currency" clearable @clear="getList(1)" @change="getList(1)">
            <el-option v-for="item in currencyOptions" :key="item.value" :label="item.label" :value="item.value" />
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
      :height="pageheight"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="80"
        align="center"
      />
      <el-table-column
        label="用户"
        width="200"
        header-align="center"
      >
        <template slot-scope="{ row }">
          <user-info :user="row.user" />
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="名称"
        width="180"
        align="center"
      />
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
      <el-table-column
        :label="'扣除数量'"
        prop="amount"
        min-width="120"
        header-align="center"
        align="center"
      />
      <el-table-column
        :label="'到账数量'"
        min-width="120"
        header-align="center"
        align="center"
      >
        <template slot-scope="{ row }">
          <div v-if="row.extend">
            <div>{{ toFixedNum(row.extend.arrive_num) }}</div>
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column
        :label="'手续费(%)'"
        min-width="120"
        header-align="center"
        align="center"
      >
        <template slot-scope="{ row }">
          <div v-if="row.extend">
            <div v-if="row.extend.fee > 0">{{ row.extend.handlingfees }}</div>
            <div v-else>-</div>
            <div v-if="row.extend.fee > 0">({{ row.extend.fee }})</div>
            <div v-else>-</div>
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="created_at"
        label="创建时间"
        width="200"
        header-align="center"
        align="center"
      >
        <template slot-scope="{ row }">
          <div>{{ row.created_at }}</div>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="pages.total > 0" :total="pages.total" :page.sync="pages.current" :limit.sync="pages.limit" @pagination="getList()" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getExchangeLog } from '@/api/wallet'
import { getCurrencyType } from '@/api/main'
import { mixin } from '@/utils/mixin'
import { DominKey, getToken } from '@/utils/auth'
import UserInfo from '@/components/User/info'
import { toFixedDigit } from '@/utils'

export default {
  name: 'WalletExchange',
  components: { Pagination, UserInfo },
  mixins: [mixin],
  data() {
    return {
      domin: getToken(DominKey),
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
      list: [],
      search: {
        name: null,
        phone: null,
        currency: null,
        start_time: null,
        end_time: null
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      currencyOptions: [],
      loading: false
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
      getExchangeLog({ page, ...this.search, limit: this.pages.limit })
        .then(response => {
          if (response.code !== 0) return
          this.list = response.data.data
          this.pages.total = response.data.total
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
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
    toFixedNum(data) {
      return toFixedDigit(Number(data), 2)
    }
  }
}
</script>
