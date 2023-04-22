<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { AddressItem, OrderPre } from '@/types/order'
import OrderMedical from './components/OrderMedical.vue'
import {
  getMedicalOrderPre,
  getAddressList,
  createMedicalOrder
} from '@/api/order'
import { showToast } from 'vant'
// 处方状态不同此按钮操作不同：
//     如果处方失效：提示即可
//     如果没付款且有订单ID，代表已经生成订单没付款：去订单详情付款
//     如果没付款且没订单ID：去预支付页面
const route = useRoute()
// 预支付信息
const orderPre = ref<OrderPre>()
const loadOrderPre = async () => {
  const res = await getMedicalOrderPre({
    prescriptionId: route.query.id as string
  })
  orderPre.value = res.data
}
// 收货地址
const address = ref<AddressItem>()
const loadAddress = async () => {
  const { data: addressList } = await getAddressList()
  if (addressList.length) {
    // 遍历地址列表，找到默认地址 isDefault 1是
    const defaultAddress = addressList.find((item) => item.isDefault === 1)
    if (defaultAddress) {
      //如果是默认地址 就把他赋值给 收货地址
      address.value = defaultAddress
    } else {
      // 如果不是默认地址就把第一项赋值给 收货地址
      address.value = addressList[0]
    }
  }
}
onMounted(() => {
  loadOrderPre()
  loadAddress()
})
// 同意协议
const agree = ref(false)
const shakeX = ref(false) //控制 勾选协议是否加抖动动画
// 立即支付
const orderId = ref<string>()
const loading = ref(false)
const show = ref(false) // 控制抽屉和弹窗
const gotoPay = async () => {
  if (!agree.value) {
    shakeX.value = false //去除动画样式 为了每次都新加上动画
    // showToast('请勾选我已同意')
    setTimeout(() => {
      shakeX.value = true
    }, 0)
    return
  }
  if (!address.value?.id) return showToast('请选择收货地址')
  if (!orderPre.value?.id) return showToast('未找到处方')
  // 如果没有生成订单ID

  if (!orderId.value) {
    try {
      loading.value = true

      // 生成订单
      const res = await createMedicalOrder({
        id: orderPre.value?.id,
        addressId: address.value?.id,
        couponId: orderPre.value.couponId
      })
      orderId.value = res.data.id
      loading.value = false
      // 打开支付抽屉

      show.value = true
    } catch (error) {
      loading.value = false
    }
  }
}
</script>

<template>
  <div class="order-pay-page" v-if="orderPre && address">
    <cp-nav-bar title="药品支付" />
    <div class="order-address">
      <p class="area">
        <van-icon name="location" />
        <span>{{ address.province + address.city + address.county }}</span>
      </p>
      <p class="detail">{{ address.addressDetail }}</p>
      <p>
        {{ address.receiver }}
        {{ address.mobile.replace(/^(\d{3})\d+(\d{4})$/, '\$1****\$2') }}
      </p>
    </div>

    <!-- 药品列表 -->
    <order-medical :medicines="orderPre.medicines"></order-medical>

    <div class="order-detail">
      <van-cell-group>
        <van-cell title="药品金额" :value="`￥${orderPre.payment}`" />
        <van-cell title="运费" :value="`￥${orderPre.expressFee}`" />
        <van-cell title="优惠券" :value="`-￥${orderPre.couponDeduction}`" />
        <van-cell
          title="实付款"
          :value="`￥${orderPre.actualPayment}`"
          class="price"
        />
      </van-cell-group>
    </div>
    <div class="order-tip">
      <p class="tip">
        由于药品的特殊性，如非错发、漏发药品的情况，药品一经发出
        不得退换，请核对药品信息无误后下单。
      </p>
      <van-checkbox
        v-model="agree"
        class="animate__animated"
        :class="{ animate__shakeX: shakeX }"
        >我已同意<a href="javascript:;">支付协议</a></van-checkbox
      >
    </div>
    <van-submit-bar
      :price="orderPre.actualPayment * 100"
      button-text="立即支付"
      button-type="primary"
      text-align="left"
      @submit="gotoPay"
      :loading="loading"
    ></van-submit-bar>
    <!-- 支付抽屉 -->
    <cp-pay-sheet
      v-model:show="show"
      :orderId="orderId"
      :actualPayment="orderPre.actualPayment"
      payCallback="/order/pay/result"
    />
  </div>
  <!-- 骨架屏 -->
  <div class="order-pay-page" v-else>
    <cp-nav-bar title="药品支付" />
    <van-skeleton title avatar row="2" style="margin-top: 15px" />
    <van-skeleton title row="4" style="margin-top: 50px" />
    <van-skeleton title row="4" style="margin-top: 50px" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.van-nav-bar) {
  background-color: var(--cp-primary);
  .van-nav-bar__arrow,
  .van-nav-bar__title {
    color: #fff;
  }
}
:deep(.van-cell) {
  .van-cell__title {
    font-size: 16px;
  }
  .van-cell__value {
    font-size: 16px;
  }
  &.price {
    .van-cell__value {
      font-size: 18px;
      color: var(--cp-price);
    }
  }
}
:deep(.van-submit-bar) {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  .van-button {
    width: 200px;
  }
}
.order-pay-page {
  padding: 46px 0 65px;
}
.order-address {
  padding: 15px 15px 0 15px;
  background-color: #fff;
  font-size: 13px;
  .area {
    color: var(--cp-tag);
    margin-bottom: 5px;
    .van-icon-location {
      color: #ff7702;
      font-size: 14px;
    }
  }
  .detail {
    font-size: 17px;
    margin-bottom: 5px;
  }
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
    margin: 0 -15px;
    margin-top: 15px;
  }
}

.order-medical {
  background-color: #fff;
  padding: 0 15px;
  .head {
    display: flex;
    height: 54px;
    align-items: center;
    > h3 {
      font-size: 16px;
      font-weight: normal;
    }
    > small {
      font-size: 13px;
      color: var(--cp-tag);
      margin-left: 10px;
    }
  }
  .item {
    display: flex;
    flex-wrap: wrap;
    padding: 15px 0;
    .img {
      width: 80px;
      height: 70px;
      border-radius: 2px;
      overflow: hidden;
    }
    .info {
      padding-left: 15px;
      width: 250px;
      .name {
        display: flex;
        font-size: 15px;
        margin-bottom: 5px;
        > span:first-child {
          width: 200px;
        }
        > span:last-child {
          width: 50px;
          text-align: right;
        }
      }
      .size {
        margin-bottom: 5px;
        .van-tag {
          background-color: var(--cp-primary);
          vertical-align: middle;
        }
        span:not(.van-tag) {
          margin-left: 10px;
          color: var(--cp-tag);
          vertical-align: middle;
        }
      }
      .price {
        font-size: 16px;
        color: #eb5757;
      }
    }
    .desc {
      width: 100%;
      background-color: var(--cp-bg);
      border-radius: 4px;
      margin-top: 10px;
      padding: 4px 10px;
      color: var(--cp-tip);
    }
  }
}
.order-tip {
  padding: 0 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  .tip {
    font-size: 12px;
    color: var(--cp-tag);
    width: 100%;
    &::before {
      content: '*';
      color: var(--cp-price);
      font-size: 14px;
    }
    margin-bottom: 40px;
  }
  .van-checkbox {
    a {
      color: var(--cp-primary);
    }
  }
}
</style>
