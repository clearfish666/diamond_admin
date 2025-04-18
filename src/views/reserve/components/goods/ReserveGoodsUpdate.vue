<template>
    <el-dialog
        v-loading="loading"
        :top="'2vh'"
        :title="form.id ? $t('table.edit') : $t('table.add')"
        :visible.sync="visible"
        :close-on-click-modal="false"
        class="el-form-dialog"
        append-to-body
        @closed="onClose()"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" placeholder="名称" clearable />
            </el-form-item>

            <el-form-item label="排序:" prop="sort">
                <el-input-number
                    v-model="form.sort"
                    :min="0"
                    placeholder="排序"
                />
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button
                type="primary"
                :loading="btnLoading"
                @click="onFormSubmit()"
            >
                {{ $t('table.confirm') }}
            </el-button>
            <el-button @click="visible = false">
                {{ $t('table.cancel') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script>
import { addOrUpdate } from '@/api/store/goods'
import { getBaseUrl } from '@/utils/auth'

export default {
    name: 'ReserveGoodsUpdate',
    components: {},
    data() {
        return {
            loading: true,
            visible: false,
            btnLoading: false,
            domin: getBaseUrl(),
            form: {
                id: 0,
                category_id: 0,
                name: '',
                sort: 0
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: '名称不能为空',
                        trigger: ['blur', 'change']
                    }
                ]
            }
        }
    },
    methods: {
        init(data) {
            this.visible = true
            if (data) {
                this.form = Object.assign({}, data)
            }
            this.loading = false
        },
        onFormSubmit() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.btnLoading = true
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
        onClose() {
            this.btnLoading = false
            this.$reset()
        }
    }
}
</script>

<style scoped>
.pic-uploader >>> .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.pic-uploader .el-upload:hover {
    border-color: #409eff;
}

.pic-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.pic {
    width: 100px;
    height: 100px;
    display: block;
}
</style>
