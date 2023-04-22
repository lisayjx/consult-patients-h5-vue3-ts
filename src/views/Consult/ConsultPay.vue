<script setup lang="ts">
import { createConsultOrder, getConsultOrderPre } from '@/api/consult'
import { getPatientDetail } from '@/api/user'
import { useConsultStore } from '@/stores'
import type { ConsultOrderPreData, PartialConsult } from '@/types/consult'
import type { Patient } from '@/types/user'
import { showConfirmDialog, showDialog } from 'vant'
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

// 1.获取待支付订单信息
const store = useConsultStore()
const payInfo = ref<ConsultOrderPreData>()
const loadData = async () => {
  const res = await getConsultOrderPre({
    type: store.consult.type,
    illnessType: store.consult.illnessType
  })
  payInfo.value = res.data
  // 存储优惠券信息
  store.setCoupon(res.data.couponId)
}
// 2.获取病人信息
const patient = ref<Patient>()
const loadPatient = async () => {
  if (!store.consult.patientId) return
  const res = await getPatientDetail(store.consult.patientId)
  patient.value = res.data
}
onMounted(() => {
  loadData()
  loadPatient()
})
// 勾选协议
const agree = ref(false)
// 3.点击支付,生成订单
// 支付抽屉
const loading = ref(false)
const show = ref(false)
const shakeX = ref(false) //控制 勾选协议是否加抖动动画
const orderId = ref<string>()
// 支付方式
// const paymentMethod = ref<0 | 1>()
const onSubmit = async () => {
  if (!agree.value) {
    shakeX.value = false //去除动画样式 为了每次都新加上动画
    // showToast('请勾选我已同意')
    setTimeout(() => {
      shakeX.value = true
    }, 100)
    return
  }
  loading.value = true
  // 生成订单(调用接口)
  const res = await createConsultOrder(store.consult)
  orderId.value = res.data.id
  // 打开支付抽屉
  show.value = true
  loading.value = false
  // 前端清空存储的consult一系列信息,因为已经提交给后台了 都生成订单了 后台已经有数据了
  store.clear()
}

// 4.拦截放弃订单
// 1.隐藏抽屉的关闭按钮
// 2.在关闭抽屉的时候，确认框提示，仍要关闭问诊记录继续支付关闭确认框。
// 3.如果已经生成订单了回退的时候拦截
// 4.生成支付地址然后跳转:掉后台的接口
// 5.刷新页面的时候，判断是否问诊记录是否存在，不存在就alert提示，确认之后回到首页. (在onMounted)
const router = useRouter()
// 选择完支付方式后 点击了遮罩层，就会提示
const onCancel = () => {
  // before-close关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise
  return showConfirmDialog({
    title: '关闭支付',
    message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',
    cancelButtonText: '仍要关闭',
    confirmButtonText: '继续支付',
    confirmButtonColor: 'var(--cp-primary)'
  })
    .then(() => {
      // 继续支付 不想关闭抽屉

      // 发起请求（把订单id和支付方式给后端）
      return false //不关闭抽屉
    })
    .catch(() => {
      // 放弃支付
      orderId.value = '' //为了能跳转页面,因为onBeforeRouteLeave设置过只要有订单id就不能跳转
      router.push('/user/consult')
      // 跳转页面-问诊记录-继续支付-关闭确认框
      return true //关闭抽屉
    })
}
// 在离开当前路由前 return false阻止离开此页面
// 浏览器上不能回退，但是点击回退虽然页面不动，但是会闪一下
// 给抽屉加一个 历史回退时候不让抽屉关的函数:close-on-popstate="false"
onBeforeRouteLeave(() => {
  // 如果已经生成了订单，就不能离开此页面
  if (orderId.value) return false
})

