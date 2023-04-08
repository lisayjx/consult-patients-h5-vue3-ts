<script setup lang="ts">
// import { onMounted, onUnmounted, ref } from 'vue'
import DoctorCard from './DoctorCard.vue'
import { useWindowSize } from '@vueuse/core'
import type { DoctorList, DoctorPage } from '@/types/consult'
import { onMounted, ref } from 'vue'
import { getDoctorPage } from '@/api/consult'
// 现在主要获取到不同设备的宽度 就可以做不同设备的滚动距离
// 1.原生写法
// const deviceWidth = ref(0) //不同设备宽度
// const setDeviceWidth = () => {
//   // 动态设置不同设备宽度
//   deviceWidth.value = window.innerWidth//视口的宽度
// }
// onMounted(() => {
//   setDeviceWidth()
// 当浏览器窗口调整到新的高度或宽度时,会触发resize事件
//   window.addEventListener('resize', setDeviceWidth)
// })
// onUnmounted(() => {
//   window.removeEventListener('resize', setDeviceWidth)
// })
// 2.工具库 获取不同设备宽度
const { width } = useWindowSize()

// 获取 关注的医生列表
const doctorList = ref<DoctorList>([])
const loadDoctorList = async () => {
  const res = await getDoctorPage({ current: 1, pageSize: 10 })
  doctorList.value = res.data.rows
}
onMounted(() => loadDoctorList())
</script>

<template>
  <div class="follow-doctor">
    <div className="head">
      <p>推荐关注</p>
      <a href="javascript:;"> 查看更多<i class="van-icon van-icon-arrow" /></a>
    </div>
    <div class="body">
      <!-- swipe 组件 -->

      <!-- 去除 指示器，关闭 无缝滚动，设置一次滚动一个卡片不循环播放
        直接设置150 宽度的滚动距离，适配有问题，切换设备试试。
        所以要做适配
        不给宽度默认 一个轮播图里就一个卡片 不行
    -->
      <van-swipe
        :width="(150 / 375) * width"
        :show-indicators="false"
        :loop="false"
      >
        <van-swipe-item v-for="item in doctorList" :key="item.id">
          <doctor-card :item="item" />
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.follow-doctor {
  background-color: var(--cp-bg);
  height: 250px;
  .head {
    display: flex;
    justify-content: space-between;
    height: 45px;
    align-items: center;
    padding: 0 15px;
    font-size: 13px;
    > a {
      color: var(--cp-tip);
    }
  }
  .body {
    width: 100%;
    overflow: hidden;
  }
}
</style>
