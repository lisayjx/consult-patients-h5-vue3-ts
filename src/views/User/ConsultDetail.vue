<script setup lang="ts">
import { getConsultOrderDetail } from '@/api/consult'
import { IllnessTime, OrderType } from '@/enums'
import type { ConsultOrderItem } from '@/types/consult'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core' //复制功能
import { showToast } from 'vant'
import { useCancelOrder } from '@/composable/index'
import { useDelOrder } from '@/composable/index'
import { showPrescription } from '@/composable/index'
import { flagOptions, timeOptions } from '@/api/constants'
// 格式化 患病时长和是否就诊
// 把获取患病时间 格式化成文字 (原本是1/2/3..)
const formTimeOptions = (time?: IllnessTime) => {
  return timeOptions.find((item) => item.value === time)?.label
}
// 获取是否就诊 consultFlag :0|1
const formConsultFlagText = (flag?: 0 | 1) => {
  return flagOptions.find((item) => item.value === flag)?.label
}

// 取消订单
const { loading, cancelConsultOrder } = useCancelOrder()

// 订单详情
const item = ref<ConsultOrderItem | undefined>()
const route = useRoute()
onMounted(async () => {
  // 动态路由传参用params
  const res = await getConsultOrderDetail(route.params.id as string)
  item.value = res.data
})

// 删除订单
const router = useRouter()

const { delLoading, deleteConsultOrder } = useDelOrder(() => {
  router.push('/user/consult')
})
// 查看处方

// import { useConsultStore, useUserStore } from '@/stores'

// 复制订单
// 1. copy(需要拷贝的内容)
// 2. copied 是否拷贝成功，默认1.5s恢复状态
// 3. isSupported 浏览器是否支持，需要授权读取粘贴板和写入粘贴板权限
const { copy, isSupported } = useClipboard()
const onCopy = async () => {
  if (!isSupported.value) return showToast('浏览器不支持')
  await copy(item.value?.orderNo || '')
  showToast('复制成功')
}
const show = ref(false)
</script>

<template>
  <div class="consult-detail-page" v-if="item">
    <cp-nav-bar title="问诊详情" />
    <div class="detail-head">
      <div class="text">
        <h3>图文问诊 {{ item.payment }} 元</h3>
        <span
          class="sta"
          :class="{
            orange: item.status === OrderType.ConsultPay,
            green: item.status === OrderType.ConsultChat
          }"
          >{{ item.statusValue }}</span
        >
        <p class="tip">服务医生信息</p>
      </div>
      <div class="card">
        <img class="avatar" src="@/assets/avatar-doctor.svg" alt="" />
        <p class="doc">
          <span>极速问诊</span>
          <span>{{ item.docInfo?.name }}</span>
        </p>
        <van-icon name="arrow" />
      </div>
    </div>
    <div class="detail-patient">
      <van-cell-group :border="false">
        <van-cell
          title="患者信息"
          :value="`${item.patientInfo.name} | ${item.patientInfo.genderValue} | ${item.patientInfo.age}岁`"
        />
        <van-cell title="患病时长" :value="formTimeOptions(item.illnessTime)" />
        <van-cell
          title="就诊情况"
          :value="formConsultFlagText(item.consultFlag)"
        />
        <van-cell title="病情描述" :label="item.illnessDesc" />
      </van-cell-group>
    </div>
    <div class="detail-order">
      <h3>订单信息</h3>
      <van-cell-group :border="false">
        <van-cell title="订单编号">
          <template #value>
            <span class="copy" @click="onCopy">复制</span>
            {{ item.orderNo }}
          </template>
        </van-cell>
        <van-cell title="创建时间" :value="item.createTime" />
        <van-cell title="应付款" :value="`￥${item.payment}`" />
        <van-cell title="优惠券" :value="`-￥${item.couponDeduction}`" />
        <van-cell title="积分抵扣" :value="`-￥${item.pointDeduction}`" />
        <van-cell
          title="实付款"
          :value="`￥${item.actualPayment}`"
          class="price"
        />
      </van-cell-group>
    </div>
    <!-- 待支付，倒计时提示 -->
    <div class="detail-time" v-if="item.status === OrderType.ConsultPay">
      请在
      <van-count-down :time="item.countdown * 1000" />
      内完成支付，超时订单将取消
    </div>
    <div class="detail-action van-hairline--top">
      <div class="price">
        <span>需付款</span>
        <span>￥{{ item.actualPayment.toFixed(2) }}</span>
      </div>
      <van-button
        type="default"
        :loading="loading"
        round
        @click="cancelConsultOrder(item)"
        >取消问诊</van-button
      >
      <van-button type="primary" round @click="show = true"
        >继续支付</van-button
      >
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultWait"
    >
      <van-button
        type="default"
        round
        :loading="loading"
        @click="cancelConsultOrder(item)"
        >取消问诊</van-button
      >
      <van-button type="primary" round :to="`/room?orderId=${item.id}`">
        继续沟通
      </van-button>
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultChat"
    >
      <van-button
        type="default"
        round
        v-if="item.prescriptionId"
        @click="showPrescription(item!.prescriptionId)"
      >
        查看处方
      </van-button>
      <van-button type="primary" round :to="`/room?orderId=${item.id}`">
        继续沟通
      </van-button>
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultComplete"
    >
      <!-- 更多 -->
      <cp-consult-more
        @on-preview="showPrescription(item!.prescriptionId)"
        @on-delete="deleteConsultOrder(item)"
      ></cp-consult-more>
      <van-button type="default" round :to="`/room?orderId=${item.id}`">
        问诊记录
      </van-button>
      <van-button type="default" round v-if="item.evaluateId">
        查看评价
      </van-button>
      <van-button type="primary" round v-else> 写评价 </van-button>
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultCancel"
    >
      <van-button
        type="default"
        round
        :loading="delLoading"
        @click="deleteConsultOrder(item)"
        >删除订单</van-button
      >
      <van-button type="primary" round to="/">咨询其他医生</van-button>
    </div>
    <!-- 支付抽屉 -->
    <cp-pay-sheet
      :actualPayment="item?.actualPayment"
      v-model:show="show"
      :orderId="item.id"
      payCallback="/room"
    ></cp-pay-sheet>
  </div>

  <!-- 骨架屏 -->
  <div class="consult-detail-page" v-else>
    <cp-nav-bar title="问诊详情" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
  </div>
