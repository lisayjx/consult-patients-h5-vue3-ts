<script setup lang="ts">
// 需求
// 1.点击返回，返回上一页（历史记录）
// 2.暴露props，title设置标题，rightText设置右侧文字
// 3.点击右侧文字按钮，要做的事情无法确定，触发自定义事件通知父组件

import { useRouter } from 'vue-router'
// 1.点击返回，返回上一页（历史记录）
const router = useRouter()
const onClickLeft = () => {
  // TODO 点击左侧返回按钮
  //   如果有上一页历史就可以返回，如果没有就跳转到首页
  if (history.state?.back) {
    //判断历史记录中是否有回退
    router.back()
  } else {
    router.push('/')
  }
}
// 2.暴露props，title设置标题，rightText设置右侧文字
defineProps<{
  title?: string
  rightText?: string
}>()

// 3.点击右侧文字按钮，要做的事情无法确定，触发自定义事件通知父组件
const emit = defineEmits<{
  (e: 'click-right'): void
}>()
const onClickRight = () => {
  // TODO 点击右侧文字按钮
  emit('click-right')
}
</script>

<template>
  <!-- fixed固定在顶部 -->
  <van-nav-bar
    fixed
    left-arrow
    :title="title"
    :right-text="rightText"
    @click-left="onClickLeft"
    @click-right="onClickRight"
  ></van-nav-bar>
</template>

<style lang="scss" scoped>
:deep() {
  .van-nav-bar {
    &__arrow {
      font-size: 18px;
      color: var(--cp-text1);
    }
    &__text {
      font-size: 15px;
    }
  }
}
</style>
