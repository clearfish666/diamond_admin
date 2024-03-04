<template>
  <div class="app-container">
    <el-table v-loading="loading" border :data="equity" :height="pageheight">
      <el-table-column prop="ration" label="配售数量" width="200" align="center" />
      <el-table-column prop="release" label="每日释放" width="200" align="center" />
      <el-table-column label="分享权益" align="center">
        <el-table-column
          v-for="(item, index) in levels"
          :key="index"
          :prop="item.name"
          :label="item.name"
          align="center"
        >
          <el-table-column :label="'升级条件：' + (item.sort == 1 ? '直接分享':'团队分享') + item.requirement.start + (item.requirement.end > 0 ? '-' + item.requirement.end : '以上') + 'VIP'" align="center">
            <el-table-column label="直接分享奖励" align="center">
              <template slot-scope="{ row }">
                {{ row.level_equity.share[item.sort].num }}
              </template>
            </el-table-column>
            <el-table-column label="团队分享奖励" align="center">
              <template slot-scope="{ row }">
                {{ row.level_equity.team[item.sort].num }}
              </template>
            </el-table-column>
          </el-table-column>
        </el-table-column>
      </el-table-column></el-table>
  </div>
</template>

<script>
import { getEquityList } from '@/api/vip'
import { mixin } from '@/utils/mixin'

export default {
  name: 'VipEquityList',
  mixins: [mixin],
  data() {
    return {
      levels: [],
      equity: [],
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
    getList(loading = true) {
      if (this.loading) return
      this.loading = loading
      getEquityList()
        .then((response) => {
          if (response.code !== 0) return
          this.levels = response.data.levels
          this.equity = response.data.equity
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    onAddOrUpdate(data) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate && this.$refs.addOrUpdate.init(data)
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
