<script setup lang="ts">
import type { ConsultOrderItem } from '@/types/consult'
import { OrderType } from '@/enums'
import { showPrescription } from '@/composable/index'
// 取消订单
import { useCancelOrder } from '@/composable/index'
// 删除订单
import { useDelOrder } from '@/composable/index'
const { loading, cancelConsultOrder } = useCancelOrder()
// import { ref } from 'vue'
// import { showFailToast, showSuccessToast } from 'vant'
// import { deleteOrder } from '@/api/consult'

const props = defineProps<{ item: ConsultOrderItem }>()
const emit = defineEmits<{
  (e: 'on-delete', id: string): void
}>()
// 已完成-气泡弹出框
// const showPopover = ref(false)
// // 通过 actions 属性来定义菜单选项
// const actions = computed(() => [
//   { text: '查看处方', disabled: !props.item.prescriptionId },
//   { text: '删除订单' }
// ])

// const onSelect = (action: { text: string }, i: number) => {
//   // 查看处方
//   if (i === 0) {
//     showPrescription(props.item.prescriptionId)
//   }
//   // 删除订单
//   if (i === 1) {
//     deleteConsultOrder(props.item)
//   }
// }

// const loading = ref(false)
// const cancelConsultOrder = async (item: ConsultOrderItem) => {
//   try {
//     loading.value = true
//     await cancelOrder(item.id)
//     item.status = OrderType.ConsultCancel
//     item.statusValue = '已取消'
//     showSuccessToast('取消成功')
//   } catch (error) {
//     showFailToast('取消失败')
//   } finally {
//     loading.value = false
//   }
// }
// 删除订单

const { delLoading, deleteConsultOrder } = useDelOrder(() => {
  emit('on-delete', props.item.id)
})
// const delLoading = ref(false)
// const deleteConsultOrder = async (item: ConsultOrderItem) => {
//   try {
//     delLoading.value = true
//     await deleteOrder(item.id)
//     showSuccessToast('删除成功')
//     emit('on-delete', item.id)
//   } catch (error) {
//     showFailToast('删除失败')
//   } finally {
//     delLoading.value = false
//   }
// }
</script>
<!-- 状态梳理：
待支付：取消问诊+去支付
待接诊：取消问诊+继续沟通
咨询中：查看处方（如果开了）+继续沟通
已完成：更多（查看处方，如果开了，删除订单）+问诊记录+（未评价?写评价:查看评价）
已取消：删除订单+咨询其他医生 -->
<template>
  <div class="consult-item">
    <div class="head van-hairline--bottom">
      <!-- 自定义指令，如果图片加载失败就用默认图片 -->
      <img class="img" v-defaultImage="item.docInfo?.avatar" />
      <p>{{ item.docInfo?.name || '暂未分配医生' }}</p>
      <span
        :class="{
          orange: item.status === OrderType.ConsultPay,
          green: item.status === OrderType.ConsultChat
        }"
        >{{ item.statusValue }}</span
      >
    </div>
    <div class="body" @click="$router.push(`/user/consult/${item.id}`)">
      <div class="body-row">
        <div class="body-label">病情描述</div>
        <div class="body-value">{{ item.illnessDesc }}</div>
      </div>
      <div class="body-row">
        <div class="body-label">价格</div>
        <div class="body-value">¥ {{ item.payment.toFixed(2) }}</div>
      </div>
      <div class="body-row">
        <div class="body-label">创建时间</div>
        <div class="body-value tip">{{ item.createTime }}</div>
      </div>
    </div>
    <!-- 待支付 -->
    <div class="foot" v-if="item.status === OrderType.ConsultPay">
      <van-button
        @click="cancelConsultOrder(item)"
        :loading="loading"
        class="gray"
        plain
        size="small"
        round
        >取消订单</van-button
      >
      <van-button
        type="primary"
        plain
        size="small"
        round
        :to="`/user/consult/${item.id}`"
        >去支付</van-button
      >
    </div>
    <!-- 待接诊 -->
    <div class="foot" v-if="item.status === OrderType.ConsultWait">
      <van-button
        @click="cancelConsultOrder(item)"
        :loading="loading"
        class="gray"
        plain
        size="small"
        round
        >取消订单</van-button
      >
      <van-button
        type="primary"
        plain
        size="small"
        round
        :to="`/room?orderId=${item.id}`"
        >继续沟通</van-button
      >
    </div>
    <!-- 咨询中 -->
    <div class="foot" v-if="item.status === OrderType.ConsultChat">
      <van-button
        v-if="item.prescriptionId"
        class="gray"
        plain
        size="small"
        round
        @click="showPrescription(item.prescriptionId)"
        >查看处方</van-button
      >
      <van-button
        type="primary"
        plain
        size="small"
        round
        :to="`/room?orderId=${item.id}`"
        >继续沟通</van-button
      >
    </div>
    <!-- 已完成 -->
    <div class="foot" v-if="item.status === OrderType.ConsultComplete">
      <!-- 气泡弹出框 查看更多组件 -->
      <cp-consult-more
        :disabled="!item.prescriptionId"
        @on-delete="deleteConsultOrder(item)"
        @on-preview="showPrescription(item.prescriptionId)"
      ></cp-consult-more>
      <van-button
        class="gray"
        plain
        size="small"
        round
        :to="`/room?orderId=${item.id}`"
        >问诊记录</van-button
      >
      <van-button
        v-if="!item.evaluateId"
        type="primary"
        plain
        size="small"
        round
        >写评价</van-button
      >
      <van-button v-else class="gray" type="primary" plain size="small" round
        >查看评价</van-button
      >
    </div>
    <!-- 已取消 -->
    <div class="foot" v-if="item.status === OrderType.ConsultCancel">
      <van-button
        @click="deleteConsultOrder(item)"
        :loading="delLoading"
        class="gray"
        plain
        size="small"
        round
        >删除订单</van-button
      >
      <van-button type="primary" plain size="small" round to="/home"
        >咨询其他医生</van-button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.consult-item {
  border-radius: 4px;
  box-shadow: 0px 0px 22px 0px rgba(245, 245, 245, 0.1);
  background-color: #fff;
  margin-bottom: 10px;
  .head {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 15px;
    .img {
      width: 20px;
      height: 20px;
    }
    > p {
      flex: 1;
      font-size: 15px;
      padding-left: 10px;
    }
    > span {
      color: var(--cp-tag);
      &.orange {
        color: #f2994a;
      }
      &.green {
        color: var(--cp-primary);
      }
    }
  }
  .body {
    padding: 15px 15px 8px 15px;
    .body-row {
      display: flex;
      margin-bottom: 7px;
    }
    .body-label {
      width: 62px;
      font-size: 13px;
      color: var(--cp-tip);
    }
    .body-value {
      width: 250px;
      &.tip {
        color: var(--cp-tip);
      }
    }
  }
  .foot {
    padding: 0 15px 15px 15px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .van-button {
      margin-left: 10px;
      padding: 0 16px;
      &.gray {
        color: var(--cp-text3);
        background-color: var(--cp-bg);
      }
    }
    .more {
      color: var(--cp-tag);
      flex: 1;
      font-size: 13px;
    }
  }
}
</style>
