<script setup lang="ts">
// 图标组件-封装svg组件,把 svg 标签使用图标封装起来，使用组件完成密码可见切换功能。
// //提供一个props属性，确定使用哪个图标，使用的规则:文件夹名称+图片名称

defineProps<{
  name: string
}>()
</script>

<template>
  <!-- 有些图标可以根据 style 中 color 的值来设置颜色，图标是否有这个功能取决于 UI 做图片时否开启。 -->
  <svg aria-hidden="true" class="cp-icon">
    <use :href="`#icon-${name}`" />
  </svg>
</template>
<style lang="scss" scoped>
.cp-icon {
  // 和字体一样大,与当前元素一样大
  width: 1em;
  height: 1em;
}
</style>
