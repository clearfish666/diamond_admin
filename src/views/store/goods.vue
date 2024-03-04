<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="名称">
          <el-input v-model="search.name" placeholder="名称" clearable @clear="getList(1)"
            @keyup.enter.native="getList(1)" />
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t("table.search") }}
        </el-button>
        <el-button v-if="hasPermissionNode('StoreGoodsAdd')" type="primary" icon="el-icon-plus"
          @click="onGoodsAddOrUpdate()">
          {{ $t("table.add") }}
        </el-button>
      </el-form>
    </div>
    <el-table v-loading="loading" border highlight-current-row :data="list" :height="pageheight">
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="name" label="名称" align="center" />
      <el-table-column label="封面" width="120" align="center">
        <template slot-scope="{ row }">
          <el-image style="width: 100px; height: 100px" :src="(row.pics.length > 0 ? row.pics[0] : '')"
            :preview-src-list="row.pics" />
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" align="center" />
      <el-table-column prop="stock" label="库存" align="center" />
      <el-table-column prop="sales_volume" label="销量" align="center" />
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="{ row }">
          <el-button-group>
            <el-button v-if="hasPermissionNode('StoreGoodsEdit')" type="primary" @click="onGoodsAddOrUpdate(row)">编辑
            </el-button>
            <el-button v-if="hasPermissionNode('StoreGoodsDelete') && !row.vip" type="danger"
              @click="onGoodsDelete(row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="pages.total > 0" :total="pages.total" :page.sync="pages.current" :limit.sync="pages.limit"
      @pagination="getList()" />

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getGoodsList, deleteData } from '@/api/store/goods'
import { mixin } from '@/utils/mixin'
import { getToken, DominKey } from '@/utils/auth'

export default {
  name: 'StoreGoodsList',
  components: { Pagination },
  mixins: [mixin],
  data() {
    return {
      domin: getToken(DominKey),
      list: [],
      search: {
        name: null
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      loading: false
    }
  },
  watch: {
    $route(to, from) {
      // 监听路由是否变化
      if (to.params !== from.params) {
        this.init() // 重新加载数据
      }
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
      getGoodsList({ page, ...this.search, limit: this.pages.limit })
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
    onGoodsAddOrUpdate(row) {
      const params = {}
      if (row) {
        params.goods_id = row.id
        params.title = '修改商品'
      } else {
        params.goods_id = 0
        params.title = '添加商品'
      }

      this.$router.push({
        name: 'StoreGoodsEdit',
        params: params
      })
    },
    onGoodsDelete({ name, id }) {
      this.$confirm(`确定对[${name}(#${id})]进行[删除]操作?`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
        .then(() => {
          deleteData(id)
            .then(({ msg = '删除成功' }) => {
              this.$message.success(msg)
              this.getList()
            })
            .catch(() => { })
        })

        .catch(() => { })
    }
  }
}
</script>
