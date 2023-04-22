<script setup lang="ts">
import { uploadImage } from '@/api/consult'
import type { Image } from '@/types/consult'
import { closeToast, showLoadingToast } from 'vant'
import type { UploaderAfterRead } from 'vant/lib/uploader/types'
import { ref } from 'vue'

defineProps<{
  disabled: boolean
}>()
const emit = defineEmits<{
  (e: 'send-text', text: string): void
  (e: 'send-image', img: Image): void
}>()
// 把输入内容给父组件
const text = ref('') //输入的文字
const onSendText = () => {
  if (text.value) {
    // 把文字传给父亲
    emit('send-text', text.value)
    text.value = ''
  }
}
// 把图片发给父亲
const sendImage: UploaderAfterRead = async (file) => {
  // 类型守卫
  if (Array.isArray(file)) return //如果是数组不行
  if (!file.file) return
  // 上传图片（调用接口）
  showLoadingToast('正在上传中..')
  const res = await uploadImage(file.file)
  closeToast() //关闭提示
  // 把图片对象提交给父组件
  emit('send-image', res.data)
}
</script>
<!-- 发送消息
1。底部操作栏组件，输入信息后需要传递给父组件（index.vue)组件
2。由父组件来发送信息，通过emit发送消息sendChatMsg(发送的消息得等服务器回给咱们才能展示到页面)
3．接收消息，on receiveChatMsg接收服务器回的消息证明发送成功，追加到消息列表
   自己发的消息和医生发的消息都是通过receiveChatMsg给咱们得  
4. 在渲染的时候,区分是自己还是医生
 -->
<!-- 发送图片
1。底部操作栏组件，上传图片，成功后传递给父组件（index. vue)组件·{id,url}图片对象
2。由父组件来发送信息，通过emit发送消息·sendChatMsg
3. 接收消息刚才做了 
4. 在渲染的时候，区分是自己还是医生

-->
<template>
  <div class="room-action">
    <!-- 这两个组件都支持disabled 
     @keyup.enter意思是按下回车
    -->
    <van-field
      :disabled="disabled"
      v-model="text"
      type="text"
      class="input"
      :border="false"
      placeholder="问医生"
      autocomplete="off"
      @keyup.enter="onSendText"
    ></van-field>
    <!-- :preview-image="false"不预览 用小图标作为上传图标 :after-read图片上传后-->
    <van-uploader
      :after-read="sendImage"
      :disabled="disabled"
      :preview-image="false"
    >
      <cp-icon name="consult-img" />
    </van-uploader>
  </div>
</template>

<style lang="scss" scoped>
.room-action {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 1;
  box-sizing: border-box;
  .input {
    background-color: var(--cp-bg);
    border: none;
    border-radius: 25px;
    margin-right: 10px;
    padding: 8px 15px;
  }
  .cp-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
