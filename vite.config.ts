import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite' //自动导入组件用的
import { VantResolver } from 'unplugin-vue-components/resolvers' //各种组件库的解析器,帮我们自动加载组件库里的组件的
// import {
//   VantResolver,
//   ElementUiResolver,
//   ElementPlusResolver,
//   AntDesignVueResolver,
//   VueUseComponentsResolver
// } from 'unplugin-vue-components/resolvers' //各种组件库的解析器

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', //可以自己设置默认路由前面加的基准地址
  plugins: [
    // 解析单文件组件的插件
    vue(),
    // 自动导入的插件，解析器可以是 vant element and-vue
    Components({
      dts: false, //默认是true自动生成类型声明文件,vant的组件已经有类型声明文件，只要导入了就会使用类型声明。
      // importStyle: false原因 ：我们在main已经自动导入样式了，所以只需要自动导入组件即可
      resolvers: [VantResolver({ importStyle: false })]
    })
  ],
  resolve: {
    alias: {
      // @ 是vite配置的，基于node提供的API，得到 src 的绝对路径
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
