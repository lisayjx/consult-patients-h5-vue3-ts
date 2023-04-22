// 用户接口
import { request } from '@/utils/request'
import type { User, CodeType, UserInfo, Patient } from '@/types/user' //User类型，返回的数据的类型

// 1.密码登录
export const loginByPassword = (mobile: string, password: string) =>
  request<User>('/login/password', 'POST', { mobile, password })
// 2.获取验证码
// login登录register注册changeMobile更换手机号forgetPassword找回密码,bindMobile绑定三方登录，区分验证码
export const sendMobileCode = (mobile: string, type: CodeType) =>
  request('/code', 'get', { mobile, type })
// 3.短信登陆
export const loginByMobile = (mobile: string, code: string) =>
  request<User>('/login', 'POST', { mobile, code })
// 4.获取个人信息
export const getUserInfo = () => request<UserInfo>('/patient/myUser', 'get')
// 5.家庭档案-病人信息列表-查询患者列表信息
export const getPatientList = () => request<Patient[]>('/patient/mylist', 'get')
// 6.添加患者信息
export const addPatient = (patient: Patient) =>
  request('/patient/add', 'POST', patient)
// 7.编辑患者信息
export const editPatient = (patient: Patient) =>
  request('/patient/update', 'PUT', patient)
// 8.删除患者信息
export const delPatient = (id: string) =>
  request(`/patient/del/${id}`, 'DELETE')
// 9.查询患者详情
export const getPatientDetail = (id: string) =>
  request<Patient>(`/patient/info/${id}`, 'get')
// 10.qq登录获取 用户信息
export const loginByQQ = (openId: string) =>
  request<User>('/login/thirdparty', 'POST', { openId, source: 'qq' })
// 11.绑定手机
export const bindMobile = (data: {
  mobile: string
  code: string
  openId: string
}) => request<User>('/login/binding', 'POST', data)
// 12.解除绑定手机号
export const unBindMobile = (userInfo: string) =>
  request(`/unbound/${userInfo}`, 'put')
