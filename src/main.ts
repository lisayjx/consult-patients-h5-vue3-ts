import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import pinia from './stores/index'

// 样式全局使用，在scss上面，可以覆盖scss
import 'vant/lib/index.css'
import './style/main.scss'
// 引入svg精灵地图
import 'virtual:svg-icons-register'
// 引入动画库
import 'animate.css'
// 引入枚举
import '@/enums'
import type { ImgHTMLAttributes } from 'vue'
// import type { App } from 'vue'

const app = createApp(App)

// 自定义指令-默认图片
const defineDirective = (app: any) => {
  app.directive('defaultImage', {
    mounted(el: any, binding: any) {
      // 监听图片加载失败 就用默认图片
      el.onerror = () => {
        el.src =
          'https://yjy-teach-oss.oss-cn-beijing.aliyuncs.com/consult/deafaultAvatar.jpg'
      }
      // 将指令v-defaultImage上的地址设置给el的src属性
      el.src = binding
    }
  })
}

app.use(pinia)
app.use(router)
app.use(defineDirective)

app.mount('#app')
