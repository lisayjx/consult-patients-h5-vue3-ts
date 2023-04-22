<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { Message, TimeMessages } from '@/types/room'
import { nextTick, onMounted, onUnmounted, provide, ref } from 'vue'
import { baseURL } from '@/utils/request'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import { MsgType, OrderType } from '@/enums'
import { getConsultOrderDetail } from '@/api/consult'
import type { ConsultOrderItem, Image } from '@/types/consult'
import dayjs from 'dayjs'
import { showToast } from 'vant'
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
    // 如果断开连接后再次连接，需要清空聊天记录 否则会重复
    list.value = []
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

  // 二.问诊室-默认消息(聊天记录)#(把消息list传给room-message组件,操作在那个组件进行)
  // 1.监听默认聊天记录，给我们的数据是消息分组形式TimeMessages我们需要处理成可用的消息列表Message[]
  //    并且返回给我们三条信息,还差一条时间信息 我们自己写成通用消息
  // 2.提取常量数据
  // 3.设置响应式数据,接收数据,进行渲染
  // 4.预览病情图片

  // 类型res:{code:xxx,data:xxx,message:xxx}本来是要这么写的,但是只用data所以 只写了一个
  // 把res解构
  socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
    // console.log(data)

    // 处理消息:分组的时间自己组织成一条通用消息，items(三条消息)取出来放后面
    // 设置一个arr,里面存放3条消息和1个时间通用消息
    const arr: Message[] = [] //每一组消息
    data.forEach((item, i) => {
      // 如果是消息分组的第一项，记录一下消息创建的时间
      if (i === 0) time.value = item.createTime
      arr.push({
        // 通用消息的格式,这个时间就是内容
        id: item.createTime,
        msgType: MsgType.Notify,
        createTime: item.createTime,
        msg: {
          content: item.createTime
        }
      })
      // arr.push(...item.items)需要加 notScroll是否要到底部的属性
      item.items.forEach((item) => {
        arr.push({ ...item, notScroll: initMsg.value === false }) //二次 第三次拿消息时候不用滚
      })
    })
    list.value.unshift(...arr) //聊天记录往上拉着看的 每一组消息都是往上面加的
    // 接收完聊天记录 关闭加载效果
    loading.value = false
    if (!data.length) return showToast('没有更多记录了')

    // 第一次拿到的的聊天记录 需要滚动到最底部
    nextTick(() => {
      //只有第一次拿聊天记录(也就是刚进页面) 才会进入这里
      if (initMsg.value) {
        // 消息变成已读,需要一个事件
        // 默认加载的消息，需要用最后一条消息设置已读，之前所有消息即是已读
        // 最后一条消息的id:  arr[arr.length - 1].id
        socket.emit('updateMsgStatus', arr[arr.length - 1].id)
        window.scrollTo(0, document.body.scrollHeight)
        // 第二次 第三次...就不滚动了
        initMsg.value = false
      }
    })
  })
  // 接收订单的变更,写在初始化里
  socket.on('statusChange', async () => {
    // 这里可以监听到订单的每次变化
    // 所以我们在订单每次变化时候重新向后台发起请求接口 请求问诊订单详情
    const res = await getConsultOrderDetail(route.query.orderId as string)
    consult.value = res.data
  })
  // 接收消息
  socket.on('receiveChatMsg', async (msg: Message) => {
    list.value.push(msg)
    // 滚动到最底部
    await nextTick() //等dom渲染完 之后执行
    // 接收到消息的时候，需要把消息设置为已读
    socket.emit('updateMsgStatus', msg.id)
    window.scrollTo(0, document.body.scrollHeight)
  })
})

// 三.接诊状态的控制#
// 1.组件挂载后，需要知道当前的接诊状态
//             发请求:状态和医生信息之类的都在订单里,以后订单的变更依赖的是后端给我们的事件statusChange,图中最下面那个红色的
// 2.每次订单状态变更(通过超级医生去抢单就会变更状态)后，查询最新的订单信息(服务器给我们的事件名叫statusChange)，更新当前接诊状态
// 3.依赖状态:
//    3.1·状态栏·需要条件渲染，有倒计时
//               待接诊，绿色文字提示
//               问诊中，倒计时显示
//               已结束or已取消，显示问诊结束
//    3.2·操作栏·需要禁用和启用了
const consult = ref<ConsultOrderItem>() //问诊订单信息
// 向后台请求订单详情
onMounted(async () => {
  const res = await getConsultOrderDetail(route.query.orderId as string)
  consult.value = res.data
})

