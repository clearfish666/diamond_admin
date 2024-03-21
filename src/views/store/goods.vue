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
        <el-button
          v-if="hasPermissionNode('StoreGoodsAdd')"
          type="primary"
          icon="el-icon-plus"
          @click="onAddStock()"
        >
          新增入库
        </el-button>

        <el-button
          v-if="hasPermissionNode('StoreGoodsAdd')"
          type="danger"
          icon="el-icon-minus"
          @click="onOffline(1)"
        >
          线下出库
        </el-button>

        <el-button
          v-if="hasPermissionNode('StoreGoodsAdd')"
          type="primary"
          icon="el-icon-plus"
          @click="onOffline(2)"
        >
          线下回库
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
          <el-tag v-if="row.status === 1" :type="statusColors[row.status]">
            {{ row.status | paraphrase(statusOptions) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- <el-table-column prop="price" label="价格" align="center" /> -->
      <!-- <el-table-column prop="stock" label="库存" align="center" /> -->
      <!-- <el-table-column prop="sales_volume" label="销量" align="center" /> -->
      <el-table-column label="操作" align="center" width="280">
        <template slot-scope="{ row }">
          <div class="el-button-group">
            <el-button-group>
              <el-button
                v-if="hasPermissionNode('StoreGoodsEdit')"
                type="primary"
                @click="onAddStock(row)"
                >IMIE修改
              </el-button>
            </el-button-group>

            <el-button-group>
              <el-button
                v-if="hasPermissionNode('StoreGoodsEdit')"
                type="primary"
                @click="onCheck(row)"
                >质检
              </el-button>
              <el-button
                v-if="hasPermissionNode('StoreGoodsDelete')"
                type="primary"
                @click="onImage(row)"
                >图片信息</el-button
              >
            </el-button-group>
          </div>

          <div class="el-button-group">
            <el-button-group>
              <el-button
                v-if="hasPermissionNode('StoreGoodsEdit')"
                type="success"
                @click="onPrice(row)"
                >价格信息
              </el-button>

              <el-button
                v-if="hasPermissionNode('StoreGoodsDelete')"
                type="danger"
                @click="onGoodsDelete(row)"
                >删除</el-button
              >
            </el-button-group>
          </div>
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

    <!-- 新增库存 -->
    <add-stock v-if="addStockVisible" ref="addStock" @refreshList="getList()" />

    <!-- 质检 -->
    <check v-if="checkVisible" ref="check" @refreshList="getList()" />

    <!-- 图片信息 -->
    <image-update v-if="imageVisible" ref="imageRef" @refreshList="getList()" />

    <!-- 价格信息 -->
    <price-update v-if="priceVisible" ref="priceRef" @refreshList="getList()" />

    <!-- 线下库存修改 -->
    <stock-offline
      v-if="offlineVisible"
      ref="offlineRef"
      @refreshList="getList()"
    />
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
import AddStock from "./components/goods/addStock";
import Check from "./components/goods/check";
import ImageUpdate from "./components/goods/image";
import PriceUpdate from "./components/goods/price";
import StockOffline from "./components/goods/stockOffline";

import { getGoodsList, deleteData } from "@/api/store/goods";
import { mixin } from "@/utils/mixin";
import { getToken, DominKey } from "@/utils/auth";

export default {
  name: "StoreGoodsList",
  components: {
    Pagination,
    AddStock,
    Check,
    ImageUpdate,
    PriceUpdate,
    StockOffline,
  },
  mixins: [mixin],
  data() {
    return {
      domin: getToken(DominKey),
      list: [],
      search: {
        name: null,
        imie: null,
      },
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
        0: "info",
        1: "primary",
        // 2: "success",
      },
      loading: false,
      addStockVisible: false,
      checkVisible: false,
      imageVisible: false,
      priceVisible: false,
      offlineVisible: false,
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
      getGoodsList({ page, ...this.search, limit: this.pages.limit })
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
    onGoodsAddOrUpdate(row) {
      const params = {};
      if (row) {
        params.goods_id = row.id;
        params.title = "修改商品";
      } else {
        params.goods_id = 0;
        params.title = "添加商品";
      }

      this.$router.push({
        name: "StoreGoodsEdit",
        params: params,
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

    //出库
    onGoodsSold({ name, id }) {
      this.$confirm(`确定对[${name}(#${id})]进行[线下出库]操作?`, "出库", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      })
        .then(() => {
          stockOut(id)
            .then(({ msg = "出库成功" }) => {
              this.$message.success(msg);
              this.getList();
            })
            .catch(() => {});
        })

        .catch(() => {});
    },

    //新增库存商品
    onAddStock(row) {
      this.addStockVisible = true;
      this.$nextTick(() => {
        this.$refs.addStock && this.$refs.addStock.init(row);
      });
    },

    //质检
    onCheck(row) {
      this.checkVisible = true;
      this.$nextTick(() => {
        this.$refs.check && this.$refs.check.init(row);
      });
    },

    //图片
    onImage(row) {
      this.imageVisible = true;
      this.$nextTick(() => {
        this.$refs.imageRef && this.$refs.imageRef.init(row);
      });
    },

    //价格
    onPrice(row) {
      this.priceVisible = true;
      this.$nextTick(() => {
        this.$refs.priceRef && this.$refs.priceRef.init(row);
      });
    },

    //线下库存修改
    onOffline(type) {
      this.offlineVisible = true;
      this.$nextTick(() => {
        this.$refs.offlineRef && this.$refs.offlineRef.init(type);
      });
    },
  },
};
</script>

<style>
.el-button-group {
  margin: 5px 0;
}
.el-button-group el-button {
  margin: 0 5px;
}
</style>
