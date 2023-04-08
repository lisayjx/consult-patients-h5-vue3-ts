// 实现关注医生业务逻辑复用
import { ref } from 'vue'
import { followOrUnfollow } from '@/api/consult'
import type { FollowType } from '@/types/consult'

export const useFollow = (type: FollowType) => {
  const loading = ref(false)
  // {a, b} 类型，传值得时候 {a, b, c} 也可以，这是类型兼容：多的可以给少的
  const follow = async (item: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true //按钮上提供了一个loading属性
    try {
      await followOrUnfollow(item.id, type)
      // 更改 关注状态
      item.likeFlag = item.likeFlag === 1 ? 0 : 1
    } finally {
      // 不管成功失败都结束loading
      loading.value = false
    }
  }
  return { loading, follow }
}
