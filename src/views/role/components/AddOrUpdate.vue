<template>
  <el-dialog
    v-loading="loading"
    :top="'2vh'"
    class="el-form-dialog"
    :title="form.id ? $t('table.edit') : $t('table.add')"
    :visible.sync="visible"
    :close-on-click-modal="false"
    @closed="onClose()"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="角色名称" clearable />
      </el-form-item>
      <el-form-item label="别名" prop="alias">
        <el-input
          v-model="form.alias"
          placeholder="角色别名,请输入字母"
          clearable
        />
      </el-form-item>
      <el-form-item label="权限" prop="permissions">
        <el-tree
          v-if="form.id > 0"
          ref="menu-tree"
          v-loading="treeLoading"
          node-key="id"
          show-checkbox
          :data="menuList"
          :default-expand-all="false"
          :default-expanded-keys="form.permissions"
          :check-on-click-node="true"
          :expand-on-click-node="false"
          :props="{ label: 'name', children: 'children' }"
          :style="'height: ' + (pageheight - 200) + 'px; overflow-x: auto'"
        />
        <span v-else>
          请在新增角色成功后，通过「编辑」操作为新增角色添加「角色权限」
        </span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="btnLoading" @click="onFormSubmit()">
          {{ $t("table.confirm") }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { addOrUpdate, getMenuList } from '@/api/role'
import { listTree } from '@/utils/index'
import { mixin } from '@/utils/mixin'

export default {
  name: 'AddOrEdit',
  mixins: [mixin],
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('名称只能是中英文及数字'))
      } else {
        callback()
      }
    }
    return {
      loading: true,
      visible: false,
      btnLoading: false,
      treeLoading: false,
      form: {
        id: 0,
        name: '',
        alias: '',
        permissions: []
      },
      menuList: [],
      rules: {
        name: [
          {
            required: true,
            message: '名称不能为空',
            trigger: ['blur', 'change']
          },
          { validator: validateUsername, trigger: ['blur', 'change'] }
        ],
        alias: [
          {
            required: true,
            message: '别名不能为空',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init(data) {
      this.visible = true
      if (data) {
        this.getMenusHandle()
        this.form = Object.assign({}, data)
        this.form.permissions = data.permissions
          ? data.permissions.map(({ id }) => id).concat()
          : []
      }
      this.loading = false
    },
    getMenusHandle() {
      if (this.treeLoading) return
      this.treeLoading = true
      getMenuList()
        .then(({ data }) => {
          this.formatMenuData(data)
          this.treeLoading = false
        })
        .catch(() => {
          this.treeLoading = false
        })
    },
    formatMenuData(menus) {
      this.menuList = listTree(menus)
      if (this.form.permissions && this.form.permissions.length > 0) {
        this.setCheckedKeys(
          this.filterFullCheckedKeys(this.menuList, this.form.permissions)
        )
      }
    },
    setCheckedKeys(keys = []) {
      this.$refs['menu-tree'].setCheckedKeys(keys)
    },
    getAllCheckedKeys() {
      const tree = this.$refs['menu-tree']

      return [...tree.getCheckedKeys(), ...tree.getHalfCheckedKeys()]
    },
    filterFullCheckedKeys(list, checked = [], full = []) {
      if (!checked.length > 0) return full

      list.forEach((item) => {
        const { id, children } = item
        if (!checked.includes(id)) return
        const len = Array.isArray(children) ? children.length : 0

        len
          ? this.filterFullCheckedKeys(children, checked, full)
          : full.push(id)
      })

      return full
    },
    onFormSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.btnLoading = true

          this.form.id && (this.form.permissions = this.getAllCheckedKeys())

          addOrUpdate(this.form)
            .then(({ msg }) => {
              this.$message.success(msg)
              this.visible = false
              this.$emit('refreshList')
            })
            .catch(() => {
              this.btnLoading = false
            })
        }
      })
    },
    clearForm() {
      this.form = {
        id: 0,
        name: '',
        alias: '',
        permissions: []
      }
    },
    onClose() {
      this.btnLoading = false
      this.clearForm()
      this.$refs['form'].resetFields()
    }
  }
}
</script>

<style scoped>
</style>
