import { fileURLToPath, URL } from 'node:url'
import { createHtmlPlugin } from 'vite-plugin-html' //动态修改html页

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
// 打包svg图标精灵地图
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', //可以自己设置默认路由前面加的基准地址
  server: {
    port: 80,
    host: true
  },

  plugins: [
    // 解析单文件组件的插件
    vue({
      reactivityTransform: true //响应式语法糖开启
    }),
    // 自动导入的插件，解析器可以是 vant element and-vue
    Components({
      dts: false, //默认是true自动生成类型声明文件,vant的组件已经有类型声明文件，只要导入了就会使用类型声明。
      // importStyle: false原因 ：我们在main已经自动导入样式了，所以只需要自动导入组件即可
      resolvers: [VantResolver({ importStyle: false })]
    }),
    createSvgIconsPlugin({
      // 指定图标文件夹，绝对路径（NODE代码）
      iconDirs: [path.resolve(process.cwd(), 'src/icons')]
    }),
    createHtmlPlugin() //动态修改html页
  ],
  resolve: {
    alias: {
      // @ 是vite配置的，基于node提供的API，得到 src 的绝对路径
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
