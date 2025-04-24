<template>
    <el-dialog
        :title="form.id ? $t('table.edit') : $t('table.add')"
        :visible.sync="visible"
        :close-on-click-modal="false"
        :top="'2vh'"
        class="el-form-dialog"
        @closed="onClose()"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="名称" prop="name">
                <el-input
                    v-model="form.name"
                    placeholder="请输入优惠券名称"
                    clearable
                />
            </el-form-item>
            <el-form-item label="类型" prop="type">
                <el-radio-group v-model="form.type">
                    <el-radio :label="2">折扣券</el-radio>
                    <el-radio :label="3">代金券</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item
                v-if="form.type === 2"
                label="折扣比例(%)"
                prop="discount_rate"
            >
                <el-input-number
                    v-model="form.discount_rate"
                    :min="0"
                    :max="100"
                    placeholder="折扣比例(%),80代表80%"
                />
            </el-form-item>
            <el-form-item
                v-if="form.type === 3"
                label="代金金额(元)"
                prop="amount"
            >
                <el-input-number
                    v-model="form.amount"
                    :min="0"
                    placeholder="抵扣金额"
                />
            </el-form-item>
            <el-form-item label="发行数量" prop="total">
                <el-input-number
                    v-model="form.total"
                    :min="1"
                    placeholder="发行数量"
                />
            </el-form-item>
            <el-form-item label="限制领取数量" prop="limit_per_user">
                <el-input-number
                    v-model="form.limit_per_user"
                    :min="1"
                    placeholder="限制领取数量"
                />
            </el-form-item>
            <el-form-item label="使用时间">
                <el-date-picker
                    v-model="dateRangeValue"
                    type="datetimerange"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    :picker-options="pickerOptions"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right"
                    @change="onChangeDateRange"
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
import { addOrUpdate } from '@/api/coupon'
import { posList } from '@/api/main'
import LocalUpload from '@/components/Upload/LocalUpload'
import { getBaseUrl } from '@/utils/auth'

export default {
    name: 'AddOrUpdate',
    components: { LocalUpload },
    data() {
        return {
            visible: false,
            btnLoading: false,
            domin: getBaseUrl(),
            dateRangeValue: [],
            imageInfo: '',
            showImage: '',

            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近24小时',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 7
                            )
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 30
                            )
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 90
                            )
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
            form: {
                id: 0,
                type: 2,
                name: '',
                limit_per_user: 1,
                total: 0,
                discount_rate: 0,
                amount: 0,
                start_time: '',
                end_time: ''
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: '请输入优惠券名称',
                        trigger: ['blur', 'change']
                    }
                ],
                type: [
                    {
                        required: true,
                        message: '请选择优惠券类型',
                        trigger: ['blur', 'change']
                    }
                ]
                // url: [{ validator: validateUrl, trigger: ["blur", "change"] }],
                // type: [
                //   {
                //     required: true,
                //     message: "请选择广告标识",
                //     trigger: ["blur", "change"],
                //   },
                // ],
                //  image: [
                //      {
                //          required: true,
                //          message: '请上传广告海报',
                //          trigger: ['blur', 'change']
                //      }
                //  ]
            }
        }
    },
    methods: {
        init(data) {
            this.visible = true
            this.getPosList()
                .then(() => {
                    if (data) {
                        this.form = JSON.parse(JSON.stringify(data))
                        this.showImage = this.domin + this.form.image
                    }
                })
                .catch(() => {})
        },
        onChangeDateRange(value) {
            if (Array.isArray(value)) {
                this.form.start_time = value[0]
                this.form.end_time = value[1]
            } else {
                this.form.start_time = this.form.end_time = ''
                this.getList(1)
            }
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
        clearForm() {
            this.showImage = ''
            this.form = {
                id: 0,
                type: '',
                image: '',
                url: '',
                url_type: 0,
                sort: 0,
                display_interval: 0
            }
            this.imageInfo = ''
        },
        //   onChangeUrlType() {
        //       this.$refs.form.clearValidate()
        //   },
        onClose() {
            this.btnLoading = false
            this.clearForm()
            this.$refs['form'].resetFields()
        },
        handleAvatarSuccess(response, file) {
            this.form.image = response.data.filename
            this.showImage = this.domin + response.data.filename
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
        handleAvatarError(error) {
            if (JSON.parse(error.message).error.indexOf('token') !== -1) {
                this.$message.error('上传功能已失效，请重新登录')
            }
        },
        async getPosList() {
            await posList().then((response) => {
                this.posList = response.data
            })
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
