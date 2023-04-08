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
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
