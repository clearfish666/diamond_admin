<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-button type="primary" icon="el-icon-plus" @click="onAddOrUpdate()">
          开始盘点
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
      <el-table-column prop="total_count" label="盘点总数" align="center" />
      <el-table-column prop="lost_count" label="异常商品数量" align="center">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.lost_count > 0"
            type="danger"
            @click="onFailStockGoods(scope.row)"
            >{{ scope.row.lost_count }}</el-button
          >
          <span v-else>{{ scope.row.lost_count }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="盘点状态"
        width="138"
        header-align="center"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag slot="reference" :type="statusColors[row.status]">
            {{ row.status | paraphrase(statusOptions) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="管理人" align="center">
        <template slot-scope="scope" v-if="scope.row.admin">
          {{ scope.row.admin.name }}
        </template>
        <span v-else> - </span>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" align="center" />
      <!-- <el-table-column label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            title="详情"
            icon="el-icon-edit"
            @click="onAddOrUpdate(row)"
          />

        </template>
      </el-table-column> -->
    </el-table>
    <pagination
      v-show="pages.total > 0"
      :total="pages.total"
      :page.sync="pages.current"
      :limit.sync="pages.limit"
      @pagination="getList()"
    />

    <el-dialog
      title="盘点"
      :visible.sync="addOrUpdateVisible"
      width="80%"
      height="80%"
      :top="'2vh'"
      class="el-form-dialog"
      :close-on-click-modal="false"
      @closed="onClose()"
    >
      <el-form ref="form" :model="form" :rules="rules">
        <el-row :gutter="24">
          <el-col :span="8" v-for="(item, index) in cout_list" :key="index">
            <div class="head-box">
              <p class="head-box-up">{{ item.title }}</p>
              <span
                v-if="item.title === '待盘点商品数量'"
                class="head-box-down"
                style="color: red"
              >
                {{ item.num }}</span
              >
              <span v-else class="head-box-down">{{ item.num }}</span>
            </div>
          </el-col>
        </el-row>

        <el-form-item label="商品IMIE码" prop="imie">
          <el-input
            v-model="form.imie"
            autocomplete="off"
            clearable
            @keyup.enter.native="getInfo()"
          />
        </el-form-item>
      </el-form>
      <el-descriptions
        v-if="detailShow"
        class="margin-top"
        title="商品信息"
        :column="3"
        border
      >
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-user"></i>
            名称
          </template>
          {{ detail.name }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-mobile-phone"></i>
            属性
          </template>
          {{ detail.phone_attr }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-tickets"></i>
            IMIE
          </template>
          {{ detail.imie }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-office-building"></i>
            库存状态
          </template>
          {{ detail.stock_status_txt }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-office-building"></i>
            图片:
          </template>
          <el-image
            class="custom-image"
            v-if="detail.image"
            style="width: 100px; height: 100px"
            :src="detail.image"
          >
          </el-image>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onClose">取 消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="onFormSubmit()"
          >盘点完成</el-button
        >
      </div>
    </el-dialog>

    <!-- 盘点异常商品 -->
    <failStockGoods v-if="failStockVisible" ref="failStockGoods" />
  </div>
</template>
<script>
import Pagination from "@/components/Pagination";
import {
  getList,
  getCount,
  goodsCheck,
  addOrUpdate,
  deleteData,
} from "@/api/store/stockCheck";
import { mixin } from "@/utils/mixin";
import Tinymce from "@/components/Tinymce";
import { goodsInfoByImie } from "@/api/store/goods";
import FailStockGoods from "./components/FailStockGoods";

export default {
  name: "StockCheck",
  components: { Pagination, Tinymce, FailStockGoods },
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
      detailShow: false,
      addOrUpdateVisible: false,
      form: {
        id: 0,
        total_count: 0,
        check_count: 0,
        loss_count: 0,
        imie: "",
        arr_goods_id: [],
      },
      cout_list: [
        { title: "总库存数", num: 0 },
        { title: "已盘点数量", num: 0 },
        { title: "待盘点商品数量", num: 0 },
      ],
      detail: {
        id: "",
        name: "",
        phone_attr: "",
        imie: "",
        stock_status_txt: "",
        image: "",
        pics: [],
      },
      arr_check_imie: [], //已经校验的IMIE码
      rules: {},
      failStockVisible: false,
      statusOptions: [
        { label: "正常", value: 0 },
        { label: "异常", value: 1 },
      ],
      statusColors: {
        0: "success",
        1: "danger",
      },
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.getList();
      this.getGoodsCount();
    },
    getList(page = this.pages.current, loading = true) {
      if (this.loading) return;
      this.loading = loading;
      if (page === 1) this.pages.current = page;
      getList({ page, ...this.search, limit: this.pages.limit })
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
    //库存总数
    getGoodsCount() {
      getCount()
        .then((response) => {
          if (response.code !== 0) return;

          this.form.total_count = this.cout_list[0].num = response.data.count;
        })
        .catch((error) => {
          this.$message.error(error.msg);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    //校验库存
    stockCheckGoods() {
      goodsCheck({ imie: this.form.name, target_id: this.form.id })
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

    //查询库存信息
    getInfo() {
      let temp_imie = this.form.imie;

      if (this.arr_check_imie.includes(temp_imie)) {
        this.$message({
          showClose: true,
          message: temp_imie + "已经盘点",
          type: "warning",
        });
        this.form.imie = "";
        return;
      }
      goodsInfoByImie({ imie: temp_imie })
        .then(({ data: goods }) => {
          if (goods) {
            // 保留商品原始信息
            // this.detail = goods;

            // 商品基础信息
            ["detail"].forEach((model) => {
              Object.keys(this[model]).forEach((key) => {
                this[model][key] = goods[key];
              });
            });

            if (this.detail.pics.length > 0) {
              this.detail.image = this.detail.pics[0];
            }

            if (!this.arr_check_imie.includes(temp_imie)) {
              this.arr_check_imie.push(temp_imie);
              this.cout_list[1].num += 1;
              this.cout_list[2].num =
                this.cout_list[0].num - this.cout_list[1].num;

              this.form.imie = "";
              this.form.arr_goods_id.push(goods["id"]);
            }

            this.loading = false;
            this.detailShow = true;
          }
        })
        .catch(
          ({
            message: errMsg,
            response: { data: { message } } = {
              data: { message: errMsg || "获取“商品详情失败”！" },
            },
          }) => {
            console.error(message);
            this.loading = false;
          }
        );
    },

    //新增盘点库存
    onAddOrUpdate(data) {
      this.visible = true;
      this.addOrUpdateVisible = true;
      this.getGoodsCount();
      this.detailShow = false;

      this.form = {
        id: 0,
        total_count: 0,
        check_count: 0,
        loss_count: 0,
        imie: "",
        arr_goods_id: [],
      };
      this.cout_list = [
        { title: "总库存数", num: 0 },
        { title: "已盘点数量", num: 0 },
        { title: "待盘点商品数量", num: 0 },
      ];
      this.arr_check_imie = [];
      this.detail = {
        name: "",
        phone_attr: "",
        imie: "",
        stock_status_txt: "",
        image: "",
        pics: [],
      };

      if (data) {
        this.form = Object.assign({}, data);
      }
    },

    //盘点异常商品
    onFailStockGoods(row) {
      this.failStockVisible = true;
      if (row) {
        this.$nextTick(() => {
          this.$refs.failStockGoods &&
            this.$refs.failStockGoods.init(row.lost_goods_id);
        });
      }
    },
    onFormSubmit() {
      this.$confirm(`确定结束盘点操作?`, "结束", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      })
        .then(() => {
          let data = Object.assign({}, this.form);
          addOrUpdate(data)
            .then(({ msg = "生成报告成功" }) => {
              this.$message.success(msg);
              this.addOrUpdateVisible = false;
              this.btnLoading = false;

              this.getList();
            })
            .catch(() => {
              this.$message.error("生成失败");
            });
        })
        .catch(() => {});
    },

    onClose() {
      this.$confirm(`确定结束盘点操作?`, "结束", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      })
        .then(() => {
          this.getList();
        })

        .catch(() => {
          this.addOrUpdateVisible = true;
        });

      // this.getList();
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

<style>
.head-box {
  width: 90%;
  box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.2);
  border-radius: 14px;
  text-align: center;
  padding: 15px 0;
  .head-box-down {
    font-size: 36px;
    font-weight: 600;
  }
}

.progress-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  /*height: 100vh;  设置高度占据整个视口 */
}

.custom-image .el-image__inner {
  width: auto !important; /* 使用 !important 来覆盖原有样式 */
}
</style>
