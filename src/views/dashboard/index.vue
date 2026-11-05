<template>
    <div class="dashboard-container">
        <div class="welcome">欢迎登录大卖钻后台管理系统</div>
        <div
            class="test-clock-container"
            :style="'height:' + pageheight + 'px;'"
        >
            <flip-clock />
        </div>
    </div>
</template>
<script>
import FlipClock from 'kuan-vue-flip-clock'
export default {
    components: {
        FlipClock
    },
    data() {
        return {
            pageheight: 0
        }
    },
    created() {
        this.pageheight = document.body.clientHeight - 84
    }
}
</script>

<style lang="scss">
.welcome {
    text-align: center;
    height: 0px;
    width: 100%;
    line-height: 500px;
    color: #fff;
    font-size: 36px;
    font-family: 'Helvetica Neue';
    font-weight: bold;
}
.test-clock-container {
    font: normal 12px 'Helvetica Neue', Helvetica, sans-serif;
    user-select: none;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
    background: radial-gradient(ellipse at center, #969696 0%, #595959 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
