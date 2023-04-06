// eslint-disable-next-line no-undef
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      // 设备宽度375计算vw的值
      viewportWidth: 375
      //   盒子随着设备变化 等比例缩放
      // 设备宽度375px， 1vw=设备宽度375/100=3.75--->1vw=3.75px
      // 设备宽度414px， 1vw=设备宽度414/100=4.14--->1vw=4.14px
      // 如果有一个盒子宽度100px，在设备宽度375时，他是多少vw？100/3.75=26.666个1vw
      // 如果有一个盒子宽度100px，在设备宽度414时--> 26.666*4.14=110.399px
    }
  }
}
// 有一个控制台警告可忽略，或者使用 postcss-px-to-viewport-8-plugin 代替当前插件
