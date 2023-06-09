// 文章类型 首页tab
// props类型 recommend推荐，fatReduction减脂，food健康饮食，like关注医生页面文章
export type KnowledgeType = 'like' | 'recommend' | 'fatReduction' | 'food'

// 通用的分页查询参数
export type PageParams = {
  /** 当前页码 */
  current: number
  /** 每页条数 */
  pageSize: number
}

// 文章列表查询参数
export type KnowledgeParams = PageParams & {
  /** 文章类型 */
  type: KnowledgeType
}

// 文章信息类型
export type Knowledge = {
  id: string
  /** 标题 */
  title: string
  /** 封面[] */
  coverUrl: string[]
  /** 标签[] */
  topics: string[]
  /** 收藏数 */
  collectionNumber: number
  /** 评论数 */
  commentNumber: number
  /** 医生名称 */
  creatorName: string
  /** 医生头像 */
  creatorAvatar: string
  /** 医生医院 */
  creatorHospatalName: string
  /** 关注文章 */
  likeFlag: 0 | 1
  /** 内容 */
  content: string
  /** 医生科室 */
  creatorDep: string
  /** 医生职称 */
  creatorTitles: string
  /** 医生ID */
  creatorId: string
}
// 文章列表类型
export type KnowledgeList = Knowledge[]
// 文章列表带分页类型
export type KnowledgePage = {
  pageTotal: number
  total: number
  rows: KnowledgeList
}
//---------------------------------------
// 医生卡片对象
export type Doctor = {
  /** 医生ID */
  id: string
  /** 医生名称 */
  name: string
  /** 头像 */
  avatar: string
  /** 医院名称 */
  hospitalName: string
  /** 医院等级 */
  gradeName: string
  /** 科室 */
  depName: string
  /** 职称 */
  positionalTitles: string
  /** 是否关注，0 未关注 1 已关注 */
  likeFlag: 0 | 1
  /** 接诊服务费 */
  serviceFee: number
  /** 接诊人数 */
  consultationNum: number
  /** 评分 */
  score: number
  /** 主攻方向 */
  major: string
}

// 医生列表
export type DoctorList = Doctor[]

// 医生分页
export type DoctorPage = {
  pageTotal: number
  total: number
  rows: DoctorList
}
//-------------------
// 关注的类型，医生|文章|百科话题|疾病
export type FollowType = 'doc' | 'knowledge' | 'topic' | 'disease'

// ---------------------
// 引入 枚举
import { ConsultType, IllnessTime } from '@/enums'
// 图片列表
export type Image = {
  /** 图片ID */
  id: string
  /** 图片地址 */
  url: string
}
// 问诊（订单）记录---支付时候需要传给后端得数据
export type Consult = {
  /** 问诊记录ID */
  id: string
  /** 问诊类型 */
  type: ConsultType //用到了枚举
  /** 快速问诊类型，0 普通 1 三甲 这个简单就没用枚举*/
  illnessType: 0 | 1
  /** 科室ID */
  depId: string
  /** 疾病描述 */
  illnessDesc: string
  /** 疾病持续时间 */
  illnessTime: IllnessTime //用到了枚举
  /** 是否就诊过，0 未就诊过  1 就诊过 */
  consultFlag: 0 | 1
  /** 图片数组 */
  pictures: Image[]
  /** 患者ID */
  patientId: string
  /** 优惠券ID */
  couponId: string
}
// 发现在一步一步进行问诊的时候，是一个值一个值加上去的，所以最好是都可选属性
// Required 转换为全部必选
// Partial 转换问全部可选
// Required 转换为全部必须   Partial 转换问全部可选  两个内置的泛型类型
// 问诊记录-全部可选
export type PartialConsult = Partial<Consult>

// 科室
export type SubDep = {
  /** 科室ID */
  id?: string
  /** 科室名称 */
  name?: string
  // 科室图
  avatar?: string
}
/** 二级科室数组 */
export type TopDep = {
  id: string
  name: string
  child: SubDep[]
}
// 病情描述数据，可选问诊记录数据里的几项就是
// Pick从某类型中取出某些
export type ConsultIllness = Pick<
  PartialConsult,
  'illnessDesc' | 'illnessTime' | 'consultFlag' | 'pictures'
>
//-----------
// 问诊订单预支付传参（发给后端的）
export type ConsultOrderPreParams = Pick<PartialConsult, 'type' | 'illnessType'>
// 问诊订单预支付信息(后端返回的)
export type ConsultOrderPreData = {
  /** 积分抵扣 */
  pointDeduction: number
  /** 优惠券抵扣 */
  couponDeduction: number
  /** 优惠券ID */
  couponId: string
  /** 需付款 */
  payment: number
  /** 实付款 */
  actualPayment: number
}
//------问诊室-问诊订单单项信息------------
import { OrderType } from '../enums/index'
// 问诊订单单项信息
export type ConsultOrderItem = Consult & {
  /** 创建时间 */
  createTime: string
  /** 医生信息 */
  docInfo?: Doctor
  /** 患者信息 */
  patientInfo: Patient
  /** 订单编号 */
  orderNo: string
  /** 订单状态 */
  status: OrderType
  /** 状态文字 */
  statusValue: string
  /** 类型问诊文字 */
  typeValue: string
  /** 倒计时时间 */
  countdown: number
  /** 处方ID */
  prescriptionId?: string
  /** 评价ID */
  evaluateId: number
  /** 应付款 */
  payment: number
  /** 优惠券抵扣 */
  couponDeduction: number
  /** 积分抵扣 */
  pointDeduction: number
  /** 实付款 */
  actualPayment: number
}
import { PrescriptionStatus } from '@/enums'
import type { Patient } from './user'

// 问诊记录-订单列表 请求的数据类型
export type ConsultOrderListParams = PageParams & {
  /** 问诊记录类型 */
  type: ConsultType
}
// 带分页问诊订单列表类型 返回来的数据类型
export type ConsultOrderPage = {
  pageTotal: number
  total: number
  rows: ConsultOrderItem[]
}
