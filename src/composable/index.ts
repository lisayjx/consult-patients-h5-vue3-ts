// 实现关注医生业务逻辑复用
import { ref } from 'vue'
import { cancelOrder, deleteOrder, followOrUnfollow } from '@/api/consult'
import type { ConsultOrderItem, FollowType } from '@/types/consult'

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

//  查看处方图片
import { getPrescriptionPic } from '@/api/consult'
import { showFailToast, showImagePreview, showSuccessToast } from 'vant'
import { OrderType } from '@/enums'

export const showPrescription = async (id: string | undefined) => {
  if (id) {
    const res = await getPrescriptionPic(id)
    // 预览图片
    showImagePreview([res.data.url])
  }
}

// 取消订单
export const useCancelOrder = () => {
  const loading = ref(false)
  const cancelConsultOrder = async (item: ConsultOrderItem | undefined) => {
    if (item) {
      try {
        loading.value = true
        await cancelOrder(item.id)
        item.status = OrderType.ConsultCancel
        item.statusValue = '已取消'
        showSuccessToast('取消成功')
      } catch (error) {
        showFailToast('取消失败')
      } finally {
        loading.value = false
      }
    }
  }
  return { loading, cancelConsultOrder }
}
// 删除订单
export const useDelOrder = (cb: () => void) => {
  const delLoading = ref(false)
  const deleteConsultOrder = async (item: ConsultOrderItem | undefined) => {
    if (item) {
      try {
        delLoading.value = true
        await deleteOrder(item.id)
        showSuccessToast('删除成功')
        // 成功，做其他业务
        cb && cb()
      } catch (error) {
        showFailToast('删除失败')
      } finally {
        delLoading.value = false
      }
    }
  }
  return { delLoading, deleteConsultOrder }
}
