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
