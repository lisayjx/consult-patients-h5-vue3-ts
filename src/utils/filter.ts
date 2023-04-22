import { flagOptions, timeOptions } from '@/api/constants'
import type { IllnessTime } from '@/enums'

// 把获取患病时间 格式化成文字 (原本是1/2/3..)
export const formTimeOptions = (time?: IllnessTime) => {
  return timeOptions.find((item) => item.value === time)?.label
}
// 获取是否就诊 consultFlag :0|1
export const formConsultFlagText = (flag?: 0 | 1) => {
  return flagOptions.find((item) => item.value === flag)?.label
}
