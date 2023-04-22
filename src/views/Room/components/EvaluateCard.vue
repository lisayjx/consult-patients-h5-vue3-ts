<script setup lang="ts">
import { evaluateConsultOrder } from '@/api/consult'
import type { ConsultOrderItem } from '@/types/consult'
import type { EvaluateDoc } from '@/types/room'
import { showToast } from 'vant'
import { inject, ref, type Ref } from 'vue'

defineProps<{
  evaluateDoc?: EvaluateDoc
}>()
// 爷爷传来的 consult和 方法completeEva
const consult = inject<Ref<ConsultOrderItem>>('consult')
const completeEva = inject<(score: number) => void>('completeEva') // 方法类型(score: number) => void
// 收集评价需要提交数据
// 表单需要得数据:score content anonymousFlag
//  consult.id订单ID consult.docInfo.id医生ID 这三个在index爷爷里
const score = ref(0)
const content = ref('')
const anonymousFlag = ref(false)
const submit = async () => {
  if (score.value === 0) return showToast('请评分')
  if (content.value.length === 0) return showToast('请输入评价内容')
  // 提交评价
  if (!consult) return showToast('未找到订单')
  if (consult.value.docInfo?.id) {
    await evaluateConsultOrder({
      docId: consult?.value.docInfo?.id,
      orderId: consult?.value.id,
      score: score.value,
      content: content.value,
      anonymousFlag: anonymousFlag.value ? 1 : 0
    })
    // 评价成功后，用index传来的函数去修改consult里的list的内容和评价状态
    // 改完之后evaluateDoc里面有值了就会显示已评价的卡片，如果没有值就显示未评价的卡片
    completeEva && completeEva(score.value)
  }
}
</script>
<!-- 
1.把 未评价 和 已评价 的卡片封装在一个组件
2.渲染组件的时候，把消息中的评价信息，传入组件
3.根据是否有评价内容，展示对应的卡片
3.1.有数据，展示
3.2.无数据，绑定表单数据，收集表单数据，提交评价
3.3.评价成功，修改评价消息状态和数据，切换卡片展示 -->

<!-- 得医生那边结束问诊了 才会有卡片出来 -->

<template>
  <!-- 评价完了 -->
  <div class="evaluate-card" v-if="evaluateDoc">
    <p class="title">医生服务评价</p>
    <p class="desc">我们会更加努力提升服务质量</p>
    <van-rate
      :modelValue="evaluateDoc?.score"
      size="7vw"
      gutter="3vw"
      color="#FADB14"
      void-icon="star"
      void-color="rgba(0,0,0,0.04)"
    />
  </div>
  <!-- 未评价时 展示表单-->
  <div class="evaluate-card" v-else>
    <p class="title">感谢您的评价</p>
    <p class="desc">本次在线问诊服务您还满意吗？</p>
    <van-rate
      v-model="score"
      size="7vw"
      gutter="3vw"
      color="#FADB14"
      void-icon="star"
      void-color="rgba(0,0,0,0.04)"
    />
    <van-field
      v-model.trim="content"
      type="textarea"
      maxlength="150"
      show-word-limit
      rows="3"
      placeholder="请描述您对医生的评价或是在医生看诊过程中遇到的问题"
    ></van-field>
    <div class="footer">
      <!-- 只能绑定布尔值 -->
      <van-checkbox v-model="anonymousFlag">匿名评价</van-checkbox>
      <van-button
        :class="{ disabled: score === 0 || !content }"
        @click="submit"
        type="primary"
        size="small"
        round
      >
        提交评价
      </van-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.evaluate-card {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  padding: 15px;
  .title {
    font-size: 15px;
    margin-bottom: 5px;
  }
  .desc {
    font-size: 12px;
    margin-bottom: 15px;
    color: var(--cp-tip);
  }
  .van-field {
    background-color: var(--cp-bg);
    margin: 15px 0;
    border-radius: 8px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    :deep() {
      .van-checkbox {
        .van-icon {
          font-size: 12px;
        }
        &__label {
          font-size: 12px;
          color: var(--cp-tip);
        }
        height: 16px;
      }
      .van-button {
        padding: 0 16px;
        &.disabled {
          opacity: 1;
          background: #fafafa;
          color: #d9dbde;
          border: #fafafa;
        }
      }
    }
  }
}
</style>
