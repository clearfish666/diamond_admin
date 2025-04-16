<template>
    <el-dialog
        v-loading="loading"
        :top="'2vh'"
        :title="'规则编辑'"
        :visible.sync="visible"
        :close-on-click-modal="false"
        width="60%"
        class="el-form-dialog"
        @closed="onClose()"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="130px">
            <el-form-item label="半小时基础价:" prop="base_price">
                <el-input-number
                    v-model="form.base_price"
                    :min="0"
                    :step="1"
                    :precision="2"
                    placeholder="半小时基础价"
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
            <el-form-item label="开放时间段:">
                <el-time-picker
                    v-model="form.start_time"
                    :picker-options="{
                        selectableRange: '00:00:00 - 23:30:00'
                    }"
                    placeholder="开放时间"
                >
                </el-time-picker>
                <el-time-picker
                    arrow-control
                    v-model="form.end_time"
                    :picker-options="{
                        selectableRange: '00:30:00 - 24:00:00'
                    }"
                    placeholder="开放时间"
                >
                </el-time-picker>
            </el-form-item>
            <el-form-item label="高峰期时间段:">
                <el-time-picker
                    arrow-control
                    v-model="form.start"
                    :picker-options="{
                        selectableRange: '00:00:00 - 23:30:00'
                    }"
                    placeholder="高峰期时间段"
                >
                </el-time-picker>
                <el-time-picker
                    arrow-control
                    v-model="form.end"
                    :picker-options="{
                        selectableRange: '00:30:00 - 24:00:00'
                    }"
                    placeholder="高峰期时间段"
                >
                </el-time-picker>
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
import { getCategoryAttr, addOrUpdateAttr } from '@/api/store/category'
import LocalUpload from '@/components/Upload/LocalUpload'
import GoodsSkuModel from './GoodsSkuModel'
import { getCategory } from '@/api/main'
import { getBaseUrl } from '@/utils/auth'

export default {
    name: 'Category',
    components: { LocalUpload },
    data() {
        return {
            loading: true,
            visible: false,
            btnLoading: false,
            category_id: 0,
            showImage: '',
            domin: getBaseUrl(),
            specs_properties: [],
            isCanSpecsAdd: true,
            isInSpec: false,
            //最新一个属性ID
            lastId: 0,
            // 添加新规格
            newSpecs: {
                key: '',
                value: '',
                tips: ''
            },
            // skus 模型
            goodsSku: new GoodsSkuModel(),
            form: {
                category_id: 0,
                base_price: 0,
                add_peak_price: 0,
                start_time: '',
                end_time: '',
                start: '',
                end: ''
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: '名称不能为空',
                        trigger: ['blur', 'change']
                    }
                ],
                pid: [
                    {
                        required: true,
                        message: '父级不能为空',
                        trigger: ['blur', 'change']
                    }
                ]
            },
            category: []
        }
    },
    methods: {
        init(data) {
            this.visible = true
            this.category_id = data.id
            this.form.category_id = this.category_id
            this.getAttr()
                .then(() => {})
                .catch(() => {})
            this.loading = false
        },
        // 新增 规格
        addSpecsHandle() {
            const { key: name, value } = this.newSpecs

            if (!name && name === '') {
                this.$refs['newSpecs:name'].focus()
                this.newSpecs.tips = '请填写规格名'
                return
            }

            if (!value && value === '') {
                this.$refs['newSpecs:value'].focus()
                this.newSpecs.tips = '请填写规格值'
                return
            }

            this.lastId += 1
            let id = this.lastId
            this.specs_properties.push({
                id,
                name,
                properties: [value]
            })

            this.newSpecs = {
                key: '',
                value: '',
                tips: ''
            }

            this.$nextTick(this.formatSkusTableData)
        },
        // 新增 规格值
        addSpecsItemHandle(index) {
            const specs = this.specs_properties[index]
            if (!specs) return

            const input = this.$refs['newSpecsItemInput'][index]
            if (!input) return

            const name = input.value.trim()
            if (!name && name === '') return

            if (!Array.isArray(specs['properties'])) return

            if (specs['properties'].includes(name)) {
                this.$alert('存在同名”规格值“，请重新输入', '提示', {
                    type: 'warning'
                })
                return
            }

            specs['properties'].push(name)

            this.$set(this.specs_properties, index, specs)

            input.value = ''
            this.$nextTick(this.formatSkusTableData)
        },
        // 删除规格
        deleteSpecSHandle(index) {
            if (this.isInSpec) return
            this.$confirm('确认删除该规格？', '提示', { type: 'danger' })
                .then(() => {
                    this.specs_properties.splice(index, 1)

                    this.$nextTick(this.formatSkusTableData)
                })
                .catch(() => {})
        },
        // 删除规格值
        deleteSpecSItemHandle(index, subIndex) {
            if (this.isInSpec) return
            this.$confirm('确认删除该规格值？', '提示', { type: 'danger' })
                .then(() => {
                    this.specs_properties[index]['properties'].splice(
                        subIndex,
                        1
                    )

                    this.$nextTick(this.formatSkusTableData)
                })
                .catch(() => {})
        },
        onFormSubmit() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.btnLoading = true
                    this.form.specs_properties = this.specs_properties
                    addOrUpdateAttr(this.form)
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
        async onGetCategory() {
            await getCategory()
                .then((response) => {
                    this.category = [{ value: 0, label: '顶级' }].concat(
                        response.data
                    )
                })
                .catch(() => {})
        },
        onClose() {
            this.btnLoading = false
            this.$reset()
        },
        async getAttr() {
            await getCategoryAttr({ category_id: this.category_id }).then(
                (response) => {
                    let attrsValues = response.data.attrsValues

                    // 商品规格信息
                    for (const i in attrsValues) {
                        this.lastId = attrsValues[i].id
                        attrsValues[i] = {
                            id: attrsValues[i].id,
                            name: attrsValues[i].name,
                            properties: attrsValues[i].value
                        }
                    }
                    this.specs_properties = attrsValues
                }
            )
        }
    }
}
</script>

<style scoped>
.o-goodsSpecs-items {
    margin: 10px 0;
    vertical-align: middle;
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04); */
}

.goodsSpecs {
    width: 200px;
    margin-right: 10px;
}
</style>
