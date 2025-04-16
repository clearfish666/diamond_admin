<template>
  <div
    :style="wrapStyle"
    class="c-imageBox"
    :class="{
      'c-imageBox--inline': inline,
      'c-imageBox--contain': contain
    }"
  >
    <div :style="bgStyle" class="c-imageBox__bg" />
    <div class="c-imageBox__wrap"><slot /></div>
  </div>
</template>
<script>
export default {
  name: 'ImageBox',
  props: {
    ratio: {
      type: String,
      validator: str => {
        return /\d+x\d+/i.test(str)
      }
    },
    width: String,
    height: String,
    inline: Boolean,
    contain: Boolean
  },
  computed: {
    wrapStyle() {
      return {
        width: this.width,
        height: this.height
      }
    },
    bgStyle() {
      return this.height ? {} : this.ratioToStyle(this.ratio)
    }
  },
  methods: {
    ratioToStyle(ratio) {
      if (!ratio) return
      const [w, h] = ratio.split('x')

      return {
        paddingTop: (h / w) * 100 + '%'
      }
    }
  }
}
</script>

<style lang="scss">
.c-imageBox {
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  margin: 5px;
  width: 225px;
  height: 82px;
  &__wrap {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;

    width: 100%;
    height: 100%;
  }

  &__bg {
    padding-top: 100%;
    width: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--contain {
    img {
      object-fit: contain;
    }
  }

  &--inline {
    display: inline-block;
  }
}
</style>
