import { MsgType, PrescriptionStatus } from '@/enums'
import type { Consult, Image } from './consult'
import type { Patient } from './user'

export type Medical = {
  /** 药品ID */
  id: string
  /** 药品名称 */
  name: string
  /** 金额 */
  amount: string
  /** 药品图片 */
  avatar: string
  /** 规格信息 */
  specs: string
  /** 用法用量 */
  usageDosag: string
  /** 数量 */
  quantity: string
  /** 是否处方，0 不是 1 是 */
  prescriptionFlag: 0 | 1
}

export type Prescription = {
  /** 处方ID */
  id: string
  /** 药品订单ID */
  orderId: string
  /** 创建时间 */
  createTime: string
  /** 患者名称 */
  name: string
  /** 问诊记录ID */
  recordId: string
  /** 性别 0 女 1 男 */
  gender: 0 | 1
  /** 性别文字 */
  genderValue: ''
  /** 年龄 */
  age: number
  /** 诊断信息 */
  diagnosis: string
  /** 处方状态 */
  status: PrescriptionStatus
  /** 药品清单 */
  medicines: Medical[]
}

export type EvaluateDoc = {
  /** 评价ID */
  id?: string
  /** 评分 */
  score?: number
  /** 内容 */
  content?: string
  /** 创建时间 */
  createTime?: string
  /** 创建人 */
  creator?: string
}

export type Message = {
  // 写上这种注释 鼠标放在数据上 会显示这个注释 会有提示
  /** 消息ID */
  id: string
  /** 消息类型 */
  msgType: MsgType
  /** 发信人 id*/
  from?: string
  /** 发信人头像 */
  fromAvatar?: string
  /** 收信人 id*/
  to?: string
  /** 收信人头像 */
  toAvatar?: string
  /** 创建时间 */
  createTime: string
  /** 消息主体 */
  msg: {
    /** 文本内容 */
    content?: string
    /** 图片对象 */
    picture?: Image
    /** 问诊记录，患者信息 */
    consultRecord?: Consult & {
      patientInfo: Patient
    }
    /** 处方信息 */
    prescription?: Prescription
    /** 评价信息 */
    evaluateDoc?: EvaluateDoc
  }
  notScroll?: boolean //是否需要滚动
}

// 消息分组列表
export type TimeMessages = {
  /** 分组消息最早时间 */
  createTime: string
  /** 消息数组 */
  items: Message[]
  /** 订单ID */
  orderId: string
  /** 会话ID */
  sid: string
}
// 消息分组: 比如 10-12点 有一组消息 ,4-5点还有一组消息,就像微信的聊天里一阵时间过去就会显示时间
