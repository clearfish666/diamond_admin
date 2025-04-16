<template>
  <vue-draggable
    class="l-goods-images"
    :options="dragOptions"
    @end="dragging = false"
    @start="dragging = true"
  ><template v-if="images.length &gt; 0">
     <image-box
       v-for="(image, index) in images"
       :key="index"
       class="goods-image"
       inline="inline"
       width="82px"
       :class="{
         'goods-image--loading': image.loading,
         'goods-image--success': image.success,
         'goods-image--error': image.error,
       }"
     ><img :src="image.src" @load="uploadHandle(image.file, index)">
       <div class="goods-image__mask">
         <i v-if="image.loading" class="el-icon-loading" />
         <el-button-group v-if="image.success || image.error">
           <el-button
             size="mini"
             type="danger"
             icon="el-icon-delete"
             @click="deleteHandle(index)"
           />
         </el-button-group>
       </div>
     </image-box>
   </template>
    <image-box v-if="isShowPlaceholder" inline="inline" width="82px">
      <div class="goods-image__placeholder" @click="chooseFilesHandle()">
        <svg-icon icon-class="poster" /><span>{{ placeholder || "添加图片" }}</span>
      </div>
      <input
        :id="id"
        :key="id"
        ref="fileInput"
        hidden="hidden"
        :multiple="multipe"
        type="file"
        @change="beforeUploadHandle($event)"
      >
    </image-box>
  </vue-draggable>
</template>
<script>
import ImageBox from './ImageBox'
import vueDraggable from 'vuedraggable'
import uploadFile from '@/api/common'

export default {
  name: 'GoodsImages',
  props: {
    id: {
      type: String,
      default: new Date().getTime() + ''
    },
    src: String,
    value: Array,
    limit: Number,
    placeholder: String,
    multipe: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ImageBox,
    vueDraggable
  },
  data() {
    return {
      images: [],
      dragging: false,
      dragOptions: {
        animation: 200,
        disabled: false,
        ghostClass: 'ghost',
        draggable: '.goods-image'
      }
    }
  },
  computed: {
    isShowPlaceholder() {
      if (this.src) return false
      return this.limit > 0 ? this.images.length < this.limit : true
    }
  },
  watch: {
    value(val) {
      this.images = val
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.src && !this.value) {
        this.images = [
          {
            error: false,
            loading: false,
            success: true,
            src: this.src
          }
        ]
      }
    },
    chooseFilesHandle() {
      this.$refs['fileInput'].click()
    },

    beforeUploadHandle(evt) {
      const files = evt.target.files || evt.dataTransfer.files || []
      const maxL = this.images.length + Object.keys(files).length
      if (maxL > 15) {
        return this.$message.error('最多上传15张图片')
      }
      if (this.multipe) {
        Object.keys(files).forEach((i) => {
          const image = {
            file: files[i],
            error: false,
            loading: true,
            success: false,
            src: window.URL.createObjectURL(files[i])
          }
          this.images.push(image)
        })
      } else {
        const file = files[0]
        const image = {
          file,
          error: false,
          loading: true,
          success: false,
          src: window.URL.createObjectURL(file)
        }

        this.images.push(image)
      }

      this.$refs['fileInput'] && (this.$refs['fileInput'].value = null)
    },

    uploadHandle(file, index) {
      if (!file) return
      const image = this.images[index]
      if (!image) return

      uploadFile(file, { type: 'goods' })
        .then(data => {
          const newImage = { ...image, ...data.data, loading: false, success: true }
          this.$set(this.images, index, newImage)

          this.$nextTick(() => {
            this.$emit('input', this.images)
            this.$emit('change', this.images)
          })
        })
        .catch((_err) => {
          this.$set(this.images, index, {
            ...image,
            error: true,
            loading: false,
            success: false
          })

          this.$nextTick(() => {
            this.$emit('input', this.images)
            this.$emit('change', this.images)
          })
        })
    },
    deleteHandle(index) {
      this.$confirm('是否移除该图片？', '提示')
        .then(() => {
          this.images.splice(index, 1)

          this.$nextTick(() => {
            this.$emit('input', this.images)
            this.$emit('change', this.images)
          })
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss">
.l-goods-images {
  margin-left: -5px;
  margin-top: -5px;
  font-size: 0;
  line-height: 1;
}

.goods-image {
  &__placeholder {
    cursor: pointer;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;
    text-align: center;
    font-size: 12px;
    line-height: initial;

    color: #c0c4cc;

    span {
      margin-top: 9px;
    }
  }

  &__mask {
    opacity: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    z-index: -1;

    background-color: rgba(0, 0, 0, 0.2);
    transition: z-index 0.3s, opacity 0.5s;

    .el-icon-loading {
      font-size: 32px;
    }
  }

  &:hover &__mask {
    z-index: 1;
    opacity: 0.95;
  }

  &--loading &__mask {
    z-index: 1;
    opacity: 0.95;
  }
}
.flip-list-move {
  transition: transform 0.5s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
