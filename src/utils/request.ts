// 二次封装axios
// 除了登录页面外，其他接口需要传token。
// 在Header中按照key为Authorization，值为Bearer {{token}} 的形式
// 后台返回http状态码200就是返回成功，但是code不是10000就说明后台逻辑错误（用户名或者密码啥的错误了）
// 状态码200并且code10000才是真的返回成功
// 在需要token的接口，没有传入token，传入token错误，或者token过期，返回的状态码是401 ，code不是10000
// 其他情况，接口调通返回的状态码都是200，接口中code，正常返回结果接口，10000，未能返回结果，code值不是10000
import axios, { type Method } from 'axios'
import router from '@/router'
import { useUserStore } from '@/stores'
import { showToast } from 'vant'
import type { User } from '@/types/user'
// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// showSpinner用来控制是否显示进度条右下方加载的小圆圈动画
// 通过将加载微调器设置为 false 来关闭它。（默认值：true)
NProgress.configure({ showSpinner: false })

// 1.axios配置
// 1.1创建一个新的axios实例，配置基准地址，响应超时时间
// 1.2请求拦截器，在请求头携带token
// 1.3响应拦截器，判断业务是否成功，剥离无效数据，401错误拦截去登陆页面
const baseURL = 'https://consult-api.itheima.net/'
const instance = axios.create({
  // TODO 1. 基础地址，超时时间
  baseURL,
  timeout: 10000
})
// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    NProgress.start() //进度条
    // TODO 2. 携带token
    const store = useUserStore() //写在了拦截器里面，在这里面写 就是发请求时候再使用pinia已经安装好了
    // 类型守卫
    if (store.user?.token && config.headers) {
      config.headers.Authorization = `Bearer ${store.user.token}`
    }
    return config
  },
  (err) => {
    Promise.reject(err) //必写
  }
)
// 响应拦截器
// 将来axios.get()
// .then(res=>{res 就是后台数据 之前的res.data})
// .catch(e=>{200+10001 业务逻辑错误清空，e是res.data 然后可以根据code做不同错误情况的业务，如果是状态码401 402 403e就是错误对象})
instance.interceptors.response.use(
  (res) => {
    NProgress.done()
    // TODO 3.处理业务失败
    // status是200是响应成功的，res.data.code是10000代表业务成功（没有用户名密码错误啥的）
    // 如果不是10000就要用vant的轻提示 提示用户哪里的逻辑错误，报错阻断程序
    // 后台约定，响应虽然成功，但是code不是10000，是业务逻辑失败
    if (res.data?.code !== 10000) {
      showToast(res.data.message || '业务失败')
      return Promise.reject(res.data) //将来就.catch，得到里面的code 10001 10002之类的 根据不同的错误做不同的处理【
    }
    // TODO 4.提取核心响应数据
    // 业务逻辑成功，返回响应数据，作为axios成功的结果
    return res.data
  },
  (err) => {
    NProgress.done()
    // TODO 5.处理状态码401错误
    //遇见401跳转到登录页，删除用户信息
    // 1，现在在/user/patient 页面下，发起一个获取用户信息的请求，但是此时token失效
    //2．跳转登录页面，登录成功之后，需要跳转回/user/patient 页面―(默认跳转/user 首页)
    // vue2 $router路由实例，提供路由相关函数操作$route路由相关信息，query params path . . .
    //    router.currentRoute.value.fullPath当前地址栏上的完整地址  /user/patient?id=123456这种
    if (err.response.status === 401) {
      // 删除当前用户信息
      const store = useUserStore()
      store.delUser()
      // 跳转到登录页 登录后 就回跳到当前所在的页面（源头页面 你从何而来的页面）
      router.push(`login?returnUrl=${router.currentRoute.value.fullPath}`)
    }
    Promise.reject(err) //必写
  }
)
//----------------------------------------------------------------------
// 2.请求工具函数
// 2.1封装一个请求函数，参数：url method submitData
// 2.2函数return返回：二次封装后的instance调用接口的promise对象，用then和catch知道结果成功/失败
// Method此时是从axios里引入的一种类型
// 第三个参数 也可以什么都不传 所以加？
type Data<T> = {
  code: string
  message: string
  data: T
}
const request = <T>(url: string, method: Method, submitData?: object) => {
  // 泛型的第二个参数，可以自定义响应回来的数据类型
  return instance.request<T, Data<T>>({
    url,
    method,
    // 区分get和其他post请求
    // get提交数据，选项：params
    // 其他请求post 提交数据，选项：data
    // obj={name:'jack'} ==>obj['name']得到jack
    // const name='lisa' ==>obj[name] 得到lisa
    // []里可以是js表达式
    [method.toLowerCase() === 'get' ? 'params' : 'data']: submitData
  })
}
// 我调用接口时候，不同接口返回的数据类型不同，所以需要泛型

export { baseURL, instance, request }
