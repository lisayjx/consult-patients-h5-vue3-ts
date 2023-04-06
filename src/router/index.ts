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

// vue2的路由
// 1.import VueRouter from 'vue-router'
// 2.const router=new  VueRouter({routes:[//路由规则]})
// 3.选择路由模式 hash /#/user ，history  /user

// vue3的路由
// 1.创建路由实例 createRouter({//配置对象})
// 2.配置选项中 routes:[//路由规则]
// 3.createWebHistory 使用路由history模式，createWebHashHistory使用路由hash模式
// 4.里面的参数 import.meta.env.BASE_URL是路由基准路径，是由create-vue脚手架提供的数据（环境变量）在vite.config里的base配置
// 5.baseUrl是在你请求的接口前加固定的路径，这个是在路由前加固定的路径
// 切换路径时候路由改变 组件  回退时地址栏和组件改变
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), //此时是 /
  routes: [
    { path: '/login', component: () => import('@/views/Login/index.vue') }
  ]
})

export default router
