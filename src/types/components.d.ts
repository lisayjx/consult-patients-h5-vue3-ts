// 给components下的全局组件，设置类型
// 怎么给全局的组件提供类型？
// 写一个类型声明文件，declare module 'vue' 声明一个 vue 类型模块
// 然后 interface GlobalComponents 书写全局组件的类型
// key组件名称支持大驼峰，value是组件类型,通过 typeof 组件实例得到组件类型
import CpNavBar from '@/components/CpNavBar.vue'
import CpIcon from '@/components/CpIcon.vue'

declare module 'vue' {
  interface GlobalComponents {
    // 指定组件类型
    CpNavBar: typeof CpNavBar
    CpIcon: typeof CpIcon
  }
}
