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
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t("table.search") }}
        </el-button>
        <el-button
          v-if="hasPermissionNode('StoreGoodsCategoryAdd')"
          type="primary"
          icon="el-icon-plus"
          @click="onAddOrUpdate()"
        >
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
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="name" label="名称" align="center" />
      <el-table-column prop="parent" label="上级名称" align="center" />

      <!-- <el-table-column label="封面" width="120" align="center">
        <template slot-scope="{ row }">
          <el-image style="width: 100px; height: 100px" :src="image_domin + row.pic"
            :preview-src-list="[image_domin + row.pic]" />
        </template>
      </el-table-column> -->
      <el-table-column prop="sort" label="排序" align="center" />
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="{ row }">
          <el-button-group style="margin: 15px 0px">
            <el-button
              v-if="hasPermissionNode('StoreGoodsCategoryEdit')"
              type="success"
              @click="onAttrAddOrUpdate(row)"
              >属性
            </el-button>
          </el-button-group>

          <el-button-group>
            <el-button
              v-if="hasPermissionNode('StoreGoodsCategoryEdit')"
              type="primary"
              @click="onAddOrUpdate(row)"
              >编辑
            </el-button>
            <el-button
              v-if="hasPermissionNode('StoreGoodsCategoryDelete') && !row.vip"
              type="danger"
              @click="onDelete(row)"
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

    <category v-if="categoryVisible" ref="category" @refreshList="getList(1)" />
    <categoryAttr
      v-if="categoryAttrVisible"
      ref="categoryAttr"
      @refreshList="getList(1)"
    />
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
import { getCategoryList, deleteData } from "@/api/store/category";
import { mixin } from "@/utils/mixin";
import category from "./components/category";
import categoryAttr from "./components/categoryAttr";
import { getBaseUrl } from "@/utils/auth";

export default {
  name: "StoreGoodsCategoryList",
  components: { Pagination, category, categoryAttr },
  mixins: [mixin],
  data() {
    return {
      image_domin: getBaseUrl(),
      list: [],
      search: {
        name: null,
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1,
      },
      loading: false,
      categoryVisible: false,
      categoryAttrVisible: false,
    };
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
      getCategoryList({ page, ...this.search, limit: this.pages.limit })
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
    onAddOrUpdate(row) {
      this.categoryVisible = true;
      this.$nextTick(() => {
        this.$refs.category && this.$refs.category.init(row);
      });
    },
    onAttrAddOrUpdate(row) {
      this.categoryAttrVisible = true;
      this.$nextTick(() => {
        this.$refs.categoryAttr && this.$refs.categoryAttr.init(row);
      });
    },
    onDelete({ name, id }) {
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
