<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMedicalOrderLogistics } from '@/api/order'
import type { Logistics } from '@/types/order'
import AMapLoader from '@amap/amap-jsapi-loader' //地图
import startImg from '@/assets/start.png'
import endImg from '@/assets/end.png'
import carImg from '@/assets/car.png'
window._AMapSecurityConfig = {
  securityJsCode: '7713f4ba19ee015c27a7a23bd34bf1b8'
}

// 获取物流信息
const logistics = ref<Logistics>()
console.log(logistics.value)

const route = useRoute()
onMounted(async () => {
  const res = await getMedicalOrderLogistics(route.params.id as string)
  logistics.value = res.data
  //   操作map地图元素
  AMapLoader.load({
    key: '639d4746cedd0f218a1ce498f10d9559',
    version: '2.0'
  }).then((AMap) => {
    // 1.使用 Amap 初始化地图
    const map = new AMap.Map('map', {
      mapStyle: 'amap://styles/macaron',
      zoom: 12 //这个越大 地图越大 看的地图详细
    })
    // 2.加载路线规划组件
    AMap.plugin('AMap.Driving', function () {
      // 初始化路线规划对象
      const driving = new AMap.Driving({
        map: map, //在那个地图上规划
        showTraffic: false, //隐藏路途拥堵状态
        hideMarkers: true //隐藏覆盖物 标记点(但是此时起点终点的标记也没有了，需要自己绘制)
      })
      // 使用经纬度数组中的第一个数据：起始坐标
      // 使用经纬度数组中的最后一个数据：终点坐标
      if (logistics.value && logistics.value?.logisticsInfo.length >= 2) {
        const list = [...logistics.value.logisticsInfo]
        // console.log(list, 'list')
        // [
        //   ({ latitude: '30.454012', longitude: '114.42659' },
        //   { latitude: '31.93182', longitude: '118.633415' })
        // ]

        // 起点
        const start = list.shift()
        // 绘制起点图标
        var startMarker = new AMap.Marker({
          icon: startImg,
          position: [start?.longitude, start?.latitude]
        })
        map.add(startMarker) // 单独将点标记添加到地图上
        // 终点
        const end = list.pop()
        // 绘制终点图标
        var endMarker = new AMap.Marker({
          icon: endImg,
          position: [end?.longitude, end?.latitude]
        })
        map.add(endMarker) // 单独将点标记添加到地图上
        // 此时list就剩下 路途中经过的经纬度对象
        //四个参数： 起始点，终点，路途中的经纬度，规划好之后的回调函数
        driving.search(
          [start?.longitude, start?.latitude],
          [end?.longitude, end?.latitude],
          { waypoints: list.map((item) => [item.longitude, item.latitude]) },
          function (status: string, result: object) {
            //未出错时候，result就是对应的路线规划完的方案
            // 等路径规划完才能看到途径的位置图标在哪里显示
            // 绘制运输中货车的位置
            var currentMarker = new AMap.Marker({
              icon: carImg,
              position: [
                logistics.value?.currentLocationInfo.longitude,
                logistics.value?.currentLocationInfo.latitude
              ],
              anchor: 'center' //调整货车图片的定位
            })
            map.add(currentMarker)
            // 3s后定位到货车，放大到地图，看的详细你现在运送到哪了
            setTimeout(() => {
              map.setFitView([currentMarker])
              map.setZoom(10) //缩放级别
            }, 3000)
          }
        )
      }
    })
  })
})
</script>

<template>
  <div class="order-logistics-page">
    <div id="map">
      <div class="title">
        <van-icon name="arrow-left" @click="$router.back()" />
        <span>{{ logistics?.statusValue }}</span>
        <van-icon name="service" />
      </div>
      <!-- 地图 -->
      <div id="map"></div>
      <!-- 运输中 -->
      <div class="current">
        <p class="status">
          {{ logistics?.statusValue }} 预计{{ logistics?.estimatedTime }}送达
        </p>
        <p class="predict">
          <span>{{ logistics?.name }}</span>
          <span>{{ logistics?.awbNo }}</span>
        </p>
      </div>
    </div>
    <!-- 物流详情 -->
    <div class="logistics">
      <p class="title">物流详情</p>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in logistics?.list" :key="item.id">
          <p class="status">{{ item.statusValue }}</p>
          <p class="content">{{ item.content }}</p>
          <p class="time">{{ item.createTime }}</p>
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-logistics-page {
  --van-step-icon-size: 18px;
  --van-step-circle-size: 10px;
}
#map {
  height: 450px;
  background-color: var(--cp-bg);
  overflow: hidden;
  position: relative;
  .title {
    background-color: #fff;
    height: 46px;
    width: 355px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    font-size: 16px;
    position: absolute;
    left: 10px;
    top: 10px;
    box-sizing: border-box;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    > span {
      flex: 1;
      text-align: center;
    }
    .van-icon {
      font-size: 18px;
      color: #666;
      &:last-child {
        color: var(--cp-primary);
      }
    }
  }
  .current {
    height: 80px;
    border-radius: 4px;
    background-color: #fff;
    height: 80px;
    width: 355px;
    box-sizing: border-box;
    padding: 15px;
    position: absolute;
    left: 10px;
    bottom: 10px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    .status {
      font-size: 15px;
      line-height: 26px;
    }
    .predict {
      color: var(--cp-tip);
      font-size: 13px;
      margin-top: 5px;
      > span {
        padding-right: 10px;
      }
    }
  }
}
.logistics {
  padding: 0 10px 20px;
  .title {
    font-size: 16px;
    padding: 15px 5px 5px;
  }
  .van-steps {
    :deep(.van-step) {
      &::after {
        display: none;
      }
    }
    .status {
      font-size: 15px;
      color: var(--cp-text3);
      margin-bottom: 4px;
    }
    .content {
      font-size: 13px;
      color: var(--cp-tip);
      margin-bottom: 4px;
    }
    .time {
      font-size: 13px;
      color: var(--cp-tag);
    }
  }
}
</style>
