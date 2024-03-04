<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
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
        label="用户信息"
        width="180"
        align="center"
      >
        <template slot-scope="{ row }">
          {{ row.user ? row.user.name : '' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="contact"
        label="联系方式"
        align="center"
      />
      <el-table-column
        prop="content"
        label="意见内容"
        align="center"
      />
      <el-table-column
        prop="created_at"
        label="反馈时间"
        align="center"
      />
    </el-table>
    <pagination v-show="pages.total > 0" :total="pages.total" :page.sync="pages.current" :limit.sync="pages.limit" @pagination="getList()" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { dataList } from '@/api/feedback'
import { DominKey, getToken } from '@/utils/auth'
import { mixin } from '@/utils/mixin'

export default {
  name: 'Feedbacks',
  components: { Pagination },
  mixins: [mixin],
  data() {
    return {
      domin: getToken(DominKey),
      list: [],
      search: {
        start: '',
        end: ''
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      sceneOptions: [
        { label: '注册', value: 'register' },
        { label: '登录', value: 'login' },
        { label: '修改登录密码', value: 'update-login-pass' },
        { label: '设置/修改支付密码', value: 'set-pay-pass' }
      ],
      typeOptions: [
        { label: '手机短信', value: 'sms' },
        { label: '邮件类型', value: 'email' }
      ],
      stateOptions: [
        { label: '发送失败', value: 0 },
        { label: '发送成功', value: 1 }
      ],
      usedOptions: [
        { label: '未使用', value: 0 },
        { label: '已使用', value: 1 }
      ],
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
      loading: false
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
        .then(response => {
          if (response.code !== 0) return
          this.list = response.data.data
          this.pages.total = response.data.total
        })
        .catch(error => {
          this.$message.error(error.msg)
        })
        .finally(() => {
          this.loading = false
        })
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
    }
  }
}
</script>
