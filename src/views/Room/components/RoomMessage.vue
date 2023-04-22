<script setup lang="ts">
import type { Message, Prescription } from '@/types/room'
import { PrescriptionStatus, type IllnessTime } from '@/enums/index' //枚举当作类型用
import { MsgType } from '@/enums/index' //枚举当作值用
import { showImagePreview, showToast } from 'vant'
import dayjs from 'dayjs'
import EvaluateCard from './EvaluateCard.vue'
import { timeOptions, flagOptions } from '@/api/constants'
import type { Image } from '@/types/consult'
import { useUserStore } from '@/stores/index'
// 点击原始处方,查看处方图片
import { showPrescription } from '@/composable/index'
import { useRouter } from 'vue-router'
// 接收聊天消息
const props = defineProps<{
  list: Message[]
}>()
console.log(props.list)

// // 患病时间
// const timeOptions = [
//   { label: '一周内', value: IllnessTime.Week },
//   { label: '一月内', value: IllnessTime.Month },
//   { label: '半年内', value: IllnessTime.HalfYear },
//   { label: '大于半年', value: IllnessTime.More }
// ]
// // 是否就诊过
// const flagOptions = [
//   { label: '就诊过', value: 0 },
//   { label: '没就诊过', value: 1 }
// ]
//初始化时候服务器给我们的聊天记录-----------------

// import { getPrescriptionPic } from '@/api/consult'

// 把获取患病时间 格式化成文字 (原本是1/2/3..)
const formTimeOptions = (time?: IllnessTime) => {
  return timeOptions.find((item: any) => item.value === time)?.label
}
// 获取是否就诊 consultFlag :0|1
const formConsultFlagText = (flag?: 0 | 1) => {
  return flagOptions.find((item: any) => item.value === flag)?.label
}
// 点击病情描述里得查看图片
const previewImg = (pictures?: Image[]) => {
  if (pictures && pictures.length) {
    // showImagePreview方法是vant里的,showImagePreview(['https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg']);
    showImagePreview(pictures.map((item) => item.url))
  }
}
const store = useUserStore()
// 格式化每个消息上面的时间
const formatMessageTime = (time: string) => {
  return dayjs(time).format('HH:mm')
}
// 点击查看聊天记录里得图片
const previewPicture = (url?: string) => {
  console.log(url)

  if (url) {
    showImagePreview([url])
  }
}
// 图片发送过来加载成功后
// 加这个函数是因为 发送完图片后有一半被遮挡，是因为图片最开始加载时候没有高度得
// 所以需要图片加载成功后在滚动到最底部
const loadSuccess = (notScroll?: boolean) => {
  //滚页面到底部,如果是接受和发送消息和图片时候滚动到最底部,但是查看聊天记录时候不用
  if (notScroll === true) return
  window.scrollTo(0, document.body.scrollHeight)
}

// const showPrescription = async (id?: string) => {
//   if (id) {
//     const res = await getPrescriptionPic(id)
//     // 预览图片
//     showImagePreview([res.data.url])
//   }
// }
// 点击购买药品
const router = useRouter()
const buy = (prescription: Prescription | undefined) => {
  if (prescription?.status === PrescriptionStatus.Invalid)
    return showToast('处方已经失效')
  if (
    prescription?.status === PrescriptionStatus.NotPayment &&
    !prescription.orderId
  )
    return router.push(`/order/pay?id=${prescription.id}`)
}
</script>

