<script lang="ts" setup>
// import { followOrUnfollow } from '@/api/consult'
import type { Doctor } from '@/types/consult'
// import { ref } from 'vue'
import { useFollow } from '@/composable'

defineProps<{ item: Doctor }>()

// 点击 关注/取关
// 后台会根据你现在的关注状态 取反 所以咱们只要发起请求就可以
// const loading = ref(false)
// const follow = async (item: Doctor) => {
//   loading.value = true //按钮上提供了一个loading属性
//   try {
//     await followOrUnfollow(item.id, 'doc')
//     // 更改 关注状态
//     item.likeFlag = item.likeFlag === 1 ? 0 : 1
//   } finally {
//     // 不管成功失败都结束loading
//     loading.value = false
//   }
// }
// 关注/取关 逻辑可以 复用 所以封装在了 composable文件里
const { loading, follow } = useFollow('doc')
</script>
<template>
  <div class="doctor-card">
    <van-image round :src="item.avatar" />
    <p class="name">{{ item.name }}</p>
    <p class="van-ellipsis">{{ item.hospitalName }} {{ item.depName }}</p>
    <p>{{ item.positionalTitles }}</p>
    <van-button
      :loading="loading"
      @click="follow(item)"
      round
      size="small"
      type="primary"
    >
      {{ item.likeFlag === 1 ? '已关注' : '+ 关注' }}
    </van-button>
  </div>
</template>
<style scoped lang="scss">
.doctor-card {
  width: 135px;
  height: 190px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 11px 0px rgba(229, 229, 229, 0.2);
  text-align: center;
  padding: 15px;
  margin-left: 15px;
  display: inline-block;
  box-sizing: border-box;
  > .van-image {
    width: 58px;
    height: 58px;
    vertical-align: top;
    border-radius: 50%;
    margin: 0 auto 8px;
  }
  > p {
    margin-bottom: 0;
    font-size: 11px;
    color: var(--cp-tip);
    &.name {
      font-size: 13px;
      color: var(--cp-text1);
      margin-bottom: 5px;
    }
  }
  > .van-button {
    padding: 0 12px;
    height: 28px;
    margin-top: 8px;
    width: 72px;
  }
}
</style>
