<template>
  <div class="app-container">
    <div id="search-box" class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="UID">
          <el-input
            v-model="search.uid"
            placeholder="UID"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input
            v-model="search.name"
            placeholder="昵称"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
        </el-form-item>
        <el-form-item label="手机">
          <el-input
            v-model="search.phone"
            placeholder="手机"
            clearable
            @clear="getList(1)"
            @keyup.enter.native="getList(1)"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="search.state" clearable @change="getList(1)">
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t("table.search") }}
        </el-button>
      </el-form>
    </div>
    <el-table v-loading="loading" border :data="list" :height="pageheight">
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column label="帐号" width="200" header-align="center">
        <template slot-scope="{ row }">
          <user-info :user="row" />
        </template>
      </el-table-column>
      <el-table-column label="等级" width="100" align="center">
        <template slot-scope="{ row:{level,level_log} }">
          <span v-if="level && (level_log.level == 1 || (level_log.level > 1 && level_log.status == 1))">
            {{ level.name }} <el-tag v-if="level_log.status == 0" type="danger">未激活</el-tag>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="邀请码" align="center" />
      <el-table-column prop="state" label="状态" align="center">
        <template slot-scope="{ row }">
          <el-tag
            :type="row.state ? 'danger' : 'success'"
          >{{ row.state | paraphrase(stateOptions) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="created_at"
        label="创建时间"
        width="200"
        align="center"
      />
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button v-if="hasPermissionNode('VipActivation') && row.level_log && row.level_log.status == 0" type="success" @click="onActivation(row.level_log)">激活</el-button>
          <el-button v-if="(hasPermissionNode('VipActivation') && row.level_log && row.level_log.status == 1)" type="success" @click="onVipLevelChange(row.level_log)">编辑</el-button>
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

    <vip-level-change v-if="vipLevelChangeVisible" ref="vipLevelChange" @refreshList="getList(1)" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getVipList, activation } from '@/api/vip'
import { mixin } from '@/utils/mixin'
import UserInfo from '@/components/User/info'
import VipLevelChange from './components/VipLevelChange'

export default {
  name: 'VipList',
  components: {
    Pagination,
    UserInfo,
    VipLevelChange
  },
  mixins: [mixin],
  data() {
    return {
      list: [],
      search: {
        uid: null,
        name: null,
        phone: null,
        state: null
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      stateOptions: [
        { label: '全部', value: null },
        { label: '正常', value: 0 },
        { label: '禁用', value: 1 }
      ],
      loading: false,
      vipLevelChangeVisible: false
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
      getVipList({ page, ...this.search, limit: this.pages.limit })
        .then((response) => {
          if (response.code !== 0) return
          this.list = response.data.data
          this.pages.total = response.data.total
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    onActivation(row) {
      const { id } = row
      this.$confirm(`确认激活会员？`, `确定`)
        .then(() => {
          activation(id)
            .then(({ msg = `成功！` }) => {
              this.$message.success(msg)
              this.getList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    },
    onVipLevelChange(data) {
      this.vipLevelChangeVisible = true
      this.$nextTick(() => {
        this.$refs.vipLevelChange && this.$refs.vipLevelChange.init(data)
      })
    },
    onDelete({ name, id }) {
      this.$confirm(`确定对[${name}(#${id})]进行[删除]操作?`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
        .then(() => {
          this.$message.success('删除成功')
        })
        .catch(() => {})
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
