<script setup lang="ts">
import { getConsultOrderList } from '@/api/consult'
import type { ConsultType } from '@/enums'
import type { ConsultOrderItem, ConsultOrderListParams } from '@/types/consult'
import { ref } from 'vue'
import ConsultItem from './ConsultItem.vue'
// 1.准备好查询参数
// 2.实现加载更多效果
// 3.触发加载更多操作的时候，发请求获取数据
// 4.拿到数据后:不管有没有数据都要结束加载状态
// 4.1有数据，追加列表
// 4.2无数据，完成

const props = defineProps<{
  type: ConsultType
}>()
// 传给后端的数据
const params = ref<ConsultOrderListParams>({
  type: props.type,
  current: 1,
  pageSize: 5
})
const loading = ref(false)
const finished = ref(false)
const list = ref<ConsultOrderItem[]>([]) //列表数据
const handleGetConsultOrderList = async () => {
  const res = await getConsultOrderList(params.value)

  list.value.push(...res.data.rows)
  if (params.value.current < res.data.pageTotal) {
    params.value.current++
  } else {
    finished.value = true
  }
  loading.value = false
}
// 删除订单
const onDelete = (id: string) => {
  list.value = list.value.filter((item) => item.id !== id)
  if (!list.value.length) handleGetConsultOrderList()
}
</script>

<template>
  <div class="consult-list">
    <!-- 订单组件 -->
    <van-list
      :finished="finished"
      @load="handleGetConsultOrderList"
      v-model:loading="loading"
      finished-text="没有更多了"
    >
      <consult-item
        v-for="item in list"
        @on-delete="onDelete"
        :key="item.id"
        :item="item"
      ></consult-item>
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
