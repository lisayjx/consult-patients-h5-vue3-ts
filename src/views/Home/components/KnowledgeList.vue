<script setup lang="ts">
import type {
  KnowledgeList,
  KnowledgeParams,
  KnowledgeType
} from '@/types/consult'
import { ref } from 'vue'
import KnowledgeCard from './KnowledgeCard.vue'
import { getKnowledgePage } from '@/api/consult'
const props = defineProps<{
  // 文章类型
  type: KnowledgeType
}>()
// 加载更多
// List 组件通过 loading 和 finished 两个变量控制加载状态，
// 当组件滚动到底部时，会触发 load 事件并将 loading 设置成 true。
// 此时可以发起异步操作并更新数据，数据更新完毕后，将 loading 设置成 false 即可
// 若数据已全部加载完毕，则直接将 finished 设置成 true 即可。
// v-model:loading 数据？控制加载中效果
// :finished 数据？控制全部数据是否加载完成，true就不在触发加载
// 触发加载事件，做什么？发请求，追加数据，判断是否加载完成

const loading = ref(false)
const finished = ref(false)
const list = ref<KnowledgeList>([])
const params = ref<KnowledgeParams>({
  type: props.type,
  current: 1,
  pageSize: 10
})
// 下拉加载更多
const onLoad = async () => {
  //  请求接口
  const res = await getKnowledgePage(params.value)
  list.value.push(...res.data.rows)
  //   如果当前的页数 比请求的数据的总页数大 说明数据请求完了
  if (params.value.current >= res.data.pageTotal) {
    // 结束请求
    finished.value = true
  } else {
    // 继续请求下一页
    params.value.current++
  }
  //   结束加载
  loading.value = false
}
</script>

<template>
  <div class="knowledge-list">
    <!-- 列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <!-- 卡片 -->
      <knowledge-card
        v-for="(item, i) in list"
        :key="i"
        :item="item"
      ></knowledge-card>
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-list {
  padding: 0 15px;
}
</style>
