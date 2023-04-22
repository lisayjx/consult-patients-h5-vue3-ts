<script setup lang="ts">
import { bindMobile, loginByQQ, sendMobileCode } from '@/api/user'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { codeRules, mobileRules } from '@/utils/rules'
import { showSuccessToast, showToast, type FormInstance } from 'vant'
import { useUserStore } from '@/stores'
type QCType = {
  Login: {
    check(): boolean
    getMe(cb: (openId: string) => void): void
  }
}
let QC: QCType
// 1.进行登录
// 1.1 通过QQ的js文件提供的API获取你登录后的openId(就是登录后标识)
// 1.2 如果后台的数据库中存储了openId +你的账号手机号―去登录就可以成功，否则失败
const router = useRouter()
// 进行QQ登录，记录 openId 和 isBind
const openId = ref('')
const isNeedBind = ref(false)
onMounted(() => {
  // 检查是否登陆成功，成功后才能拿到openId

  if (QC.Login.check()) {
    // getMe方法，拿到自己的信息
    QC.Login.getMe((id) => {
      openId.value = id
      // 接口 qq登录
      loginByQQ(id)
        .then((res) => {
          // 登陆成功
          // 跳转，保存用户信息到仓库
          store.setUser(res.data)
          router.replace(store.returnUrl || '/user')
          store.setReturnUrl('') //删除来源页
          showSuccessToast('登录成功')
        })
        .catch((err) => {
          // 登陆失败，说明没绑定手机号
          // 展示绑定手机号的 页面
          isNeedBind.value = true
        })
    })
  }
})
// 发送验证码
const mobile = ref('')
const code = ref('')
const form = ref<FormInstance | null>(null) //获取表单实例
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
  await sendMobileCode(mobile.value, 'bindMobile')
  showToast('发送成功')
}
// 组件销毁时清除定时器
onUnmounted(() => {
  clearInterval(timeId)
})
// 绑定手机号
// 1.成功绑定后
// 1.存储用户信息 2.记录来源页 3.一旦跳转完 就需要把来源页删除
// 点击qq登录小图标时候就把returnUrl来源页记录下来，然后等到绑定/登陆成功后跳转回来源页
// 如果没有来源页 就跳转到user页
const store = useUserStore()

const bind = async () => {
  await form.value?.validate()
  const res = await bindMobile({
    mobile: mobile.value,
    code: code.value,
    openId: openId.value
  })
  // 跳转，保存用户信息到仓库

  store.setUser(res.data)
  router.replace(store.returnUrl || '/user')
  store.setReturnUrl('') //删除来源页
  showSuccessToast('登录成功')
}
console.log(store.user)
</script>

<template>
  <div class="login-page" v-if="isNeedBind">
    <cp-nav-bar></cp-nav-bar>
    <div class="login-head">
      <h3>手机绑定</h3>
    </div>
    <van-form @submit="bind" autocomplete="off" ref="form">
      <van-field
        v-model="mobile"
        name="mobile"
        :rules="mobileRules"
        placeholder="请输入手机号"
      ></van-field>
      <van-field
        v-model="code"
        name="code"
        :rules="codeRules"
        placeholder="请输入验证码"
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
      <div class="cp-cell">
        <!-- 有 native-type="submit"就可以做整个表单的校验 -->
        <van-button
          style="margin-top: 50px"
          block
          round
          type="primary"
          native-type="submit"
        >
          立即绑定
        </van-button>
      </div>
    </van-form>
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
