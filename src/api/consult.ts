import type {
  DoctorPage,
  FollowType,
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  TopDep,
  Image,
  ConsultOrderPreParams,
  ConsultOrderPreData,
  PartialConsult,
  ConsultOrderItem,
  ConsultOrderListParams,
  ConsultOrderPage
} from '@/types/consult'
import { request } from '@/utils/request'

// 查询首页 下面知识列表的数据
export const getKnowledgePage = (params: KnowledgeParams) =>
  request<KnowledgePage>('/patient/home/knowledge', 'GET', params)
// 获取推荐关注医生
export const getDoctorPage = (params: PageParams) =>
  request<DoctorPage>('/home/page/doc', 'GET', params)
// 关注/取关， 医生|文章|百科话题|疾病  'doc' | 'knowledge' | 'topic' | 'disease'
export const followOrUnfollow = (id: string, type: FollowType) =>
  request('/like', 'POST', { id, type })
// 获取全部科室
export const getAllDep = () => request<TopDep[]>('/dep/all', 'get')
// 上传图片
export const uploadImage = (file: File) => {
  const fb = new FormData()
  fb.append('file', file) // key看后台叫啥， value
  // 一行就不用写return，多行必须写
  return request<Image>('/upload', 'post', fb)
}
// 在支付页-获取上面部分的信息 ：获取生成订单的信息，后台根据问诊类型，和极速问诊的级别，确定一些金额。
export const getConsultOrderPre = (params: ConsultOrderPreParams) =>
  request<ConsultOrderPreData>('/patient/consult/order/pre', 'get', params)
// 生成订单（能得到支付时候和支付方式一起给后台的订单id）
export const createConsultOrder = (data: PartialConsult) => {
  return request<{ id: string }>('/patient/consult/order', 'post', data)
}
// 点击立即支付-获取后端传来的支付地址  0 是微信  1 支付宝
export const getConsultOrderPayUrl = (params: {
  paymentMethod: 0 | 1
  orderId: string
  payCallback: string
}) => request<{ payUrl: string }>('/patient/consult/pay', 'POST', params)
// 问诊室-查询问诊订单详情
export const getConsultOrderDetail = (orderId: string) =>
  request<ConsultOrderItem>('/patient/consult/order/detail', 'GET', { orderId })
// 查看处方 图片
export const getPrescriptionPic = (id: string) =>
  request<{ url: string }>(`/patient/consult/prescription/${id}`, 'get')
// 提交问诊评价
export const evaluateConsultOrder = (data: {
  docId: string
  orderId: string
  score: number
  content: string
  anonymousFlag: 0 | 1
}) => request<{ id: string }>('/patient/order/evaluate', 'POST', data)
// 订单列表
export const getConsultOrderList = (params: ConsultOrderListParams) =>
  request<ConsultOrderPage>('/patient/consult/order/list', 'GET', params)
// 取消订单
export const cancelOrder = (id: string) =>
  request(`/patient/order/cancel/${id}`, 'PUT')
// 删除订单
export const deleteOrder = (id: string) =>
  request(`/patient/order/${id}`, 'DELETE')
