<template>
    <el-dialog
        v-loading="loading"
        :top="'2vh'"
        :title="formRule.name"
        :visible.sync="priceVisible"
        :close-on-click-modal="false"
        class="el-form-dialog"
        width="800px"
        append-to-body
        @closed="onClose()"
    >
        <div style="margin-bottom: 20px; display: flex; align-items: center">
            <el-button
                type="primary"
                :disabled="!hasChanged"
                @click="submitPrice"
            >
                保存
            </el-button>

            <!-- 未保存提示 -->
            <span v-if="hasChanged" class="unsaved-tip">
                ⚠ 当前有未保存修改
            </span>
        </div>
        <div class="price-time-wrapper">
            <el-table
                :data="tableData"
                border
                style="width: 100%"
                :header-cell-style="{ textAlign: 'center' }"
                :cell-style="{ textAlign: 'center' }"
            >
                <!-- 星期列 -->
                <el-table-column
                    prop="weekLabel"
                    label="星期"
                    fixed
                    width="100"
                ></el-table-column>

                <!-- 时间段列 -->
                <el-table-column
                    v-for="(slot, index) in timeSlots"
                    :key="index"
                    :label="slot.label"
                >
                    <template slot-scope="scope">
                        <div
                            class="price-cell"
                            :class="getCellClass(scope.row.week, slot.value)"
                            @click="handleClick(scope.row.week, slot.value)"
                        >
                            <!-- 价格显示 -->
                            <span>
                                {{ displayPrice(scope.row.week, slot.value) }}
                            </span>

                            <!-- 右上角清除按钮 -->
                            <i
                                v-if="hasPrice(scope.row.week, slot.value)"
                                class="el-icon-close clear-icon"
                                @click.stop="
                                    quickClear(scope.row.week, slot.value)
                                "
                            ></i>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 弹窗 -->
            <el-dialog
                title="设置价格"
                :visible.sync="dialogVisible"
                append-to-body
                width="300px"
            >
                <div>
                    <p>星期：{{ currentWeekLabel }}</p>
                    <p>时间段：{{ currentTimeLabel }}</p>

                    <el-input
                        v-model.number="form.price"
                        placeholder="请输入价格"
                        type="number"
                    >
                        <template slot="append">元</template>
                    </el-input>
                </div>

                <span slot="footer">
                    <el-button
                        v-if="hasCurrentPrice"
                        type="danger"
                        plain
                        @click="clearPrice"
                    >
                        取消设定
                    </el-button>

                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="savePrice">
                        确定
                    </el-button>
                </span>
            </el-dialog>
        </div>
    </el-dialog>
</template>

<script>
import { priceInfo, addOrUpdatePrice } from '@/api/store/goods'

