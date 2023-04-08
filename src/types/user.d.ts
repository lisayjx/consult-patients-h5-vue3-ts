// 用户信息类型
export type User = {
  id: string
  account: string
  avatar: string
  mobile: string
  token: string
}
// 验证码类型
// 短信验证码类型，登录|注册|修改手机号|忘记密码|绑定手机号
// 字面量当类型 | 是类型里的或
export type CodeType =
  | 'login'
  | 'register'
  | 'changeMobile'
  | 'forgetPassword'
  | 'bindMobile'

// 个人中心页面 用户信息类型
// 1.需要去掉token，然后添加新的信息
// Pick 可以从一个对象类型中取出某些属性,Omit可以从一个对象类型中排出某些属性
// 个人信息
type OmitUser = Omit<User, 'token'>
export type UserInfo = OmitUser & {
  /** 关注 */
  likeNumber: number
  /** 收藏 */
  collectionNumber: number
  /** 积分 */
  score: number
  /** 优惠券 */
  couponNumber: number
  orderInfo: {
    /** 待付款 */
    paidNumber: number
    /** 待发货 */
    receivedNumber: number
    /** 待收货 */
    shippedNumber: number
    /** 已完成 */
    finishedNumber: number
  }
}
// 家庭档案-单个患者信息  之后使用可能是<Patient[]>这么用 患者列表
export type Patient = {
  /** 患者ID */
  id?: string
  /** 患者名称 */
  name: string
  /** 身份证号 */
  idCard: string
  /** 0不默认  1默认 */
  defaultFlag: 0 | 1
  /** 0 女  1 男 */
  gender: 0 | 1
  /** 性别文字 */
  genderValue?: string
  /** 年龄 */
  age?: number
}
