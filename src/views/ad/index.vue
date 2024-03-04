<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="广告标识">
          <el-select v-model="search.type" clearable @change="getList(1)">
            <el-option label="全部" value="" />
            <el-option v-for="item in posOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="广告类型">
          <el-select v-model="search.url_type" clearable @change="getList(1)">
            <el-option label="全部" value="" />
            <el-option v-for="item in adTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t("table.search") }}
        </el-button>
        <el-button type="primary" icon="el-icon-plus" @click="onAddOrUpdate()">
          {{ $t("table.add") }}
        </el-button>
      </el-form>
    </div>
    <el-table v-loading="loading" border highlight-current-row :data="list" :height="pageheight">
      <el-table-column prop="id" label="ID" min-width="10%" align="center" />
      <el-table-column label="图片" width="180" align="center">
        <template slot-scope="{ row }">
          <el-image style="
              width: 135px;
              max-height: 270px;
              display: flex;
              align-items: center;
            " :src="image_domin + row.image" :preview-src-list="[image_domin + row.image]" />
        </template>
      </el-table-column>
      <el-table-column prop="url" label="链接" align="center" min-width="10%">
        <template slot-scope="{ row: { url, url_type } }">
          <p>
            <b> {{ url }}</b>
          </p>
          <el-tag :type="adTypeOptions[url_type].value">
            {{ adTypeOptions[url_type].label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="pos" label="广告标识" min-width="10%" align="center">
        <template slot-scope="{ row }">
          <div>
            {{ posOptions[row.type].name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" min-width="10%" align="center" />
      <el-table-column prop="created_at" label="创建时间" width="160" align="center" />
      <el-table-column label="操作" min-width="20%" align="center">
        <template slot-scope="{ row }">
          <el-button type="primary" @click="onAddOrUpdate(row)">修改</el-button>
          <el-button type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="pages.total > 0" :total="pages.total" :page.sync="pages.current" :limit.sync="pages.limit"
      @pagination="getList()" />

    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshList="getList(1)" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import AddOrUpdate from './components/AddOrUpdate'
import { dataList, deleteData } from '@/api/ad'
import { posList } from '@/api/main'
import { getBaseUrl } from '@/utils/auth'
import { mixin } from '@/utils/mixin'

export default {
  name: 'Ads',
  components: { Pagination, AddOrUpdate },
  mixins: [mixin],
  data() {
    return {
      image_domin: getBaseUrl(),
      list: [],
      search: {
        url_type: '',
        type: ''
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      adTypeOptions: [
        { label: '静态展示', value: 0 },
        { label: '外链广告', value: 1 },
        { label: '内联广告', value: 2 }
      ],
      posOptions: [],
      loading: false,
      addOrUpdateVisible: false
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getPosList()
        .then(() => {
          this.getList()
        })
        .catch(() => { })
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
    onDelete({ id }) {
      this.$confirm(`确定对[(#${id})]进行[删除]操作?`, '删除', {
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
        .catch(() => { })
    },
    async getPosList() {
      await posList().then((response) => {
        this.posOptions = response.data
      })
    }
  }
}
</script>