export default {
    name: 'PriceTimeTable',
    data() {
        return {
            priceVisible: false,
            hasChanged: false,
            loading: false,
            formRule: {
                category_id: '',
                goods_id: '',
                name: ''
            },
            weeks: [
                { label: '周一', value: 1 },
                { label: '周二', value: 2 },
                { label: '周三', value: 3 },
                { label: '周四', value: 4 },
                { label: '周五', value: 5 },
                { label: '周六', value: 6 },
                { label: '周日', value: 7 }
            ],

            timeSlots: [],
            tableData: [],
            priceMap: {},
            originalPriceMap: {},
            dialogVisible: false,
            currentWeek: null,
            currentTime: null,

            form: {
                price: null
            }
        }
    },

    created() {
        this.generateTimeSlots()
        this.generateTableData()
    },

    computed: {
        currentWeekLabel() {
            const w = this.weeks.find((item) => item.value === this.currentWeek)
            return w ? w.label : ''
        },
        currentTimeLabel() {
            const t = this.timeSlots.find(
                (item) => item.value === this.currentTime
            )
            return t ? t.label : ''
        },
        hasCurrentPrice() {
            const key = this.getKey(this.currentWeek, this.currentTime)
            return this.priceMap.hasOwnProperty(key)
        }
    },
    watch: {
        priceMap: {
            deep: true,
            handler() {
                this.hasChanged =
                    JSON.stringify(this.priceMap) !==
                    JSON.stringify(this.originalPriceMap)
            }
        }
    },

    methods: {
        init(data) {
            this.priceVisible = true
            this.formRule.category_id = data.category_id
            this.formRule.goods_id = data.id
            this.formRule.name = data.name
            this.getList()
        },
        getList(loading = true) {
            if (this.loading) return
            this.loading = loading

            priceInfo({ goods_id: this.formRule.goods_id })
                .then((response) => {
                    if (response.code !== 0) return

                    this.loadData(response.data)
                })
                .catch((error) => {
                    this.$message.error(error.msg)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        loadData(list) {
            this.priceMap = {}

            list.forEach((item) => {
                const start = this.timeToMinutes(item.start_time)
                const end = this.timeToMinutes(item.end_time)

                const key = `${item.week}_${start}_${end}`

                this.$set(this.priceMap, key, Number(item.price))
            })
            this.originalPriceMap = JSON.parse(JSON.stringify(this.priceMap))
        },
        timeToMinutes(timeStr) {
            const [h, m] = timeStr.split(':')
            return Number(h) * 60 + Number(m)
        },
        generateTimeSlots() {
            const startMinutes = 8 * 60 + 30 // 08:30
            const endMinutes = 22 * 60 + 30 // 22:30
            const interval = 2 * 60 // 2小时

            for (let time = startMinutes; time < endMinutes; time += interval) {
                const start = this.formatTimeByMinutes(time)
                const end = this.formatTimeByMinutes(time + interval)

                const label = `${start} - ${end}`
                const value = `${time}_${time + interval}`

                this.timeSlots.push({ label, value })
            }
        },

        formatTimeByMinutes(totalMinutes) {
            const hour = Math.floor(totalMinutes / 60)
            const minute = totalMinutes % 60

            const h = hour < 10 ? `0${hour}` : hour
            const m = minute < 10 ? `0${minute}` : minute

            return `${h}:${m}`
        },
        generateTableData() {
            this.tableData = this.weeks.map((w) => ({
                week: w.value,
                weekLabel: w.label
            }))
        },
        hasPrice(week, time) {
            const key = this.getKey(week, time)
            return this.priceMap.hasOwnProperty(key)
        },

        quickClear(week, time) {
            // const key = this.getKey(week, time)
            // this.$delete(this.priceMap, key)

            const key = this.getKey(week, time)
            if (this.priceMap.hasOwnProperty(key)) {
                this.$delete(this.priceMap, key)
                this.hasChanged = true
            }
        },
        getKey(week, time) {
            return `${week}_${time}`
        },
        clearPrice() {
            const key = this.getKey(this.currentWeek, this.currentTime)

            this.$delete(this.priceMap, key)

            this.dialogVisible = false

            // TODO: 调后端接口删除规则
            // this.$axios.delete(...)
        },
        // 显示价格（0 也要显示）
        displayPrice(week, time) {
            const key = this.getKey(week, time)
            return this.priceMap.hasOwnProperty(key)
                ? this.priceMap[key] + ' 元'
                : '-'
        },

        // 单元格样式控制
        getCellClass(week, time) {
            const key = this.getKey(week, time)

            if (!this.priceMap.hasOwnProperty(key)) {
                return 'cell-empty'
            }

            if (this.priceMap[key] === 0) {
                return 'cell-zero'
            }

            return 'cell-set'
        },

        handleClick(week, time) {
            this.currentWeek = week
            this.currentTime = time

            const key = this.getKey(week, time)
            this.form.price = this.priceMap.hasOwnProperty(key)
                ? this.priceMap[key]
                : null

            this.dialogVisible = true
        },

        buildSubmitData() {
            const result = []

            Object.keys(this.priceMap).forEach((key) => {
                const [week, startMin, endMin] = key.split('_')

                result.push({
                    week: Number(week),
                    start_time: this.formatTimeByMinutes(Number(startMin)),
                    end_time: this.formatTimeByMinutes(Number(endMin)),
                    price: this.priceMap[key]
                })
            })

            return result
        },
        savePrice() {
            const key = this.getKey(this.currentWeek, this.currentTime)
            // this.$set(this.priceMap, key, this.form.price)
            // this.dialogVisible = false

            if (this.form.price === null || this.form.price === '') {
                this.$delete(this.priceMap, key)
            } else {
                this.$set(this.priceMap, key, this.form.price)
            }

            this.hasChanged = true // 👈 关键

            this.dialogVisible = false

            // const rules = this.buildSubmitData()

            // addOrUpdatePrice({
            //     category_id: this.formRule.category_id,
            //     goods_id: this.formRule.goods_id,
            //     rules: rules
            // }).then(() => {
            //     this.$message.success('保存成功')
            // })

            // TODO: 调后端接口保存固定规则
        },

        submitPrice() {
            const rules = this.buildSubmitData()

            if (!rules.length) {
                this.$confirm('当前没有设置任何规则，是否清空？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.doSubmit(rules)
                })
                return
            }

            this.doSubmit(rules)
        },

        doSubmit(rules) {
            addOrUpdatePrice({
                category_id: this.formRule.category_id,
                goods_id: this.formRule.goods_id,
                rules: rules
            }).then(() => {
                this.$message.success('保存成功')
                this.hasChanged = false // 👈 清除未保存状态
                this.originalPriceMap = JSON.parse(
                    JSON.stringify(this.priceMap)
                )
            })
        },
        onClose() {
            this.priceVisible = false
        }
    }
}
</script>

<style scoped>
::v-deep .el-dialog__body {
    height: auto !important;
    overflow-y: visible !important;
}
.price-cell {
    position: relative;
    cursor: pointer;
    padding: 8px 0;
    transition: 0.2s;
}

/* 未设置 */
.cell-empty {
    background: #fff;
}

/* 已设置普通价格 */
.cell-set {
    background: #e6f7ff;
    color: #1890ff;
    font-weight: 500;
}

/* 0元 */
.cell-zero {
    background: #f6ffed;
    color: #52c41a;
    font-weight: bold;
}

/* hover 效果 */
.price-cell:hover {
    background: #d9ecff !important;
}

/* 右上角清除按钮 */
.clear-icon {
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 12px;
    color: #ff4d4f;
    display: none;
    cursor: pointer;
}

/* 只有已设置时 hover 才显示 */
.price-cell:hover .clear-icon {
    display: block;
}

.unsaved-tip {
    margin-left: 15px;
    color: #e6a23c;
    font-size: 14px;
    animation: fadeIn 0.3s;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>