<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="UID">
          <el-input v-model="search.uid" placeholder="UID" clearable @clear="getList(1)"
            @keyup.enter.native="getList(1)" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="search.name" placeholder="昵称" clearable @clear="getList(1)"
            @keyup.enter.native="getList(1)" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="search.phone" placeholder="手机" clearable @clear="getList(1)"
            @keyup.enter.native="getList(1)" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="search.pay_type" clearable @change="getList(1)">
            <el-option v-for="item in payTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="search.status" clearable @change="getList(1)">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t("table.search") }}
        </el-button>
      </el-form>
    </div>
    <el-table v-loading="loading" border :data="list" :height="pageheight">
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="order_no" label="订单号" align="center" />
      <el-table-column label="帐号" width="200" header-align="center">
        <template slot-scope="{ row }">
          <user-info :user="row.user" />
        </template>
      </el-table-column>
      <el-table-column prop="pay_price" label="支付金额" align="center" />
      <el-table-column prop="pay_type" label="支付方式" align="center">
        <template slot-scope="{ row }">
          {{ row.pay_type | paraphrase(payTypeOptions) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status != 2 ? 'danger' : 'success'">{{ row.status | paraphrase(statusOptions) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="200" align="center" />
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="{ row }">
          <el-button-group v-if="row.status == 1">
            <el-button v-if="hasPermissionNode('VipAgree')" type="primary" @click="onAgree(row)">通过
            </el-button>
            <el-button v-if="hasPermissionNode('VipReject')" type="danger" @click="onReject(row)">驳回</el-button>
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
import { getOrderList, agree, reject } from '@/api/vip'
import { getToken, DominKey } from '@/utils/auth'
import { mixin } from '@/utils/mixin'
import UserInfo from '@/components/User/info'

export default {
  name: 'VipOrderList',
  components: {
    Pagination,
    UserInfo
  },
  mixins: [mixin],
  data() {
    return {
      domin: getToken(DominKey),
      list: [],
      search: {
        uid: null,
        name: null,
        phone: null,
        pay_type: null,
        status: null
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      statusOptions: [
        { label: '全部', value: null },
        { label: '已关闭', value: -1 },
        { label: '待支付', value: 0 },
        { label: '待审核', value: 1 },
        { label: '已支付', value: 2 }
      ],
      payTypeOptions: [
        { label: '全部', value: null },
        { label: '微信支付', value: 'wechat' },
        { label: '支付宝支付', value: 'alipay' },
        { label: '线下支付', value: 'offline' },
        { label: '后台增加', value: 'system' }
      ],
      loading: false
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
      getOrderList({ page, ...this.search, limit: this.pages.limit })
        .then((response) => {
          if (response.code !== 0) return
          this.list = response.data.data
          this.pages.total = response.data.total
        })
        .catch(() => { })
        .finally(() => {
          this.loading = false
        })
    },
    onAgree(row) {
      const { id } = row
      this.$confirm(`确认订单已支付？`, `通过`)
        .then(() => {
          agree(id)
            .then(({ msg = `通过成功！` }) => {
              this.$message.success(msg)
              this.getList()
            })
            .catch(() => { })
        })
        .catch(() => { })
    },
    onReject(row) {
      const { id } = row
      this.$confirm(`驳回订单已支付？`, `驳回`, {
        type: 'warning'
      })
        .then(() => {
          reject(id)
            .then(({ msg = `驳回成功！` }) => {
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

::v-deep .el-divider--horizontal {
  margin: 10px 0;
}

::v-deep .el-divider__text {
  padding: 0;
  color: #909399;
}
</style>
