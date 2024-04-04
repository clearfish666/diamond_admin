<template>
  <el-dialog
    class="el-dialog-wallet"
    title="库存记录"
    :visible.sync="visible"
    :top="'2vh'"
    :close-on-click-modal="false"
    width="80%"
    @closed="onClose()"
  >
    <el-table
      v-loading="loading"
      border
      highlight-current-row
      :data="list"
      :height="pageheight - 10"
    >
      <el-table-column prop="id" label="ID" align="center" />

      <el-table-column prop="name" label="名称" align="center" />

      <el-table-column prop="imie" label="IMIE" align="center" />
      <el-table-column label="库存操作" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="statusColors[row.action]">
            {{ row.action | paraphrase(statusOptions) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center">
        <template slot-scope="scope" v-if="scope.row.admin">
          {{ scope.row.admin.name }}
        </template>
        <span v-else> - </span>
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
import { getGoodsStockLog, deleteData } from "@/api/store/goods";
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
      },
      list: [],
      pages: {
        total: 0,
        limit: 20,
        current: 1,
      },
      statusOptions: [
        { label: "新增入仓", value: 0 },
        { label: "线上销售锁仓", value: 1 },
        { label: "线上销售出仓", value: 2 },
        { label: "线下销售出仓", value: 3 },
        { label: "线上销售退回", value: 4 },
        { label: "线下销售退回", value: 5 },
        { label: "线上销售超时退回", value: 7 },
      ],
      statusColors: {
        1: "success",
        2: "warning",
        3: "danger",
        4: "success",
        5: "success",
        7: "success",
      },
      loading: false,
    };
  },
  methods: {
    init(data) {
      this.visible = true;

      this.search.id = data.id;
      this.getList();
    },
    getList(page = this.pages.current, loading = true) {
      if (this.loading) return;
      this.loading = loading;
      if (page === 1) this.pages.current = page;
      getGoodsStockLog({ page, ...this.search, limit: this.pages.limit })
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
