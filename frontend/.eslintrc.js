module.exports = {
    parserOptions: {
        ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
        sourceType: 'module', // 使用模块化的文件结构
    },
    env: {
        browser: true, // 启用浏览器环境
        es2021: true, // 使用 ES2021 版本的特性
        commonjs: true, // 启用 CommonJS 模块规范
    },
    parser: '@typescript-eslint/parser', // 使用 '@typescript-eslint/parser' 作为解析器，用于解析 TypeScript 代码
    extends: [
        'eslint:recommended', // 使用 ESLint 推荐的基本规则
        'plugin:react/recommended', // 使用 react 插件推荐的规则
        'plugin:@typescript-eslint/recommended', // 使用 @typescript-eslint 插件推荐的规则
    ],
    plugins: ['react'], // 启用 react 插件
    rules: {
        quotes: ['error', 'single'], // 强制使用单引号
    },
}
