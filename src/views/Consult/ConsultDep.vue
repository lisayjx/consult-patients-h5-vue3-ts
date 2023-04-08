<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAllDep } from '@/api/consult'
import type { TopDep } from '@/types/consult'
import { useConsultStore } from '@/stores'
// 当前选中的sidebar-item索引
const active = ref(0)
// 一级科室
const allDep = ref<TopDep[]>([])
onMounted(async () => {
  const res = await getAllDep()
  allDep.value = res.data
})
// 二级科室
const store = useConsultStore()
const subDep = computed(() => allDep.value[active.value]?.child)
</script>

<template>
  <div class="consult-dep-page">
    <!-- 头部导航 -->
    <cp-nav-bar title="选择科室" />
    <!-- 容器 -->
    <div class="wrapper">
      <!-- 侧边栏组件 -->
      <van-sidebar v-model="active">
        <van-sidebar-item
          :title="top.name"
          v-for="top in allDep"
          :key="top.id"
        />
      </van-sidebar>
      <!-- 二级科室列表 -->
      <div class="sub-dep">
        <router-link
          @click="store.setDep(sub.id)"
          to="/consult/illness"
          v-for="sub in subDep"
          :key="sub.id"
        >
          <div class="sub-dep-item">
            <van-image
              width="60px"
              height="60px"
              fit="cover"
              :src="sub.avatar"
            />
            {{ sub.name }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.van-sidebar {
  width: 114px;
  &-item {
    padding: 14px;
    color: var(--cp-tag);
    &--select {
      color: var(--cp-main);
      font-weight: normal;
      &::before {
        display: none;
      }
    }
  }
}
.consult-dep-page {
  padding-top: 46px;
  .wrapper {
    height: calc(100vh - 46px);
    overflow: hidden;
    display: flex;
    .sub-dep {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      > a {
        display: block;
        padding: 0px 20px;
        color: var(--cp-dark);

        .sub-dep-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;

          .van-image {
            margin-right: 5px;
          }
        }
      }
    }
  }
}
</style>
