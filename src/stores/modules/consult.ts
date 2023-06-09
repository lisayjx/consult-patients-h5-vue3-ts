// 实现：病情描述仓库的定义，实现问诊记录分步修改

import type { ConsultType } from '@/enums'
import type { PartialConsult } from '@/types/consult'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 步骤：
// 1.定义仓库，提供方法（每一个方法 对应每一个操作）
//     问诊记录状态
//     修改问诊类型           （问医生/急速问诊/开药门诊）
//     修改极速问诊类型       （三甲图文问诊/普通图文问诊）
//     修改科室               （眼科/儿科..）
//     修改病情描述相关信息
//     修改患者
//     修改优惠券
//     清空记录（当真正产生了一个订单后要清除问诊记录，此时上面存的数据都给了后端 前端就可以删除）
// 2.导出仓库
// 3.首页点击极速问诊记录问诊类型且跳转页面
//------------------------------------------------------------
// 定义极速问诊仓库
export const useConsultStore = defineStore(
  'cp-consult',
  () => {
    //问诊记录状态state
    const consult = ref<PartialConsult>({})
    // 1.修改问诊类型函数
    const setType = (type: ConsultType) => {
      consult.value.type = type
    }
    // 2.修改极速问诊类型函数
    const setIllnessType = (type: 0 | 1) => (consult.value.illnessType = type)
    // 3.修改科室函数
    const setDep = (id: string | undefined) => (consult.value.depId = id)
    // 4.修改病情描述函数
    const setIllness = (
      illness: Pick<
        PartialConsult,
        'illnessDesc' | 'illnessTime' | 'consultFlag' | 'pictures'
      >
    ) => {
      consult.value.illnessDesc = illness.illnessDesc
      consult.value.illnessTime = illness.illnessTime
      consult.value.consultFlag = illness.consultFlag
      consult.value.pictures = illness.pictures
    }
    // 5.修改患者函数
    const setPatient = (id: string) => (consult.value.patientId = id)
    // 6.修改优惠券函数
    const setCoupon = (id?: string) => (consult.value.couponId = id)
    // 7.清空信息
    const clear = () => (consult.value = {})
    return {
      consult,
      setType,
      setIllnessType,
      setDep,
      setIllness,
      setPatient,
      setCoupon,
      clear
    }
  },
  {
    persist: true //开启持久化
  }
)
