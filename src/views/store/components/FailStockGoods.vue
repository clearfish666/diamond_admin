<template>
  <el-dialog
    class="el-dialog-wallet"
    title="盘点异常商品"
    :visible.sync="visible"
    :top="'2vh'"
    :close-on-click-modal="false"
    width="80%"
    @closed="onClose()"
  >
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

        <!-- <el-form-item label="机型:" prop="cate_id">
          <el-cascader
            ref="category"
            v-model="search.cate_id"
            :props="category"
            clearable
            @change="getList(1)"
          />
        </el-form-item> -->

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
      :height="pageheight - 10"
    >
      <el-table-column prop="id" label="ID" align="center" />

      <el-table-column label="封面" width="120" align="center">
        <template slot-scope="{ row }">
          <el-image
            style="width: 100px; height: 100px"
            :src="row.pics.length > 0 ? row.pics[0] : ''"
            :preview-src-list="row.pics"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" align="center" />
      <!-- <el-table-column prop="name" label="分类" align="center" /> -->

      <el-table-column prop="phone_str" label="属性" align="center" />

      <el-table-column prop="imie" label="IMIE" align="center" />
      <el-table-column label="价格信息" width="138" header-align="center">
        <template slot-scope="{ row }">
          <div>成本价：{{ row.base_price }}</div>
          <div>售卖价：{{ row.price }}</div>
          <div>整备费用：{{ row.fix_price }}</div>
          <!-- <div>抵扣单价：{{ row.deduction_unit_price }}</div> -->
        </template>
      </el-table-column>
      <el-table-column label="上架状态" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="statusColors[row.status]">
            {{ row.status | paraphrase(statusOptions) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="库存状态" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="stockStatusColors[row.stock_status]">
            {{ row.stock_status | paraphrase(stockStatusOptions) }}
          </el-tag>
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
  </el-dialog>
</template>

<script>
import Pagination from "@/components/Pagination";
import { getRefundLogList } from "@/api/store/order";
import { mixin } from "@/utils/mixin";
import { getGoodsList, deleteData } from "@/api/store/goods";
import { getCategory } from "@/api/main";

export default {
  name: "FailStockGoods",
  components: { Pagination },
  mixins: [mixin],
  data() {
    return {
      // category: {
      //   lazy: true,
      //   lazyLoad(node, resolve) {
      //     getCategory({ pid: node.value })
      //       .then((response) => {
      //         const category = response.data.map((item) => ({
      //           value: item.value,
      //           label: item.label,
      //           leaf: item.pid > 0,
      //         }));
      //         resolve(category);
      //       })
      //       .catch(() => {});
      //   },
      // },
      visible: false,
      data: {},
      search: {
        id: 0,
        arr_goods_id: "",
      },
      list: [],
      pages: {
        total: 0,
        limit: 20,
        current: 1,
      },
      statusOptions: [
        { label: "下架", value: 0 },
        { label: "上架", value: 1 },
      ],
      statusColors: {
        0: "danger",
        1: "primary",
        // 2: "success",
      },
      stockStatusOptions: [
        { label: "在库", value: 0 },
        { label: "已出仓", value: 1 },
      ],
      stockStatusColors: {
        0: "success",
        1: "danger",
        // 2: "success",
      },
      loading: false,
    };
  },
  methods: {
    init(data) {
      this.visible = true;

      this.search.arr_goods_id = data;
      this.getList();
    },
    getList(page = this.pages.current, loading = true) {
      if (this.loading) return;
      this.loading = loading;
      if (page === 1) this.pages.current = page;
      getGoodsList({ page, ...this.search, limit: this.pages.limit })
        .then((response) => {
          if (response.code !== 0) return;
          this.list = response.data.data;
          console.log(this.list);
          this.pages.total = response.data.total;
        })
        .catch((error) => {
          this.$message.error(error.msg);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onClose() {
      this.$reset("data", false);
      this.visible = false;
    },
  },
};
</script>
