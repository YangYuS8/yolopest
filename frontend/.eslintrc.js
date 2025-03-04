export const parserOptions = {
    ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
    sourceType: 'module', // 使用模块化的文件结构
    node: true, // 启用 Node.js 环境
}
export const env = {
    browser: true, // 启用浏览器环境
    es2021: true, // 使用 ES2021 版本的特性
    commonjs: true, // 启用 CommonJS 模块规范
}
export const parser = '@typescript-eslint/parser'
export const extendsConfig = [
    'eslint:recommended', // 使用 ESLint 推荐的基本规则
    'plugin:react/recommended', // 使用 react 插件推荐的规则
    'plugin:@typescript-eslint/recommended', // 使用 @typescript-eslint 插件推荐的规则
]
export const plugins = ['react']
export const rules = {
    quotes: ['error', 'single'], // 强制使用单引号
}
