<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="商品名称">
          <el-input
            v-model="search.name"
            placeholder="商品名称"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t("table.search") }}
        </el-button>
        <el-button type="primary" icon="el-icon-plus" @click="onAddOrUpdate()">
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
      <el-table-column prop="date" label="盘点日期" align="center" />
      <el-table-column prop="name" label="商品名称" align="center" />
      <el-table-column label="价格信息" width="138" header-align="center">
        <template slot-scope="{ row }">
          <div>成本价：{{ row.base_price }}</div>
          <div>售卖价：{{ row.price }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="sales_volume" label="销量" align="center" />
      <el-table-column prop="created_at" label="创建时间" align="center" />
      <el-table-column label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            title="编辑"
            icon="el-icon-edit"
            @click="onAddOrUpdate(row)"
          />
          <el-button
            type="danger"
            title="删除"
            icon="el-icon-delete"
            @click="onDelete(row)"
          />
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

    <el-dialog
      :title="form.id > 0 ? '销售-编辑' + form.name : '销售-新增'"
      :visible.sync="addOrUpdateVisible"
      width="800px"
      :top="'2vh'"
      class="el-form-dialog"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="销量" prop="sales_volume">
          <el-input v-model="form.sales_volume" autocomplete="off" />
        </el-form-item>
        <el-form-item label="售卖价格" prop="price">
          <el-input v-model="form.price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="成本价格" prop="base_price">
          <el-input v-model="form.base_price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="销售日期" prop="date">
          <!-- <el-input v-model="form.date" autocomplete="off" /> -->
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="销售日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addOrUpdateVisible = false">取 消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="onFormSubmit()"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Pagination from "@/components/Pagination";
import { getOfflineList, addOrUpdate, deleteData } from "@/api/store/offline";
import { mixin } from "@/utils/mixin";
import Tinymce from "@/components/Tinymce";

export default {
  name: "Article",
  components: { Pagination, Tinymce },
  mixins: [mixin],
  data() {
    return {
      list: [],
      search: {
        name: "",
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1,
      },
      visible: false,
      loading: false,
      btnLoading: false,
      addOrUpdateVisible: false,
      form: {
        id: 0,
        name: "",
        price: 0,
        base_price: 0,
        sales_volume: 0,
        date: "",
      },
      rules: {},
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
      getOfflineList({ page, ...this.search, limit: this.pages.limit })
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
    onAddOrUpdate(data) {
      this.visible = true;
      this.addOrUpdateVisible = true;
      this.form = {
        id: 0,
        name: "",
        price: 0,
        base_price: 0,
        sales_volume: 0,
        date: "",
      };
      if (data) {
        this.form = Object.assign({}, data);
      }
    },
    onFormSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.btnLoading = true;
          addOrUpdate(this.form)
            .then(({ msg }) => {
              this.$message.success(msg);
              this.addOrUpdateVisible = false;
              this.btnLoading = false;
              this.getList();
            })
            .catch(() => {
              this.btnLoading = false;
            });
        }
      });
    },
    onDelete({ id }) {
      this.$confirm(`确定对[(#${id})]进行[删除]操作?`, "删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      })
        .then(() => {
          deleteData(id)
            .then(({ msg = "删除成功" }) => {
              this.$message.success(msg);
              this.init();
            })
            .catch(() => {
              this.$message.error("删除失败");
            });
        })
        .catch(() => {});
    },
  },
};
</script>
