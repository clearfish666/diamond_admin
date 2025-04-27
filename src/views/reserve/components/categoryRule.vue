<template>
    <el-dialog
        :title="form.id ? $t('table.edit') : $t('table.add')"
        :visible.sync="visible"
        :close-on-click-modal="false"
        :top="'2vh'"
        width="40%"
        class="el-form-dialog"
        @closed="onClose()"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="130px">
            <el-form-item label="基础价:" prop="base_price">
                <el-input-number
                    v-model="form.base_price"
                    :min="0"
                    :step="1"
                    :precision="2"
                    placeholder="基础价"
                />
            </el-form-item>
            <el-form-item label="高峰期附加费:" prop="add_peak_price">
                <el-input-number
                    v-model="form.add_peak_price"
                    :min="0"
                    :step="1"
                    :precision="2"
                    placeholder="高峰期附加费"
                />
            </el-form-item>
            <el-form-item label="高峰开始时间" prop="start">
                <el-time-picker
                    v-model="form.start"
                    :picker-options="{
                        selectableRange: '00:00:00 - 23:30:00',
                        step: '00:30'
                    }"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="选择开始时间"
                />
            </el-form-item>

            <el-form-item label="高峰结束时间" prop="end">
                <el-time-picker
                    v-model="form.end"
                    :picker-options="{
                        selectableRange: '00:30:00 - 24:00:00',
                        step: '00:30'
                    }"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="选择结束时间"
                />
            </el-form-item>

            <el-form-item label="开放开始时间" prop="start_time">
                <el-time-picker
                    v-model="form.start_time"
                    :picker-options="{
                        selectableRange: '00:00:00 - 23:30:00',
                        step: '00:30'
                    }"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="选择开始时间"
                />
            </el-form-item>

            <el-form-item label="开放结束时间" prop="end_time">
                <el-time-picker
                    v-model="form.end_time"
                    :picker-options="{
                        selectableRange: '00:30:00 - 24:00:00',
                        step: '00:30'
                    }"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="选择结束时间"
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
import { getCategoryRule, addOrUpdateRule } from '@/api/store/category'
import { getBaseUrl } from '@/utils/auth'

export default {
    name: 'AddOrUpdateRule',
    components: {},
    data() {
        return {
            visible: false,
            btnLoading: false,
            domin: getBaseUrl(),
            form: {
                id: 0,
                category_id: 0,
                base_price: 0,
                add_peak_price: 0,
                start: '08:00',
                end: '10:00',
                start_time: '08:00',
                end_time: '22:00'
            },
            rules: {
                start: [
                    {
                        required: true,
                        message: '请选择开始时间',
                        trigger: 'change'
                    },
                    {
                        validator: (rule, value, callback) => {
                            if (!value || !this.form.end) return callback()
                            if (this.compareTime(value, this.form.end) >= 0) {
                                callback(
                                    new Error('开始时间不能大于或等于结束时间')
                                )
                            } else {
                                callback()
                            }
                        },
                        trigger: 'change'
                    }
                ],
                end: [
                    {
                        required: true,
                        message: '请选择结束时间',
                        trigger: 'change'
                    },
                    {
                        validator: (rule, value, callback) => {
                            if (!value || !this.form.start) return callback()
                            if (this.compareTime(this.form.start, value) >= 0) {
                                callback(new Error('结束时间必须大于开始时间'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'change'
                    }
                ],
                start_time: [
                    {
                        required: true,
                        message: '请选择开始时间',
                        trigger: 'change'
                    },
                    {
                        validator: (rule, value, callback) => {
                            if (!value || !this.form.end_time) return callback()
                            if (
                                this.compareTime(value, this.form.end_time) >= 0
                            ) {
                                callback(
                                    new Error('开始时间不能大于或等于结束时间')
                                )
                            } else {
                                callback()
                            }
                        },
                        trigger: 'change'
                    }
                ],
                end_time: [
                    {
                        required: true,
                        message: '请选择结束时间',
                        trigger: 'change'
                    },
                    {
                        validator: (rule, value, callback) => {
                            if (!value || !this.form.start_time)
                                return callback()
                            if (
                                this.compareTime(this.form.start_time, value) >=
                                0
                            ) {
                                callback(new Error('结束时间必须大于开始时间'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'change'
                    }
                ]
            }
        }
    },
    methods: {
        init(data) {
            this.visible = true
            this.category_id = data.id
            this.form.category_id = this.category_id
            this.getRule()
                .then(() => {})
                .catch(() => {})
            this.loading = false
        },
        compareTime(t1, t2) {
            const [h1, m1] = t1.split(':').map(Number)
            const [h2, m2] = t2.split(':').map(Number)
            return h1 * 60 + m1 - (h2 * 60 + m2)
        },
        async getRule() {
            await getCategoryRule({ category_id: this.category_id }).then(
                (response) => {
                    if (response.data) {
                        this.form = response.data
                        console.log(this.form)
                    }
                }
            )
        },
        onFormSubmit() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.btnLoading = true
                    addOrUpdateRule(this.form)
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
            this.btnLoading = false
            this.$refs.form.resetFields()
            this.form.start = '08:00'
            this.form.end = '10:00'
            this.form.start_time = '08:00'
            this.form.end_time = '22:00'
        },
        onClose() {
            this.btnLoading = false
            this.clearForm()
            // this.$refs['form'].resetFields()
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
