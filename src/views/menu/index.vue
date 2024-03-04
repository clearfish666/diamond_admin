<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="权限名称">
          <el-input
            v-model="search.name"
            placeholder="权限名称"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
        </el-form-item>
        <el-form-item label="权限别名">
          <el-input
            v-model="search.alias"
            placeholder="权限别名"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t("table.search") }}
        </el-button>
        <el-button v-if="hasPermissionNode('MenuAdd')" type="primary" icon="el-icon-plus" @click="onAddOrUpdate()">
          {{ $t("table.add") }}
        </el-button>
      </el-form>
    </div>

    <el-table
      v-loading="loading"
      border
      highlight-current-row
      row-key="id"
      :tree-props="{ children: 'children' }"
      :data="list"
      :height="pageheight + 150"
    >
      <el-table-column prop="id" label="ID" width="180" align="center" />
      <el-table-column prop="name" label="权限名称" align="center" />
      <el-table-column
        prop="alias"
        label="权限别名"
        width="200"
        align="center"
      />
      <el-table-column prop="show" label="是否显示" align="center">
        <template slot-scope="{ row }">
          {{ row.show ? "是" : "否" }}
        </template>
      </el-table-column>
      <el-table-column prop="order" label="排序" width="80" align="center" />
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="{ row }">
          <el-button
            v-if="hasPermissionNode('MenuEdit')"
            type="primary"
            @click="onAddOrUpdate(rawList, row)"
          >编辑</el-button>
          <el-button v-if="hasPermissionNode('MenuDelete')" type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update
      v-if="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshList="getList()"
    />
  </div>
</template>

<script>
import { dataList, deleteData } from '@/api/menu'
import AddOrUpdate from './components/AddOrUpdate'
import { listTree } from '@/utils/index'
import { mixin } from '@/utils/mixin'

export default {
  name: 'Menus',
  components: { AddOrUpdate },
  mixins: [mixin],
  data() {
    return {
      rawList: [],
      list: [],
      search: {
        name: '',
        alias: ''
      },
      typeOptions: [
        { label: '菜单', value: 0 },
        { label: '目录', value: 1 },
        { label: '按钮', value: 2 }
      ],
      typeTagOptions: ['', 'success', 'warning'],
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
          this.rawList = response.data
          this.list = listTree(response.data, 'id')
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    onAddOrUpdate(list, data) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate && this.$refs.addOrUpdate.init(list, data)
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
            .catch(() => {})
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
  &[x-placement^="top"] .popper__arrow::after {
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
.role-box {
  width: 100px;
  max-height: 100px;
  position: relative;
}
.role-box img {
  width: 100%;
}
.role-box span {
  position: absolute;
  width: 58px;
  left: 32px;
  top: 7px;
  text-align: center;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
