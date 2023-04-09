<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { Message, TimeMessages } from '@/types/room'
import { onMounted, onUnmounted, ref } from 'vue'
import { baseURL } from '@/utils/request'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import { MsgType } from '@/enums'
// 一.问诊室-建立连接#
// 1.安装 socket.io-client 包 pnpm add socket.io-client
// 2.在组件挂载完毕，进行socket连接
// 3.监听连接成功，监听错误消息，监听关闭连接
// 4.组件卸载关闭连接
const store = useUserStore()
const route = useRoute()
let socket: Socket
const list = ref<Message[]>([])
onUnmounted(() => {
  // 关闭连接
  socket.close()
})
onMounted(() => {
  // 建立连接，创建 socket.io 实例
  socket = io(baseURL, {
    //baseURL在request里导进来的
    //里面类似请求头,需要唯一标识orderId来区分问诊室
    //身份认证
    auth: {
      token: `Bearer ${store.user?.token}`
    },
    query: {
      orderId: route.query.orderId //从地址栏取出来的
    }
  })
  // 建立连接 connect 固定
  socket.on('connect', () => {
    // 建立连接成功
    console.log('connect')
  })
  // 发生错误 error 固定
  socket.on('error', (event) => {
    // 错误异常消息
    console.log('error')
  })
  // 断开连接 disconnect 固定
  socket.on('disconnect', () => {
    // 已经断开连接
    console.log('disconnect')
  })

  // 二.问诊室-默认消息#(把消息传给room-message组件)
  // 1.监听默认聊天记录，给我们的数据是消息分组形式TimeMessages我们需要处理成可用的消息列表Message[]
  //    并且返回给我们三条信息,还差一条时间信息 我们自己写成通用消息
  // 2.提取常量数据
  // 3.设置响应式数据,接收数据,进行渲染
  // 4.预览病情图片

  // 类型res:{code:xxx,data:xxx,message:xxx}本来是要这么写的,但是只用data所以 只写了一个
  // 把res解构
  socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
    // 处理消息:分组的时间自己组织成一条通用消息，items(三条消息)取出来放后面
    // 设置一个arr,里面存放3条消息和1个时间通用消息
    const arr: Message[] = []
    data.forEach((item) => {
      arr.push({
        // 通用消息的格式,这个时间就是内容
        id: item.createTime,
        msgType: MsgType.Notify,
        createTime: item.createTime,
        msg: {
          content: item.createTime
        }
      })
      arr.push(...item.items)
    })
    list.value.unshift(...arr) //聊天记录往上拉着看的 往上面加的
  })
})
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <room-status></room-status>
    <room-message :list="list"></room-message>
    <room-action></room-action>
  </div>
</template>

<style lang="scss" scoped>
.room-page {
  padding-top: 90px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);
  .van-pull-refresh {
    width: 100%;
    min-height: calc(100vh - 150px);
  }
}
</style>
