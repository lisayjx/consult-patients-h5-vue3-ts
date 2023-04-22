// 用户状态仓库
import { defineStore } from 'pinia'
import type { User } from '@/types/user'
import { ref } from 'vue'
import { useConsultStore } from './modules/consult'

// 1.存储 用户信息 登陆成功后后台返回给我们的数据
// 2.修改和删除用户信息的方法

export const useUserStore = defineStore(
  'user',
  () => {
    // 1.用户信息
    const user = ref<User>()
    // 2.设置/修改用户信息，登陆后使用
    const setUser = (u: User | undefined) => {
      user.value = u
    }
    // 3.删除用户信息，退出后使用
    const delUser = () => {
      user.value = undefined
      useConsultStore().clear()
    }
    // 4.记录来源页
    const returnUrl = ref('')
    const setReturnUrl = (url: any) => {
      returnUrl.value = url
    }

    return { user, setUser, delUser, setReturnUrl, returnUrl }
  },
  // 数据持久化(需要下载pnpm i pinia-plugin-persistedstate，main引入,它是属于pinia的插件)
  //   默认存入localStorage 可以修改
  {
    persist: true
  }
  //   {
  //     persist: {
  //         storage:sessionStorage,
  //         paths:['someState']
  //     }
  //   }
)