</template>

<style lang="scss" scoped>
.consult-detail-page {
  padding: 46px 0 110px 0;
}
.detail-head {
  height: 140px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 135px;
    background: linear-gradient(
      180deg,
      rgba(44, 181, 165, 0),
      rgba(44, 181, 165, 0.2)
    );
    border-bottom-left-radius: 150px 20px;
    border-bottom-right-radius: 150px 20px;
  }
  padding: 15px;
  .text {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 10px 3px;
    .sta {
      color: var(--cp-tag);
      font-weight: 500;
      font-size: 16px;
      &.green {
        color: var(--cp-primary);
      }
      &.orange {
        color: #f2994a;
      }
    }
    .tip {
      width: 100%;
      color: var(--cp-text3);
      margin-top: 5px;
    }
  }
  .card {
    height: 74px;
    background-color: #fff;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 15px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    .avatar {
      width: 38px;
      height: 38px;
    }
    .doc {
      flex: 1;
      padding-left: 15px;
      > span {
        display: block;
        font-size: 16px;
        &:last-child {
          font-size: 13px;
          color: var(--cp-text3);
        }
      }
    }
    .van-icon {
      color: var(--cp-tip);
    }
  }
}
.detail-patient {
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
  }
}
.detail-order {
  > h3 {
    padding: 10px 18px;
    font-weight: normal;
  }
  .copy {
    padding: 2px 10px;
    border: 1px solid var(--cp-primary);
    background-color: var(--cp-plain);
    color: var(--cp-primary);
    font-size: 12px;
    border-radius: 12px;
    margin-right: 10px;
  }
  :deep(.van-cell__title) {
    width: 70px;
    flex: none;
  }
  .price :deep(.van-cell__value) {
    font-size: 16px;
    color: var(--cp-price);
  }
}
.detail-action {
  height: 65px;
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  background-color: #fff;
  justify-content: flex-end;
  padding: 0 15px;
  box-sizing: border-box;
  .price {
    flex: 1;
    > span:last-child {
      font-size: 18px;
      color: var(--cp-price);
      padding-left: 5px;
    }
  }
  .van-button {
    margin-left: 10px;
    padding-left: 17px;
    padding-right: 17px;
  }
  :deep(.van-button--default) {
    background-color: var(--cp-bg);
    color: var(--cp-text3);
  }
}
.van-cell {
  padding-left: 18px;
  padding-right: 18px;
}
.detail-time {
  position: fixed;
  left: 0;
  bottom: 65px;
  width: 100%;
  height: 44px;
  background-color: #fff7eb;
  text-align: center;
  line-height: 44px;
  font-size: 13px;
  color: #f2994a;
  .van-count-down {
    display: inline;
    color: #f2994a;
  }
}
</style>
