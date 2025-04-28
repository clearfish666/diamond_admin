<template>
    <div class="app-container">
        <div id="search-box" class="filter-container">
            <el-form :inline="true" :model="search">
                <el-form-item label="标题">
                    <el-input
                        v-model="search.title"
                        placeholder="标题"
                        clearable
                        @clear="getList(1)"
                        @keyup.enter.native="getList(1)"
                    />
                </el-form-item>
                <el-button icon="el-icon-search" @click="getList(1)">
                    {{ $t('table.search') }}
                </el-button>
                <el-button
                    type="primary"
                    icon="el-icon-plus"
                    @click="onAddOrUpdate()"
                >
                    {{ $t('table.add') }}
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
            <el-table-column prop="title" label="标题" align="center" />
            <el-table-column label="图片" width="180" align="center">
                <template slot-scope="{ row }">
                    <el-image
                        style="
                            width: 135px;
                            max-height: 270px;
                            display: flex;
                            align-items: center;
                        "
                        :src="row.image"
                        :preview-src-list="[row.image]"
                    />
                </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" align="center" />

            <el-table-column prop="sort" label="排序" align="center" />
            <el-table-column prop="status" label="状态" align="center">
                <template slot-scope="{ row }">
                    <el-tag :type="row.status == 1 ? 'success' : 'danger'">{{
                        row.status == 1 ? '显示' : '隐藏'
                    }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                prop="created_at"
                label="创建时间"
                align="center"
            />
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
            :title="form.id > 0 ? '文章-编辑' + form.title : '文章-新增'"
            :visible.sync="addOrUpdateVisible"
            width="1000px"
            :top="'2vh'"
            class="el-form-dialog"
            :close-on-click-modal="false"
            @closed="onClose()"
        >
            <el-form ref="form" :model="form" :rules="rules">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" autocomplete="off" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input
                        v-model="form.description"
                        placeholder="请输入描述"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="海报" prop="image">
                    <local-upload
                        class-name="avatar-uploader"
                        type="ads"
                        @handleBeforeUpload="beforeAvatarUpload"
                        @handleSuccess="handleAvatarSuccess"
                    >
                        <img
                            v-if="form.image"
                            :src="showImage"
                            class="avatar"
                        />
                        <i v-else class="el-icon-plus avatar-uploader-icon" />
                    </local-upload>
                    <!-- <p>建议尺寸{{ imageInfo }}，点击图片可替换</p> -->
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <tinymce
                        v-if="visible"
                        ref="tinymce"
                        v-model="form.content"
                        :height="260"
                    />
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input v-model="form.sort" autocomplete="off" />
                </el-form-item>
                <el-form-item label="显示状态" prop="status">
                    <el-radio-group v-model="form.status">
                        <el-radio :label="0">隐藏</el-radio>
                        <el-radio :label="1">显示</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addOrUpdateVisible = false">取 消</el-button>
                <el-button
                    type="primary"
                    :loading="btnLoading"
                    @click="onFormSubmit()"
                    >确 定</el-button
                >
            </div>
        </el-dialog>
    </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import { dataList, addOrUpdate, deleteData } from '@/api/information'
import { mixin } from '@/utils/mixin'
import LocalUpload from '@/components/Upload/LocalUpload'

import Tinymce from '@/components/Tinymce'

export default {
    name: 'Information',
    components: { Pagination, Tinymce, LocalUpload },
    mixins: [mixin],
    data() {
        return {
            list: [],
            search: {
                title: ''
            },
            pages: {
                total: 0,
                limit: 20,
                current: 1
            },
            visible: false,
            loading: false,
            btnLoading: false,
            addOrUpdateVisible: false,
            form: {
                id: 0,
                title: '',
                image: '',
                description: '',
                content: '',
                sort: 0,
                status: 1
            },
            showImage: '',
            rules: {}
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
            dataList({ page, ...this.search, limit: this.pages.limit })
                .then((response) => {
                    if (response.code !== 0) return
                    this.list = response.data.data
                    this.pages.total = response.data.total
                })
                .catch((error) => {
                    this.$message.error(error.msg)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        onAddOrUpdate(data) {
            this.visible = true
            this.addOrUpdateVisible = true
            this.form = {
                id: 0,
                title: '',
                image: '',
                description: '',
                content: '',
                sort: 0,
                status: 1
            }
            // this.$refs.tinymce.setContent("");

            if (data) {
                this.form = Object.assign({}, data)
                this.showImage = this.domin + this.form.image
            }
            this.$refs.tinymce.setContent(this.form.content)
        },
        clearForm() {
            this.showImage = ''
            this.form = {
                id: 0,
                title: '',
                image: '',
                description: '',
                content: '',
                sort: 0,
                status: 1
            }
        },
        onClose() {
            this.btnLoading = false
            this.clearForm()
            this.$refs['form'].resetFields()
        },
        onFormSubmit() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.btnLoading = true
                    const s = this.form.image.indexOf(process.env.VUE_APP_IMAGE)
                    if (s > -1) {
                        this.showImage = this.domin + this.form.image
                        // this.form.image = this.form.image.slice(process.env.VUE_APP_IMAGE.length, this.form.image.length)
                    }
                    addOrUpdate(this.form)
                        .then(({ msg }) => {
                            this.$message.success(msg)
                            this.addOrUpdateVisible = false
                            this.btnLoading = false
                            this.getList()
                        })
                        .catch(() => {
                            this.btnLoading = false
                        })
                }
            })
        },
        beforeAvatarUpload(file, cb) {
            const type = ['image/jpeg', 'image/jpg', 'image/png']
            const isLt2M = file.size / 1024 / 1024 < 2

            if (!type.includes(file.type)) {
                this.$message.error(
                    '上传图片只能是 ' + type.join(',') + ' 格式!'
                )
                cb(false)
            }
            if (!isLt2M) {
                this.$message.error('上传图片大小不能超过 2M')
                cb(false)
            }
            cb(true)
        },
        handleAvatarSuccess(response, file) {
            this.form.image = response.data.filename
            this.showImage = this.domin + response.data.filename
        },
        handleAvatarError(error) {
            if (JSON.parse(error.message).error.indexOf('token') !== -1) {
                this.$message.error('上传功能已失效，请重新登录')
            }
        },
        onDelete({ id }) {
            this.$confirm(`确定对[(#${id})]进行[删除]操作?`, '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            })
                .then(() => {
                    deleteData(id)
                        .then(({ msg = '删除成功' }) => {
                            this.$message.success(msg)
                            this.init()
                        })
                        .catch(() => {
                            this.$message.error('删除失败')
                        })
                })
                .catch(() => {})
        }
    }
}
</script>
<style lang="scss" scoped>
.img-cover {
    width: 200px;
    height: auto;
}

.avatar-uploader >>> .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.avatar {
    width: 178px;
    max-height: 178px;
    display: block;
}
</style>
