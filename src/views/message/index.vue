<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item v-if="false" label="时间">
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
        <el-button v-if="false" icon="el-icon-search" @click="getList(1)">
          {{ $t('table.search') }}
        </el-button>
        <el-button type="primary" icon="el-icon-plus" @click="onAddOrUpdate()">
          {{ $t('table.add') }}
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
        label="管理员信息"
        width="180"
        align="center"
      >
        <template slot-scope="{ row }">
          {{ row.admin ? row.admin.name : '' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="消息标题"
        align="center"
      />
      <el-table-column
        prop="content"
        label="系统消息"
        align="center"
      />
      <el-table-column
        prop="created_at"
        label="发送时间"
        align="center"
      />
      <el-table-column
        label="操作"
        width="180"
        align="center"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="primary" @click="onAddOrUpdate(row)">编辑</el-button>
          <el-button type="danger" @click="onDelete({ row, $index })">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="pages.total > 0" :total="pages.total" :page.sync="pages.current" :limit.sync="pages.limit" @pagination="getList()" />

    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update
      v-if="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshList="getList(1)"
    />

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import AddOrUpdate from './components/AddOrUpdate'
import { dataList, deleteData } from '@/api/message'
import { DominKey, getToken } from '@/utils/auth'
import {mixin} from '@/utils/mixin'

export default {
  name: 'messages',
  components: { Pagination, AddOrUpdate },
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
      loading: false,
      addOrUpdateVisible: false
    }
  },
  mixins:[mixin],
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
    onAddOrUpdate(data) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate && this.$refs.addOrUpdate.init(data)
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
    },
    onDelete({ row, $index }) {
      this.$confirm(
        `确定对[(#${row.id})]进行[删除]操作?`,
        '删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
      )
        .then(() => {
          deleteData(row.id)
            .then(({ msg = '删除成功' }) => {
              this.$message.success(msg)
              this.list.splice($index, 1)
              if (this.list.length === 0) {
                this.init()
              }
            })
            .catch(() => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    }
  }
}
</script>
