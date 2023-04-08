import { createRouter, createWebHistory } from 'vue-router'
// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
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
    { path: '/login', component: () => import('@/views/Login/index.vue') },
    // 布局容器 一级路由
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      // 二级路由
      children: [
        {
          path: '/home',
          component: () => import('@/views/Home/index.vue'),
          meta: { title: '首页' }
        },
        {
          path: '/article',
          component: () => import('@/views/Article/index.vue'),
          meta: { title: '健康百科' }
        },
        {
          path: '/notify',
          component: () => import('@/views/Notify/index.vue'),
          meta: { title: '消息通知' }
        },
        {
          path: '/user',
          component: () => import('@/views/User/index.vue'),
          meta: { title: '个人中心' }
        },
        {
          path: '/user/patient',
          component: () => import('@/views/User/PatientPage.vue'),
          meta: { title: '家庭档案' }
        }
      ]
    },
    // 极速问诊
    {
      path: '/consult/fast',
      component: () => import('@/views/Consult/ConsultFast.vue'),
      meta: { title: '极速问诊' }
    },
    {
      path: '/consult/dep',
      component: () => import('@/views/Consult/ConsultDep.vue'),
      meta: { title: '选择科室' }
    },
    {
      path: '/consult/illness',
      component: () => import('@/views/Consult/ConsultIllness.vue'),
      meta: { title: '病情描述' }
    }
  ]
})

// 路由前置导航守卫 --访问权限控制
// 与vue2区别
// v2:三个参数 to from next
// vue3 没有next
// 如果·return true或啥也不写·就是放行拦截到某个页面
// return'路由地址"

// 如果未登录 不可以访问 home/articles/notify
// 如果没有token，判断是不是白名单，是白名单可以放行，不是就跳转到登陆页
// 如果有token 放行
import { useUserStore } from '@/stores'

router.beforeEach((to, from) => {
  // 切换路由前开启 进度条
  NProgress.start()

  const store = useUserStore()
  // 白名单：不需要登陆可以去的页面
  const whiteList = ['/login', '/register']
  // includes可以判断前面的数组中是否包含后面的某项
  if (!store.user?.token && !whiteList.includes(to.path)) return '/login'
  // 否则不做处理
})

// 后置 路由守卫 -路由切换完毕后关闭进度条
router.afterEach((to) => {
  // 处理路由页的标题
  document.title = `医生在线-${to.meta.title}`
  NProgress.done()
})
// showSpinner用来控制是否显示进度条右下方加载的小圆圈动画
// 通过将加载微调器设置为 false 来关闭它。（默认值：true)
NProgress.configure({ showSpinner: false })
// 路由 前置和后置 守卫 就是：路由切换前和路由切换完后 干啥
export default router