<template>
  <template
    v-for="{
      msgType,
      id,
      msg,
      from,
      createTime,
      fromAvatar,
      notScroll
    } in list"
    :key="id"
  >
    <!-- 患者卡片 如果消息类型=患者信息-->
    <!-- MsgType.CardPat是枚举 代替了数字21 更语义化 -->
    <div class="msg msg-illness" v-if="msgType === MsgType.CardPat">
      <div class="patient van-hairline--bottom">
        <p>
          {{ msg.consultRecord?.patientInfo.name }}
          {{ msg.consultRecord?.patientInfo.genderValue }}
          {{ msg.consultRecord?.patientInfo.age }}
        </p>
        <p>
          {{ formTimeOptions(msg.consultRecord?.illnessTime) }} |
          {{ formConsultFlagText(msg.consultRecord?.consultFlag) }}
        </p>
      </div>
      <van-row>
        <van-col span="6">病情描述</van-col>
        <van-col span="18">{{ msg.consultRecord?.illnessDesc }}</van-col>
        <van-col span="6">图片</van-col>
        <van-col span="18" @click="previewImg(msg.consultRecord?.pictures)"
          >点击查看</van-col
        >
      </van-row>
    </div>
    <!-- 通知-通用 -->
    <!-- 时间和 医护人员正在赶来 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.Notify">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 通知-温馨提示 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.NotifyTip">
      <div class="content">
        <span class="green">温馨提示：</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>

    <!--聊天: 发送文字(咱们自己) 
    from===store.user.id  from里就是发送信息时候传的自己的id
    -->
    <div
      class="msg msg-to"
      v-if="msgType === MsgType.MsgText && store.user?.id === from"
    >
      <div class="content">
        <div class="time">{{ formatMessageTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
      <van-image :src="store.user?.avatar" />
    </div>

    <!--聊天: 发送图片 -->
    <div
      class="msg msg-to"
      v-if="msgType === MsgType.MsgImage && store.user?.id === from"
    >
      <div class="content">
        <div class="time">{{ formatMessageTime(createTime) }}</div>
        <!--  @load《van-image》里得事件，图片加载完毕后触发 -->
        <van-image
          @load="loadSuccess(notScroll)"
          @click="previewPicture(msg.picture?.url)"
          fit="contain"
          :src="msg.picture?.url"
        />
      </div>
      <van-image :src="store.user?.avatar" />
    </div>
    <!-- 聊天:接收文字 -->
    <div
      class="msg msg-from"
      v-if="msgType === MsgType.MsgText && store.user?.id !== from"
    >
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatMessageTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
    </div>
    <!--聊天: 接收图片 -->
    <div
      class="msg msg-from"
      v-if="msgType === MsgType.MsgImage && store.user?.id !== from"
    >
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatMessageTime(createTime) }}</div>
        <van-image
          @load="loadSuccess(notScroll)"
          @click="previewPicture(msg.picture?.url)"
          fit="contain"
          :src="msg.picture?.url"
        />
      </div>
    </div>
    <!-- 处方卡片 -->
    <div class="msg msg-recipe" v-if="msgType === MsgType.CardPre">
      <div class="content">
        <div class="head van-hairline--bottom">
          <div class="head-tit">
            <h3>电子处方</h3>
            <p @click="showPrescription(msg.prescription?.id)">
              原始处方 <van-icon name="arrow"></van-icon>
            </p>
          </div>
          <p>
            {{ msg.prescription?.name }} {{ msg.prescription?.genderValue }}
            {{ msg.prescription?.age }}岁 {{ msg.prescription?.diagnosis }}
          </p>
          <p>开方时间：{{ msg.prescription?.createTime }}</p>
        </div>
        <div class="body">
          <div
            class="body-item"
            v-for="med in msg.prescription?.medicines"
            :key="med.id"
          >
            <div class="durg">
              <p>{{ med.name }} {{ med.specs }}</p>
              <p>{{ med.usageDosag }}</p>
            </div>
            <div class="num">x{{ med.quantity }}</div>
          </div>
        </div>
        <div class="foot">
          <span @click="buy(msg.prescription)">购买药品</span>
        </div>
      </div>
    </div>
    <!-- 医生评价 组件 -->
    <div
      class="msg msg-comment"
      v-if="msgType === MsgType.CardEva || msgType === MsgType.CardEvaForm"
    >
      <evaluate-card :evaluateDoc="msg.evaluateDoc" />
    </div>
    <!-- 通知-结束 订单取消-->
    <div
      class="msg msg-tip msg-tip-cancel"
      v-if="msgType === MsgType.NotifyCancel"
    >
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
  </template>
</template>

<style lang="scss" scoped>
@import '@/style/room.scss';
</style>
