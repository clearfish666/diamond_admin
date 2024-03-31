<template>
  <div>
    <el-avatar
      :key="user.id"
      icon="el-icon-user-solid"
      :src="user.avatar ? getResourceUrl(user.avatar) : ''"
    />
    <div class="content-box">
      <div v-if="showId" class="content-overflow">
        # {{ user.id ? user.id : "-" }}
      </div>
      <div class="content-overflow">
        # {{ user.nickname ? user.nickname : "-" }}
      </div>

      <el-popover
        placement="top-start"
        title="用户信息"
        width="300"
        trigger="hover"
      >
        <div class="content-box">
          <div v-if="showId"># {{ user.id ? user.id : "-" }}</div>
          <div># {{ user.nickname ? user.nickname : "-" }}</div>
          <div v-if="user.email"># {{ user.email }}</div>
          <div v-if="user.phone"># {{ user.phone }}</div>
        </div>
        <div v-if="user.email" slot="reference" class="content-overflow">
          # {{ user.email }}
        </div>
        <div v-if="user.phone" slot="reference" class="content-overflow">
          # {{ user.phone }}
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { getToken, DominKey } from "@/utils/auth";
import { mixin } from "@/utils/mixin";

export default {
  props: {
    showId: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      default: Object,
    },
  },
  mixins: [mixin],

  data() {
    return {
      domin: getToken(DominKey),
    };
  },
};
</script>

<style lang="scss" scoped>
.content-box {
  display: inline-block;
  margin-left: 2px;
  text-align: left;
  width: 75%;
}
.content-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
