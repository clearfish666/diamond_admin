<template>
    <div class="app-container">
        <el-form ref="forms" :model="forms" :rules="rules" label-width="220px">
            <el-tabs v-model="activeName">
                <el-tab-pane
                    v-if="forms[activeName]"
                    label="基础配置"
                    name="basis"
                    :style="'height:' + pageheight + 'px;overflow-y: auto;'"
                >
                    <el-form-item label="提示语开关" prop="switch">
                        <el-switch
                            v-model="forms.basis.switch.value"
                            active-value="1"
                            inactive-value="0"
                        />
                    </el-form-item>
                    <el-form-item label="提示语" prop="pay_notice">
                        <el-input
                            v-model="forms.basis.pay_notice.value"
                            label="提示语"
                        />
                    </el-form-item>

                    <el-form-item>
                        <el-button
                            type="primary"
                            :loading="btnLoading"
                            @click="onFormSubmit()"
                        >
                            {{ $t('table.confirm') }}
                        </el-button>
                    </el-form-item>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </div>
</template>

<script>
import { getConfig, setConfig } from '@/api/configs'
import { mixin } from '@/utils/mixin'
import LocalUpload from '@/components/Upload/LocalUpload'
import { getBaseUrl } from '@/utils/auth'

export default {
    name: 'SystemConfig',
    mixins: [mixin],
    components: { LocalUpload },
    data() {
        return {
            visible: false,
            btnLoading: false,
            domin: getBaseUrl(),
            showImage: '',
            pricelist: '',
            type: 'system',
            forms: {},
            rules: {},
            activeName: 'basis'
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            this.getList()
        },
        getList() {
            getConfig(this.type)
                .then((response) => {
                    this.forms = response.data.values
                    console.log(this.forms)
                    //   this.showImage =
                    //       this.domin + this.forms.service.service_online.value
                    //   this.pricelist =
                    //       this.domin + this.forms.service.price_list.value
                })
                .catch(({ msg = '加载失败' }) => {
                    this.$message.error(msg)
                })
        },
        onFormSubmit() {
            this.$refs['forms'].validate((valid) => {
                if (valid) {
                    this.btnLoading = true
                    setConfig({ type: this.type, data: this.forms })
                        .then(({ msg }) => {
                            this.$message.success(msg)
                            this.getList()
                        })
                        .catch(() => {})
                        .finally(() => {
                            this.btnLoading = false
                        })
                }
            })
        },
        handlePricelistSuccess(response, file) {
            this.forms.service.price_list.value = response.data.filename
            this.pricelist = this.domin + this.forms.service.price_list.value
        },
        beforePricelistUpload(file, cb) {
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
            this.forms.service.service_online.value = response.data.filename
            this.showImage =
                this.domin + this.forms.service.service_online.value
            console.log(this.domin + this.forms.service.service_online.value)
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
        }
    }
}
</script>

<style scoped>
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
