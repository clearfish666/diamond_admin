<template>
  <div id="app" :style="{ '--windowsheight': windowsheight - 100 + 'px','--formheight': windowsheight - 150 + 'px' }">
    <router-view />
  </div>
</template>

<script>
import { mixin } from '@/utils/mixin'
export default {
  name: 'App',
  mixins: [mixin],
  data() {
    return {
      globalHttpUrl: '1'
    }
  }
}
</script>
<style>
.el-tooltip__popper {
  max-width: 400px;
  line-height: 180%;
}
::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0;
}

::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  cursor: pointer;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.15);
  transition: color 0.2s ease;
}

.el-image {
  width: 100% !important;
}

.el-image__error {
  background: none;
}

.el-dialog{
  margin-bottom: 2vh;
}

.el-form-dialog .el-dialog__body {
  overflow-y: auto;
  height: auto;
  max-height: var(--formheight);
}

.el-dialog__body {
  overflow-y: auto;
  height: var(--windowsheight);
}
</style>
