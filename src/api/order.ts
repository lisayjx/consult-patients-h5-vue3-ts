import type {
  AddressItem,
  Logistics,
  OrderDetail,
  OrderPre
} from '@/types/order'
import { request } from '@/utils/request'

// 支付药款页面-根据处方信息计算药款-药品马上要支付前的信息
// 查询药品订单预支付信息
export const getMedicalOrderPre = (params: { prescriptionId: string }) =>
  request<OrderPre>('/patient/medicine/order/pre', 'get', params)
// 获取收货地址列表
export const getAddressList = () =>
  request<AddressItem[]>('/patient/order/address', 'get')
// 点击支付-创建药品订单
export const createMedicalOrder = (data: {
  id: string
  addressId: string
  couponId?: string
}) => request<{ id: string }>('/patient/medicine/order', 'POST', data)
// 支付成功后-获取药品订单详情
export const getMedicalOrderDetail = (id: string) =>
  request<OrderDetail>(`/patient/medicine/order/detail/${id}`, 'get')
// 获取药品订单物流信息
export const getMedicalOrderLogistics = (id: string) =>
  request<Logistics>(`/patient/order/${id}/logistics`, 'get')
