// 问诊类型 -首页三大块
export enum ConsultType {
  /** 找医生 */
  Doctor = 1,
  /** 快速问诊 */
  Fast = 2,
  /** 开药问诊 */
  Medication = 3
}
// 问诊时间，以1自增可以省略
export enum IllnessTime {
  /** 一周内 */
  Week = 1,
  /** 一月内 */
  Month,
  /** 半年内 */
  HalfYear,
  /** 半年以上 */
  More
}
//------问诊室----------
// 消息类型
export enum MsgType {
  /** 文字聊天 */
  MsgText = 1,
  /** 消息聊天 */
  MsgImage = 4,
  /** 患者信息 */
  CardPat = 21,
  /** 处方信息 */
  CardPre = 22,
  /** 未评价信息 */
  CardEvaForm = 23,
  /** 已评价信息 */
  CardEva = 24,
  /** 通用通知 */
  Notify = 31,
  /** 温馨提示 */
  NotifyTip = 32,
  /** 取消提示 */
  NotifyCancel = 33
}

// 处方状态
export enum PrescriptionStatus {
  /** 未付款 */
  NotPayment = 1,
  /** 已付款 */
  Payment = 2,
  /** 已失效 */
  Invalid = 3
}

// 订单状态
export enum OrderType {
  // 问诊订单---------------
  /** 待支付 */
  ConsultPay = 1,
  /** 待接诊 */
  ConsultWait = 2,
  /** 问诊中 */
  ConsultChat = 3,
  /** 问诊完成 */
  ConsultComplete = 4,
  /** 取消问诊 */
  ConsultCancel = 5,
  // 药品订单----------------
  /** 待支付 */
  MedicinePay = 10,
  /** 待发货 */
  MedicineSend = 11,
  /** 待收货 */
  MedicineTake = 12,
  /** 已完成 */
  MedicineComplete = 13,
  /** 取消订单 */
  MedicineCancel = 14
}
// 物流状态
export enum ExpressStatus {
  /** 已发货 */
  Delivered = 1,
  /** 已揽件 */
  Received = 2,
  /** 运输中 */
  Transit = 3,
  /** 派送中 */
  Delivery = 4,
  /** 已签收 */
  Signed = 5
}

/*
// 1.枚举的语法（别和对象写法混）
enum Direction {
  Up = 0,
  left = 1
}
// 也可以不赋值 那么值就是从0开始依次往下
enum Direction {
  Up, //0
  left //1
}
// 如果第一个值是5呢？那下一个没赋值的就是6
enum Direction {
  Up = 5,
  left
}
// 可以是字符串吗？如果第一个是字符串 后面都得写成字符串
enum Direction {
  Up = 'up',
  left
}
const change = (d: Direction) => {
  console.log(d)
}
change(Direction.left)
// 2.枚举使用场景
// 男0女1，待付款1 已付款5 已完成8
enum Gender {
  Men = 0,
  Women = 1
}
const changeGender = (gender: Gender) => {
  if (gender === Gender.Women) {
    //Gender.Women把枚举当作值使用
    console.log('性别是女')
  }
}
changeGender(Gender.Women)
*/
