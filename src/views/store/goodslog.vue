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
        <el-form-item label="IMIE">
          <el-input
            v-model="search.imie"
            placeholder="IMIE"
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
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="name" label="名称" align="center" />
      <el-table-column prop="imie" label="IMIE" align="center" />
      <el-table-column label="帐号" width="200" header-align="center">
        <template slot-scope="{ row }">
          <user-info :user="row.user" />
        </template>
      </el-table-column>
      <el-table-column prop="num" label="浏览次数" align="center" />
      <el-table-column label="时间"  align="center">
        <template slot-scope="{ row }">
          <div>初次浏览： {{ row.created_at }}</div>
          <div>最近浏览： {{ row.updated_at }}</div>
        </template>
        </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="{ row }">
          <el-button-group>
            <el-button
              v-if="hasPermissionNode('StoreGoodsUserLogDelete')"
              type="danger"
              @click="onGoodsDelete(row)"
              >删除</el-button
            >
          </el-button-group>
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
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
import { getGoodsUserLog, deleteData } from "@/api/store/goodsuserlog";
import { mixin } from "@/utils/mixin";
import { getToken, DominKey } from "@/utils/auth";
import UserInfo from "@/components/User/info";

export default {
  name: "getGoodsUserLog",
  components: { Pagination,UserInfo, },
  mixins: [mixin],
  data() {
    return {
      domin: getToken(DominKey),
      list: [],
      search: {
        name: null,
        user: null,
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1,
      },
      loading: false,
    };
  },
  watch: {
    $route(to, from) {
      // 监听路由是否变化
      if (to.params !== from.params) {
        this.init(); // 重新加载数据
      }
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.getList();
    },
    getList(page = this.pages.current, loading = true) {
      if (this.loading) return;
      this.loading = loading;
      if (page === 1) this.pages.current = page;
      getGoodsUserLog({ page, ...this.search, limit: this.pages.limit })
        .then((response) => {
          if (response.code !== 0) return;
          this.list = response.data.data;
          this.pages.total = response.data.total;
        })
        .catch((error) => {
          this.$message.error(error.msg);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onGoodsDelete({ name, id }) {
      this.$confirm(`确定对[${name}(#${id})]进行[删除]操作?`, "删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      })
        .then(() => {
          deleteData(id)
            .then(({ msg = "删除成功" }) => {
              this.$message.success(msg);
              this.getList();
            })
            .catch(() => {});
        })

        .catch(() => {});
    },
  },
};
</script>
