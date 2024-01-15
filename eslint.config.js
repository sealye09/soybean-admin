import antfu from '@antfu/eslint-config';

export default antfu(
  {
    stylistic: {
      semi: true, // 是否使用分号
      indent: 2, // 缩进
      quotes: 'single', // 引号类型
      jsx: true,
    },
    typescript: true,
    vue: true,
    unocss: true,
    ignores: ['node_modules', 'dist', 'build', 'public', 'packages'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue', '**/*.js', '**/*.jsx'],
    rules: {
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }], // 大括号风格
      'style/array-bracket-newline': ['error', { minItems: 7, multiline: true }], // 数组换行
      'style/jsx-closing-tag-location': 'error',
      'style/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'semi', requireLast: true },
          singleline: { delimiter: 'semi', requireLast: false },
          multilineDetection: 'brackets',
        },
      ],
      // 优先使用 type
      'ts/consistent-type-definitions': 'off',
      // 导入顺序
      'import/order': [
        'error',
        {
          'newlines-between': 'always', // 总是在组之间添加换行符
          // 按字母顺序排序
          'alphabetize': { order: 'asc', orderImportKind: 'asc' },
          'pathGroups': [{ pattern: '@/**', group: 'parent', position: 'before' }],
          /**
           * 分组
           * 1. 内置模块 (eg: import fs from 'fs')
           * 2. 外部模块 (eg: import _ from 'lodash')
           * 3. 内部模块 (eg: import foo from 'src/foo')
           * 4. 父级模块 (eg: import qux from '../qux')
           * 5. 索引文件 (eg: import main from './')
           * 6. 兄弟模块 (eg: import bar from './bar')
           */
          'groups': ['builtin', 'external', 'internal', 'parent', 'index', 'sibling'],
        },

      ],
      'antfu/if-newline': 'off',
      // 禁止使用 console
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
    },
  },
);
