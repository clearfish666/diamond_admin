<template>
  <el-dialog
    :title="data.nickname + ':邀请列表'"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :top="'2vh'"
    @closed="onClose()"
  >
    <el-row>
      <el-col :span="12">
        <el-descriptions
          class="margin-top"
          title="当前用户："
          :column="2"
          border
        >
          <el-descriptions-item>
            <template slot="label"> 昵称 </template>
            {{ data.nickname }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label"> 手机号 </template>
            {{ data.phone }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label"> 等级 </template>
            <span v-if="data.level && (data.level_log.level == 1 || (data.level_log.level > 1 && data.level_log.status == 1))">
              {{ data.level.name }} <el-tag v-if="data.level_log.status == 0" type="danger">未激活</el-tag>
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
      <el-col :span="12">
        <el-descriptions
          class="margin-top"
          title="上级用户："
          :column="2"
          border
        >
          <el-descriptions-item>
            <template slot="label"> 昵称 </template>
            {{ relation_user.nickname ? relation_user.nickname : "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label"> 手机号 </template>
            {{ relation_user.phone ? relation_user.phone : "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label"> 等级 </template>
            <span v-if="relation_user.level && (relation_user.level_log.level == 1 || (relation_user.level_log.level > 1 && relation_user.level_log.status == 1))">
              {{ relation_user.level.name }} <el-tag v-if="relation_user.level_log.status == 0" type="danger">未激活</el-tag>
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
    <el-divider />
    <el-tree
      v-if="visible"
      v-loading="loading"
      lazy
      :load="loadNode"
      :props="defaultProps"
    >
      <span slot-scope="{ node }">
        <el-avatar
          class="tree-node-avatar"
          icon="el-icon-user-solid"
          size="small"
          :src="node.data.avatar ? domin + node.data.avatar : ''"
        />
        #{{ node.data.id }}
        <el-divider direction="vertical" />
        {{ node.data.nickname }}
        <el-divider direction="vertical" />
        {{ node.data.phone }}
        <el-divider direction="vertical" />
        {{ node.data.state === 0 ? "正常" : "禁用" }}
        <el-divider direction="vertical" />
        等级：<span v-if="node.data.level && (node.data.level_log.level == 1 || (node.data.level_log.level > 1 && node.data.level_log.status == 1))">
          {{ node.data.level.name }} <el-tag v-if="node.data.level_log.status == 0" type="danger">未激活</el-tag>
        </span>
        <span v-else>-</span>
      </span>
    </el-tree>
  </el-dialog>
</template>

<script>
import { getSubset } from '@/api/user'
import { DominKey, getToken } from '@/utils/auth'

export default {
  name: 'Subset',
  data() {
    return {
      visible: false,
      domin: getToken(DominKey),
      id: 0,
      data: {
        id: 0,
        nickname: null,
        phone: null,
        level: null,
        level_log: null
      },
      relation_user: {
        id: 0,
        nickname: null,
        phone: null,
        level: null,
        level_log: null
      },
      child: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      loading: true
    }
  },
  methods: {
    init(data) {
      this.visible = true
      if (data) {
        this.data = data
        this.id = data.id
        this.child = []
        if (data.relation_user) {
          this.relation_user = data.relation_user
        }
      }
    },
    async getList() {
      this.loading = true
      let data
      await getSubset(this.id)
        .then((response) => {
          this.loading = false
          data = response
        })
        .catch((error) => {
          this.$message.error(error.msg)
        })
      return data
    },
    onClose() {
      Object.assign(this.$data, this.$options.data())
    },
    loadNode(node, resolve) {
      if (node.level > 0) {
        this.id = node.data.id
      }
      this.getList().then((response) => {
        resolve(response.data)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  width: 90%;
}
::v-deep .el-tree .el-tree-node__content {
  height: 34px;
  .tree-node-avatar {
    vertical-align: middle;
  }
}

::v-deep .user-avatar {
  vertical-align: middle;
}
::v-deep .el-tree {
  overflow-x: auto;
}
.subset-header {
  width: 100%;
  display: flex;
  padding: 0;
  border: 1px solid #dcdfe6;
  border-left: none;
}
.subset-header li {
  list-style: none;
  width: 16.66%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  box-sizing: border-box;
  border-left: 1px solid #dcdfe6;
}
</style>
