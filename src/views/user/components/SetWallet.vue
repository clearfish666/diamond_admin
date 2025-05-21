<template>
    <el-dialog
        title="增加/扣除"
        :visible.sync="visible"
        :top="'2vh'"
        class="el-form-dialog"
        @closed="onClose()"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="业务类型" prop="action">
                <el-radio-group v-model="form.action">
                    <el-radio :label="1">增加</el-radio>
                    <el-radio :label="2">扣除</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="资产类型" prop="currency">
                <el-select
                    v-model="form.currency"
                    placeholder="请选择"
                    clearable
                >
                    <el-option
                        v-for="item in currencyOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <!-- <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :label="1">余额</el-radio>
          <el-radio :label="2">待释放</el-radio>
        </el-radio-group>
      </el-form-item> -->
            <el-form-item label="数量" prop="num">
                <el-input-number v-model="form.num" :min="0" label="数量" />
            </el-form-item>
            <el-form-item label="操作原因" prop="reason">
                <el-input
                    v-model="form.reason"
                    :rows="6"
                    type="textarea"
                    placeholder="操作原因"
                    clearable
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
import { getCurrencyType } from '@/api/main'
import { setWallet } from '@/api/user'

export default {
    name: 'SetWallet',
    data() {
        const validateNum = (rule, value, callback) => {
            if (value <= 0) {
                callback(new Error('数量不能小于等于0'))
            } else {
                callback()
            }
        }
        return {
            visible: false,
            btnLoading: false,
            form: {
                id: 0,
                action: 1,
                currency: 'RMB',
                type: 1,
                num: 0,
                reason: ''
            },
            currencyOptions: [],
            rules: {
                action: [
                    {
                        required: true,
                        message: '业务类型不能为空',
                        trigger: ['blur', 'change']
                    }
                ],
                currency: [
                    {
                        required: true,
                        message: '资产类型不能为空',
                        trigger: ['blur', 'change']
                    }
                ],
                num: [
                    {
                        required: true,
                        message: '数量不能为空',
                        trigger: ['blur', 'change']
                    },
                    { validator: validateNum, trigger: ['blur', 'change'] }
                ],
                reason: [
                    {
                        required: true,
                        message: '操作原因不能为空',
                        trigger: ['blur', 'change']
                    }
                ]
            }
        }
    },
    methods: {
        init(data) {
            this.onGetCurrencyType()
                .then(() => {
                    if (data.id) {
                        this.visible = true
                        this.form.id = data.id
                    }
                })
                .catch(() => {})
        },
        onFormSubmit() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.btnLoading = true
                    const h = this.$createElement
                    this.$confirm(
                        h('p', null, [
                            h('span', null, '此操作将 '),
                            h(
                                'span',
                                {
                                    style: `color: ${
                                        this.form.action === 1
                                            ? '#f56c6c'
                                            : '#67c23a'
                                    }`
                                },
                                this.form.action === 1 ? '增加' : '扣除'
                            ),
                            h(
                                'span',
                                null,
                                ` (${
                                    this.currencyOptions.filter((v) => {
                                        return v.value === this.form.currency
                                    })[0].label
                                })`
                            ),
                            h('span', null, ' , 是否继续?')
                        ]),
                        '提示',
                        {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }
                    )
                        .then(() => {
                            setWallet(this.form)
                                .then(({ msg }) => {
                                    this.$message.success(msg)
                                    this.visible = false
                                    this.$emit('refreshList')
                                })
                                .catch(() => {
                                    this.btnLoading = false
                                })
                        })
                        .catch(() => {
                            this.btnLoading = false
                        })
                }
            })
        },
        async onGetCurrencyType() {
            await getCurrencyType()
                .then((response) => {
                    this.currencyOptions = response.data
                })
                .catch(() => {})
        },
        onClose() {
            this.btnLoading = false
            this.$reset()
        }
    }
}
</script>

<style scoped>
.el-input-number {
    width: 200px;
}
</style>
