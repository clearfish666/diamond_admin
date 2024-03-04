<template>
  <div>
    <div class="cover-box">
      <el-image style="width: 100px; height: 100px" :src="cover" />
      <div v-if="musicCode" class="cover-bg">
        <i class="el-icon-video-play" @click="onPlay" />
      </div>

      <el-dialog
        :top="windowsheight / 3 + 'px'"
        :visible.sync="visible"
        :close-on-click-modal="false"
        @closed="onClose()"
      >
        <a-player
          v-if="audio.url"
          v-loading="loading"
          :music="audio"
          :list="[audio]"
          autoplay
          :show-lrc="true"
          preload="auto"
        />
      </el-dialog>
    </div>
  </div>
</template>

<script>
import APlayer from 'vue-aplayer'
import { mixin } from '@/utils/mixin'
import { getMusicInfo } from '@/api/main'
APlayer.disableVersionBadge = true

export default {
  components: { APlayer },
  mixins: [mixin],
  props: {
    title: {
      type: String,
      default: ''
    },
    cover: {
      type: String,
      default: ''
    },
    artist: {
      type: String,
      default: ''
    },
    musicCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      visible: false,
      audio:
        {
          title: null,
          artist: null,
          url: null,
          pic: null,
          lrc: null
        }
    }
  },
  created() {
    this.audio.title = this.title
    this.audio.pic = this.cover
    this.audio.artist = this.artist
  },
  methods: {
    onPlay() {
      this.loading = true
      this.visible = true
      getMusicInfo(this.musicCode)
        .then((data) => {
          this.audio.lrc = data.data.dynamicLyricUrl
          this.audio.url = data.data.fileUrl
          this.loading = false
        })
        .catch(() => {})
    },
    onClose() {
      this.loading = true
      this.visible = false
      Object.assign(this.$data, this.$options.data())
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .cover-box {
  width: 100px;
  margin: 0 auto;
  position: relative;
  line-height: 0;
  img {
    width: 100%;
  }
  .cover-bg {
    transition: opacity 0.3s;
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    opacity: 0;
    i {
      cursor: pointer;
      position: absolute;
      left: 50%;
      top: 50%;
      margin-left: -15px;
      margin-top: -15px;
      color: #fff;
      font-size: 30px;
    }
    &:hover {
      opacity: 1;
    }
  }
}
</style>