// // 点击立即支付(支付抽屉 组件抽取到了 CpPaySheet)
// const gotoPay = async () => {
//   // 调用接口,获取后端传来的支付地址
//   // 写undefined是因为微信支付是0,如果写成!paymentMethod.value有可能 也符合
//   if (paymentMethod.value === undefined) return showToast('请选择支付方式')
//   if (orderId.value) {
//     showLoadingToast('支付中..')
//     //  自测时，传值：http://localhost:端口号/+回调页面，
//     // vue版本测试环境，传值：http://测试环境域名/+回调页面，
//     // 用于决定付款成功后，回调地址是本地还是测试环境地址
//     const res = await getConsultOrderPayUrl({
//       paymentMethod: paymentMethod.value,
//       orderId: orderId.value,
//       payCallback: 'http://localhost:5173/room'
//     })
//     // 请求接口成功后,后端给我们一个支付地址,不是我们自己的路由页面,所以用window.location.href
//     window.location.href = res.data.payUrl
//     // 买家账号：jfjbwb4477@sandbox.com
//     // 登录密码：111111
//     // 支付密码：111111
//   }
// }

// 刷新页面的时候，判断是否问诊记录是否存在，不存在就alert提示，确认之后回到首页
// 如果没有了问诊信息(就是已经生成了订单,本地清空了)
type Key = keyof PartialConsult
onMounted(() => {
  // !store.consult.type || !store.consult.illnessType|| ...这样需要把里面所有的key写出来麻烦
  // Key[]长这样['type', 'illnessType', 'depId', 'illnessDesc', 'illnessTime', 'consultFlag', 'patientId']
  const validKeys: Key[] = [
    'type',
    'illnessType',
    'depId',
    'illnessDesc',
    'illnessTime',
    'consultFlag',
    'patientId'
  ]
  // 只要store的consult里的任何一个key不等于undefined就是有效的
  const valid = validKeys.every((key) => store.consult[key] !== undefined)
  if (!valid) {
    //若是无效
    return showDialog({
      title: '温馨提示',
      message:
        '问诊信息不完整请重新填写，如有未支付的问诊订单可在问诊记录中继续支付！',
      closeOnPopstate: false //回退历史不显示弹窗
    }).then(() => {
      router.push('/home')
    })
  }
})
// 此时 如果到了选择支付方式时候说明已经生成了订单,这时候不支付了 仍要退出支付
// 按理来说应该跳转到订单列表页面,但是此时页面并不会跳转,
// 因为我们在onBeforeRouteLeave设置过如果已经生成了订单,就不能离开此页面
// 所以我们就要在仍要继续退出支付那里把订单id置空 就能跳转页面了
</script>

<template>
  <div class="consult-pay-page" v-if="payInfo && patient">
    <cp-nav-bar title="支付" />
    <div class="pay-info">
      <p class="tit">图文问诊 {{ payInfo.payment }} 元</p>
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p class="desc">
        <span>极速问诊</span>
        <span>自动分配医生</span>
      </p>
    </div>
    <van-cell-group>
      <van-cell title="优惠券" :value="`-¥${payInfo.couponDeduction}`" />
      <van-cell title="积分抵扣" :value="`-¥${payInfo.pointDeduction}`" />
      <van-cell
        title="实付款"
        :value="`¥${payInfo.actualPayment}`"
        class="pay-price"
      />
    </van-cell-group>
    <div class="pay-space"></div>
    <van-cell-group>
      <van-cell
        title="患者信息"
        :value="`${patient.name} | ${patient.genderValue} | ${patient.age}岁`"
      ></van-cell>
      <van-cell title="病情描述" :label="store.consult.illnessDesc"></van-cell>
    </van-cell-group>
    <div
      class="pay-schema animate__animated"
      :class="{ animate__shakeX: shakeX }"
    >
      <van-checkbox v-model="agree"
        >我已同意 <span class="text">支付协议</span></van-checkbox
      >
    </div>
    <!-- price金额（单位分） -->
    <van-submit-bar
      :loading="loading"
      button-type="primary"
      :price="payInfo.actualPayment * 100"
      button-text="立即支付"
      text-align="left"
      @submit="onSubmit"
    />
    <!-- 支付抽屉 组件 -->
    <cp-pay-sheet
      :actualPayment="payInfo.actualPayment"
      v-model:show="show"
      :onCancel="onCancel"
      :orderId="orderId"
      payCallback="/room"
    ></cp-pay-sheet>
  </div>
  <!-- 骨架屏 -->
  <div v-else>
    <van-skeleton avatar title :row="2" style="margin-bottom: 20px" />
    <van-skeleton :row="3" style="margin-bottom: 20px" />
    <van-skeleton :row="4" style="margin-bottom: 20px" />
    <van-skeleton :row="3" style="margin-bottom: 20px" />
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
