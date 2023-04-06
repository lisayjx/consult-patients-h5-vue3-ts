/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true, //单引号
        semi: false, //无分号
        printWidth: 80, //行宽度80字符
        trailingComma: 'none', //没有对象数组最后一个逗号
        endOfLine: 'auto' //换行字符串自动（系统不一样换行符号不一样）
      }
    ],
    'vue/multi-word-component-names': [
      'warn',
      {
        ignores: ['index'] //vue 组件需要大驼峰命名，除去 index 之外，App 是默认支持的
      }
    ],
    'vue/no-setup-props-destructure': ['off'] //允许对 props 进行解构，我们会开启解构保持响应式的语法糖
  }
}
