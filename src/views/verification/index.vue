<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="接收账号">
          <el-input
            v-model="search.account"
            placeholder="账号"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
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
      <el-table-column prop="code" label="验证码" align="center" />
      <el-table-column
        prop="account"
        width="200"
        label="接收账号"
        align="center"
      />
      <el-table-column prop="scene" label="使用类型" align="center">
        <template slot-scope="{ row }">
          {{ row.scene | currencyType(sceneOptions) }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="验证类型" align="center">
        <template slot-scope="{ row }">
          {{ row.type | currencyType(typeOptions) }}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="发送状态" align="center">
        <template slot-scope="{ row }">
          {{ row.state | currencyType(stateOptions) }}
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="发送IP" align="center" />
      <el-table-column prop="used" label="使用状态" align="center">
        <template slot-scope="{ row }">
          {{ row.used | currencyType(usedOptions) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="used_at"
        label="使用时间"
        width="160"
        align="center"
      >
        <template slot-scope="{ row }">
          {{ row.used_at || "-" }}
        </template>
      </el-table-column>
      <el-table-column
        prop="message"
        width="100"
        label="信息"
        align="center"
        :show-overflow-tooltip="true"
      />
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
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { dataList } from '@/api/verification'
import { getVerificationCodeType } from '@/api/main'
import { mixin } from '@/utils/mixin'

export default {
  name: 'VerificationList',
  components: { Pagination },
  filters: {
    currencyType: function(value, options) {
      if (!value && !options) return ''
      const data = options.filter(function(v, i) {
        return value === v.value
      })
      return data.length === 1 && data[0].label
    }
  },
  mixins: [mixin],
  data() {
    return {
      list: [],
      search: {
        account: null
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      sceneOptions: [],
      typeOptions: [
        { label: '短信', value: 0 },
        { label: '邮件', value: 1 }
      ],
      stateOptions: [
        { label: '发送失败', value: 0 },
        { label: '发送成功', value: 1 }
      ],
      usedOptions: [
        { label: '未使用', value: 0 },
        { label: '已使用', value: 1 }
      ],
      loading: false
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.onVerificationCodeType()
        .then(() => {
          this.getList()
        })
        .catch(() => {})
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
    async onVerificationCodeType() {
      await getVerificationCodeType()
        .then((response) => {
          if (response.data) {
            this.sceneOptions = response.data
          }
        })
        .catch(() => {})
    }
  }
}
</script>
