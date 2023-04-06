// 1.单独维护pinia
// 2.创建好的pinia仓库统一从这里导出

import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate' // 数据持久化
const pinia = createPinia()
pinia.use(persist) //因为持久化插件时pinia里的 所以要pinia使用

export default pinia

// 完整写法
// 导入各个模块的仓库之后导出
// import { useUserStore } from './user'
// export { useUserStore }

// 简写
export * from './user'