// 四.发送消息
// 发送成功的消息 需要接收成功 然后才显示到页面
// 1.接收子组件传来的消息，通过socket.emit('sendChatMsg')发送消息
// 2.socket.on('receiveChatMsg')接收消息，接收服务器回的消息证明发送成功，追加到消息列表
// 3.在渲染的时候,区分是自己还是医生
const sendText = (text: string) => {
  // 根据后台约定,发送信息给后台,数据的格式看接口文档
  socket.emit('sendChatMsg', {
    from: store.user?.id, //发送人
    to: consult.value?.docInfo?.id, //发给谁
    msgType: MsgType.MsgText, //数据类型
    msg: {
      //发送的东西
      content: text
    }
  })
}
// 五.发送图片
const sendImage = (img: Image) => {
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgImage,
    msg: { picture: img }
  })
}
// 六.加载更多聊天记录
// 往上拉屏幕时候
// * 给后台一个 记录最早的时间 后台拿到这个时间之前的数据返回给你
// * 然后你拿到数据后 你再从你刚拿到的这个数据中记录最早的时间给后台，后台再继续给你这个时间之前的数据
// 1.默认的第一次拿到的聊天记录滚动到最底部，第二次，第三次,....不需要滚动底部
// 2.实现下拉刷新效果
// 3.下拉刷新后,发送一个获取聊天记录的消息给后台
// 4.触发聊天记录事件，记录当前时间段最早的时间，作为发送聊天记录消息的参数给后台
//   4.1·判断如果有数据，追加到数组，如果没有数据，轻提示没有数据
// 5.只要socket一连接上的时候需要清空聊天记录，防止再次触发chatMsgList产生重复记录
// 6.只有当接收消息时候才会让文字和图片加载完滚到最底部，查看聊天记录时候不用
// 接收和发送消息还有第一次进来时候 需要滚动到最底部,其他时候比如查看聊天记录时候不用滚动到最底部
// 需要去类型里 改一下,把每一条消息里都加一个类型 notScroll:boolean
const initMsg = ref(true) //是否是第一次
const loading = ref(false)
// 记录每段消息的开始时间，作为下一次请求的开始时间
const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss')) //默认值是当前时间
const onRefresh = () => {
  // 发送 获取聊天记录的事件   (事件名，pageSize，时间，订单号)
  socket.emit('getChatMsgList', 10, time.value, route.query.orderId)
}
// 七.修改消息为已读#
// 接收到消息的时候，需要把消息设置为已读
// 默认加载的消息，需要用最后一条消息设置已读，之前所有消息即是已读

// 八.评价
// 1.把 未评价 和 已评价 的卡片封装在一个组件evaluateCard放到message组件中
// 2.渲染组件的时候，把消息中的评价信息，传入组件
// 3.根据是否有评价内容，展示对应的卡片
// 3.1.有数据，展示
// 3.2.无数据，绑定表单数据，收集表单数据，提交评价
// 3.3.评价成功，修改评价消息状态和数据，切换卡片展示
// 把consult传给孙子 evaluateCard
provide('consult', consult)
// 评价完，修改消息的方法,修改完的评价只用到了score
// 找到待评价那条信息,然后把他修改掉
const completeEva = (score: number) => {
  const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm)
  if (item) {
    item.msg.evaluateDoc = { score } //内容是score
    item.msgType === MsgType.CardEva //状态改成评价完
  }
}
provide('completeEva', completeEva) //传给孙子EvaluateCard用
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <!-- 状态栏 -->
    <room-status
      :status="consult?.status"
      :countdown="consult?.countdown"
    ></room-status>
    <!-- 信息栏 -->
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message :list="list"></room-message>
    </van-pull-refresh>
    <!-- 操作栏 订单状态不等于咨询中 就禁用操作栏-->
    <room-action
      @send-text="sendText"
      @send-image="sendImage"
      :disabled="consult?.status !== OrderType.ConsultChat"
    ></room-action>
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
