<template>
  <div class="app-container">
    <div v-if="hasPermissionNode('SystemConfig')">
      版本控制状态
      <el-switch
        v-model="status_form.value"
        :disabled="!hasPermissionNode('SystemConfigEdit')"
        :active-value="'1'"
        :inactive-value="'0'"
        @change="onChangeStatus"
      />
      <el-divider />
    </div>
    <div v-if="status === '1'">
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
            {{ $t("table.search") }}
          </el-button>
          <el-button
            v-if="hasPermissionNode('VersionAdd')"
            type="primary"
            icon="el-icon-plus"
            @click="onAddOrUpdate()"
          >
            {{ $t("table.add") }}
          </el-button>
        </el-form>
      </div>

      <el-table v-loading="loading" border highlight-current-row :data="list">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="版本类型" align="center">
          <template slot-scope="{ row }">
            {{ row.type >= 0 && typeOptions[row.type + 1].label }}
          </template>
        </el-table-column>
        <el-table-column prop="version_name" label="版本名称" align="center" />
        <el-table-column
          prop="version_code"
          label="内部版本号"
          align="center"
        />
        <el-table-column prop="description" label="版本说明" align="center" />
        <el-table-column prop="link" label="链接地址" align="center" />
        <el-table-column prop="is_forced" label="是否强制更新" align="center">
          <template slot-scope="{ row }">
            {{ row.is_forced >= 0 && forcedOptions[row.is_forced + 1].label }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="发送时间" align="center" />
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
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import AddOrUpdate from './components/AddOrUpdate'
import { dataList } from '@/api/version'
import { getSingleConfig } from '@/api/main'
import { setConfig } from '@/api/configs'
import { DominKey, getToken } from '@/utils/auth'

export default {
  name: 'VerificationList',
  components: { Pagination, AddOrUpdate },
  data() {
    return {
      domin: getToken(DominKey),
      status: '0',
      status_form: {},
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
      typeOptions: [
        { label: '全部', value: null },
        { label: 'android', value: 0 },
        { label: 'ios', value: 1 }
      ],
      forcedOptions: [
        { label: '全部', value: null },
        { label: '否', value: 0 },
        { label: '是', value: 1 }
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
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      loading: false,
      addOrUpdateVisible: false
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getStatus()
    },
    getStatus() {
      getSingleConfig({ type: 'system', group: 'version', key: 'switch' })
        .then((response) => {
          this.status = response.data.value
          this.status_form = response.data
          if (this.status === '1') {
            this.getList()
          }
        })
        .catch((error) => {
          this.$message.error(error.msg)
        })
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
    onChangeStatus() {
      setConfig({ type: 'system', data: { version: { switch: this.status_form }}})
        .then(({ msg }) => {
          this.$message.success(msg)
          this.getStatus()
        })
        .catch(() => {})
    }
  }
}
</script>
