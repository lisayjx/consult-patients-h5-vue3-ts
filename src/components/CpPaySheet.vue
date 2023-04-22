<script setup lang="ts">
import { getConsultOrderPayUrl } from '@/api/consult'
import { showLoadingToast, showToast } from 'vant'
import { ref } from 'vue'

// 1.组件需要实现哪些功能？
//   展示微信支付和支付宝支付，可以选择
//   展示支付金额，传入订单ID用于生成订单支付链接
//   打开/关闭抽屉
//   关闭后的业务可自定义
// 2.需要暴露哪些 props 参数？
//   orderId actualPayment onClose show
// 3.需要提供哪些 emits 事件？
//   update:show

const props = defineProps<{
  actualPayment: number // 支付金额
  show: boolean //支付抽屉关闭和隐藏
  onCancel?: () => void // 关闭前要做什么,如果传来了关闭前就调用这函数
  orderId?: string
  payCallback: string
}>()
const emit = defineEmits<{
  (e: 'update:show', show: boolean): void
}>()
// 支付方式
const paymentMethod = ref<0 | 1>()

// 支付
// 点击立即支付
const gotoPay = async () => {
  // 调用接口,获取后端传来的支付地址
  // 写undefined是因为微信支付是0,如果写成!paymentMethod.value有可能 也符合
  if (paymentMethod.value === undefined) return showToast('请选择支付方式')
  if (props.orderId) {
    showLoadingToast('支付中..')
    //  自测时，传值：http://localhost:端口号/+回调页面，
    // vue版本测试环境，传值：http://测试环境域名/+回调页面，
    // 用于决定付款成功后，回调地址是本地还是测试环境地址
    const res = await getConsultOrderPayUrl({
      paymentMethod: paymentMethod.value,
      orderId: props.orderId,
      // payCallback: 'http://localhost:5173' + props.payCallback
      payCallback: import.meta.env.VITE_APP_CALLBACK + props.payCallback
      // ConsultDetail和ConsultPay页面 props.payCallback是/room
      // OrderPay页面props.payCallback是/order/pay/result
    })
    // 请求接口成功后,后端给我们一个支付地址,不是我们自己的路由页面,所以用window.location.href
    window.location.href = res.data.payUrl
    // 买家账号：jfjbwb4477@sandbox.com
    // 登录密码：111111
    // 支付密码：111111
  }
}
</script>

<template>
  <div>
    <!-- 支付抽屉 动作面板 -->
    <!-- checked是复选框的选中效果，true就是选中，他并不和数据挂钩，想和数据挂钩需要用v-model=''-->
    <!-- 这里之所以能切换数据 是因为 paymentMethod = 1 -->
    <!--  :close-on-click-overlay="false"是否在点击遮罩层 时关闭 -->
    <!--   @click-overlay点击遮罩层做的事情 -->
    <!--  :closeable="false"不显示× -->
    <!-- :before-close关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise -->
    <!--  :close-on-popstate="false"历史回退时候不让抽屉关 -->
    <van-action-sheet
      :close-on-popstate="false"
      :closeable="false"
      :before-close="onCancel"
      :show="show"
      @update:show="emit('update:show', $event)"
      title="选择支付方式"
    >
      <div class="pay-type">
        <p class="amount">￥{{ actualPayment.toFixed(2) }}</p>
        <van-cell-group>
          <van-cell title="微信支付" @click="paymentMethod = 0">
            <template #icon><cp-icon name="consult-wechat" /></template>
            <template #extra
              ><van-checkbox
                :checked="paymentMethod === 0"
                @click="paymentMethod = 0"
            /></template>
          </van-cell>
          <van-cell title="支付宝支付" @click="paymentMethod = 1">
            <template #icon><cp-icon name="consult-alipay" /></template>
            <template #extra
              ><van-checkbox
                :checked="paymentMethod === 1"
                @click="paymentMethod = 1"
            /></template>
          </van-cell>
        </van-cell-group>
        <div class="btn">
          <van-button @click="gotoPay" type="primary" round block
            >立即支付</van-button
          >
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>
<style lang="scss" scoped>
.consult-pay-page {
  padding: 46px 0 50px 0;
}

.pay-info {
  display: flex;
  padding: 15px;
  flex-wrap: wrap;
  align-items: center;

  .tit {
    width: 100%;
    font-size: 16px;
    margin-bottom: 10px;
  }

  .img {
    margin-right: 10px;
    width: 38px;
    height: 38px;
    border-radius: 4px;
    overflow: hidden;
  }

  .desc {
    flex: 1;

    > span {
      display: block;
      color: var(--cp-tag);

      &:first-child {
        font-size: 16px;
        color: var(--cp-text2);
      }
    }
  }
}

.pay-price {
  ::v-deep() {
    .vam-cell__title {
      font-size: 16px;
    }

    .van-cell__value {
      font-size: 16px;
      color: var(--cp-price);
    }
  }
}

.pay-space {
  height: 12px;
  background-color: var(--cp-bg);
}

.pay-schema {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;

  .text {
    color: var(--cp-primary);
  }
}

::v-deep() {
  .van-submit-bar__button {
    font-weight: normal;
    width: 160px;
  }
}

.pay-type {
  .amount {
    padding: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }

  .btn {
    padding: 15px;
  }

  .van-cell {
    align-items: center;

    .cp-icon {
      margin-right: 10px;
      font-size: 18px;
    }

    .van-checkbox :deep(.van-checkbox__icon) {
      font-size: 16px;
    }
  }
}
</style>
