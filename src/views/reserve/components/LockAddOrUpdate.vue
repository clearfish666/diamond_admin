<template>
    <el-dialog
        :title="form.id ? '编辑锁单' : '新增锁单'"
        :visible.sync="visible"
        :close-on-click-modal="false"
        @closed="onClose"
        :top="'1.5vh'"
        width="600px"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="类型" prop="category_id">
                <el-select v-model="form.category_id" placeholder="请选择类型">
                    <el-option
                        v-for="item in categoryList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="场地" prop="goods_id">
                <el-select v-model="form.goods_id" placeholder="请选择场地">
                    <el-option
                        v-for="item in goodsList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="开始日期" prop="start_date">
                <el-date-picker
                    v-model="form.start_date"
                    type="date"
                    placeholder="选择开始日期"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd"
                />
            </el-form-item>

            <el-form-item label="结束日期" prop="end_date">
                <el-date-picker
                    v-model="form.end_date"
                    type="date"
                    placeholder="选择结束日期"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd"
                />
            </el-form-item>
            <el-form-item label="时间" prop="time_id">
                <el-select
                    v-model="form.time_id"
                    multiple
                    placeholder="请选择时间"
                >
                    <el-option
                        v-for="item in timeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button
                type="primary"
                :loading="btnLoading"
                @click="onFormSubmit"
                >确认</el-button
            >
        </template>
    </el-dialog>
</template>


<script>
import { addOrUpdate } from '@/api/lock_order'
import { getCategory, getCategoryGoods, getTime } from '@/api/main'
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
            categoryList: [],
            goodsList: [],
            timeList: [],
            isInit: false, // 是否是初始化加载

            form: {
                id: 0,
                category_id: '',
                goods_id: '',
                start_date: '',
                end_date: '',
                start_time: '',
                end_time: '',
                time_id: ''
            },
            rules: {
                category_id: [
                    { required: true, message: '请选择分类', trigger: 'change' }
                ],
                goods_id: [
                    { required: true, message: '请选择场地', trigger: 'change' }
                ],
                start_date: [
                    {
                        required: true,
                        message: '请选择开始日期',
                        trigger: 'change'
                    }
                ],
                end_date: [
                    {
                        required: true,
                        message: '请选择结束日期',
                        trigger: 'change'
                    }
                ]
            }
        }
    },
    watch: {
        async 'form.category_id'(val) {
            if (val) {
                await this.loadGoodsList(val)
                if (!this.isInit) {
                    this.form.goods_id = ''
                }
                this.isInit = false
            } else {
                this.goodsList = []
                this.form.goods_id = ''
            }
        }
    },
    methods: {
        init(data) {
            this.visible = true
            this.isInit = true // 开始初始化

            this.loadCategoryList()
            this.getTimeList()

            if (data) {
                this.form = { ...data }
            } else {
                this.resetForm()
            }
            // this.getPosList()
            //     .then(() => {
            //         if (data) {
            //             this.form = JSON.parse(JSON.stringify(data))
            //             this.showImage = this.form.image
            //         }
            //     })
            //     .catch(() => {})
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
            this.form = {
                id: 0,
                category_id: '',
                goods_id: '',
                start_date: '',
                end_date: '',
                start_time: '',
                end_time: '',
                time_id: ''
            }
        },
        onChangeUrlType() {
            this.$refs.form.clearValidate()
        },
        onClose() {
            this.btnLoading = false
            this.resetForm()
        },
        resetForm() {
            this.$refs.form?.resetFields()
            this.form = {
                id: 0,
                category_id: '',
                goods_id: '',
                start_date: '',
                end_date: '',
                time_id: ''
            }
        },

        loadCategoryList() {
            getCategory({ pid: 0 })
                .then((response) => {
                    this.categoryList = response.data.map((item) => ({
                        value: item.value,
                        label: item.label
                    }))
                    resolve(category)
                })
                .catch(() => {})
        },

        loadGoodsList(categoryId) {
            getCategoryGoods({ category_id: categoryId })
                .then((response) => {
                    this.goodsList = response.data.map((item) => ({
                        value: item.value,
                        label: item.label
                    }))
                    //   resolve(category)
                })
                .catch(() => {})
        },
        async getTimeList() {
            await getTime()
                .then((response) => {
                    this.timeList = response.data.map((item) => ({
                        value: item.value,
                        label: item.label
                    }))
                })
                .catch(() => {})
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
