<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="名称">
          <el-input
            v-model="search.name"
            placeholder="名称"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
        </el-form-item>
        <el-form-item label="别名">
          <el-input
            v-model="search.alias"
            placeholder="别名"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t("table.search") }}
        </el-button>
        <el-button v-if="hasPermissionNode('RoleAdd')" type="primary" icon="el-icon-plus" @click="onAddOrUpdate()">
          {{ $t("table.add") }}
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
      <el-table-column prop="name" label="名称" align="center" />
      <el-table-column prop="alias" label="别名" align="center" />
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="{ row }">
          <el-button v-if="hasPermissionNode('RoleEdit')" type="primary" @click="onAddOrUpdate(row)">编辑</el-button>
          <el-button v-if="row.id !== 1 && hasPermissionNode('RoleDelete')" type="danger" @click="onDelete(row)">删除</el-button>
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
  </div>
</template>

<script>
import { dataList, deleteData } from '@/api/role'
import { mixin } from '@/utils/mixin'
import Pagination from '@/components/Pagination'
import AddOrUpdate from './components/AddOrUpdate'

export default {
  name: 'Roles',
  components: {
    Pagination,
    AddOrUpdate
  },
  mixins: [mixin],
  data() {
    return {
      list: [],
      search: {
        name: '',
        alias: ''
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
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
      this.getList()
    },
    getList(loading = true) {
      if (this.loading) return
      this.loading = loading
      dataList({ ...this.search })
        .then((response) => {
          if (response.code !== 0) return
          this.list = response.data
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
    onDelete({ name, id }) {
      this.$confirm(`确定对[${name}(#${id})]进行[删除]操作?`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
        .then(() => {
          deleteData(id)
            .then(({ msg = '删除成功' }) => {
              this.$message.success(msg)
              this.init()
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
