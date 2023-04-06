import { createRouter, createWebHistory } from 'vue-router'
// createRouter 创建路由实例，===> new VueRouter()
// history 是路由模式，hash模式，history模式
// createWebHistory() 是开启history模块   http://xxx/user
// createWebHashHistory() 是开启hash模式    http://xxx/#/user

// vite 的配置 import.meta.env.BASE_URL 是路由的基准地址，默认是 ’/‘
// https://vitejs.dev/guide/build.html#public-base-path
// 如果将来你部署的域名路径是：http://xxx/my-path/user
// vite.config.ts  添加配置  base: my-path，路由这就会加上 my-path 前缀了

// 如何创建实例的方式？createRouter()
// 如何设置路由模式？createWebHistory() 或者 createWebHashHistory()
// import.meta.env.BASE_URL 值来自哪里？vite.config.ts 的 base 属性的值
// base 作用是什么?项目的基础路径前缀，默认是 /
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: []
})

export default router
