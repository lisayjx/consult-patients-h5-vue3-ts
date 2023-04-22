<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { showToast, type FormInstance } from 'vant' //在template不用导入 已经自动导入了，在js中要导入
import { loginByPassword, sendMobileCode, loginByMobile } from '@/api/user'
import { useUserStore } from '@/stores'
import { useRoute, useRouter } from 'vue-router'
// 使用了 unplugin-vue-components 默认 src/compoenents 自动导入注册组件
// 4.表单校验
// 单个校验
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
//1.默认不勾选同意
const agree = ref(false)
// 2.睁眼闭眼
// 眼睛是闭是睁由showEyeOpen和名字后on还是off决定
// 密码是否看得见由input的type是password还是text决定
const showEyeOpen = ref(false)
// -----------密码登录
// 3.表单数据
const mobile = ref('')
const password = ref('')
const code = ref('') //验证码

// 整体校验，点击按钮，按钮type是submit类型就会自动做整体校验
// 设置button组件为原生 submit 类型按钮
// 5.点击登录

const store = useUserStore()
const router = useRouter()
const route = useRoute()
const shakeX = ref(false) //控制 勾选协议是否加抖动动画
const isPass = ref(true) //是否是密码登录

// 当表单校验成功后触发 submit时间触发这个login函数
const login = async () => {
  if (!agree.value) {
    shakeX.value = false //去除动画样式 为了每次都新加上动画
    // showToast('请勾选我已同意')
    setTimeout(() => {
      shakeX.value = true
    }, 100)
    return
  }
  // 验证完毕，进行登录
  // 登录,isPass为true就是密码登录，false就是验证码登录
  const res = isPass.value
    ? await loginByPassword(mobile.value, password.value)
    : await loginByMobile(mobile.value, code.value)
  //存入pinia
  store.setUser(res.data)

  // 如果有回跳地址就进行回跳，没有跳转到个人中心
  router.replace((route.query.returnUrl as string) || '/user')
  showToast('登陆成功')
}
//发送短信验证码
// 1.API接口调用函数
// 2.发送短信验证码:·判断是否正在倒计时·校验输入框·调用短信接口
// 3.接口成功，倒计时，组件销毁要清理定时器
const form = ref<FormInstance | null>(null) //获取表单实例
// 点击发送验证码
const time = ref(0)
let timeId: number
const sendCode = async () => {
  if (time.value > 0) return //如果倒计时time>0不能发送验证码
  // 校验手机号
  await form.value?.validate('mobile') //校验成功后 才能倒计时

  // 倒计时
  time.value = 60
  if (timeId) clearInterval(timeId)
  timeId = setInterval(() => {
    time.value--
    if (time.value <= 0) clearInterval(timeId)
  }, 1000)

  // 接口
  await sendMobileCode(mobile.value, 'login')
  showToast('发送成功')
}

// 组件销毁时清除定时器
onUnmounted(() => {
  clearInterval(timeId)
})
// QQurl
const enCodeUrl = encodeURIComponent(
  import.meta.env.VITE_APP_CALLBACK + '/login/callback'
)
const qqUrl = `https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=${enCodeUrl}`
</script>

<template>
  <div class="login-page">
    <!-- 顶部nav -->
    <cp-nav-bar
      right-text="注册"
      @click-right="$router.push('/register')"
    ></cp-nav-bar>
    <!-- 头部 -->
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
      <a @click="isPass = !isPass" href="javascript:;">
        <span>{{ !isPass ? '密码登录' : '短信验证码登录' }}</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- 表单 -->
    <!-- autocomplete="off" 是否填充 -->
    <van-form @submit="login" autocomplete="off" ref="form">
      <van-field
        name="mobile"
        :rules="mobileRules"
        v-model="mobile"
        placeholder="请输入手机号"
        type="tel"
      ></van-field>
      <van-field
        v-if="isPass"
        :rules="passwordRules"
        v-model="password"
        placeholder="请输入密码"
        :type="showEyeOpen ? 'text' : 'password'"
      >
        <template #button>
          <cp-icon
            @click="showEyeOpen = !showEyeOpen"
            :name="`login-eye-${showEyeOpen ? 'on' : 'off'}`"
          ></cp-icon>
        </template>
      </van-field>
      <!-- 短信登录 -->
      <van-field
        v-else
        :rules="codeRules"
        v-model="code"
        placeholder="短信验证码"
      >
        <template #button>
          <span
            @click="sendCode"
            class="btn-send"
            :class="{ active: time > 0 }"
            >{{ time > 0 ? `${time}s后发送验证码` : '发送验证码' }}</span
          >
        </template>
      </van-field>
      <div
        class="cp-cell animate__animated"
        :class="{
          animate__shakeX: shakeX
        }"
      >
        <van-checkbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <van-button native-type="submit" block round type="primary"
          >登 录</van-button
        >
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>
    <!-- 底部 -->
    <div class="login-other">
      <van-divider>第三方登录</van-divider>
      <!-- <div id="qq"></div> -->
      <div class="icon">
        <a @click="store.setReturnUrl($route.query.returnUrl)" :href="qqUrl">
          <img src="@/assets/qq.svg" alt="" />
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  &-page {
    padding-top: 46px;
  }
  &-head {
    display: flex;
    padding: 30px 30px 50px;
    justify-content: space-between;
    align-items: flex-end;
    line-height: 1;
    h3 {
      font-weight: normal;
      font-size: 24px;
    }
    a {
      font-size: 15px;
    }
  }
  &-other {
    margin-top: 60px;
    padding: 0 30px;
    .icon {
      display: flex;
      justify-content: center;
      img {
        width: 36px;
        height: 36px;
        padding: 4px;
      }
    }
  }
}
.van-form {
  padding: 0 14px;
  .cp-cell {
    height: 52px;
    line-height: 24px;
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    .van-checkbox {
      a {
        color: var(--cp-primary);
        padding: 0 5px;
      }
    }
  }
  .btn-send {
    color: var(--cp-primary);
    &.active {
      color: rgba(22, 194, 163, 0.5);
    }
  }
}
</style>
