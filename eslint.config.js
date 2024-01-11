// eslint.config.js
import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true, // 是否使用分号
    indent: 2, // 缩进
    quotes: 'single', // 引号类型
  },

  typescript: true,
  vue: true,
  unocss: true,
}, {
  files: ['**/*.ts', '**/*.tsx', '**/*.vue', '**/*.js', '**/*.jsx'],
  rules: {
    // 优先使用 type
    'ts/consistent-type-definitions': ['ignore', 'type'],
    // 导入顺序
    'import/order': [
      'error',
      {
        'newlines-between': 'always', // 总是在组之间添加换行符
        // 按字母顺序排序
        'alphabetize': {
          order: 'asc', /* sort in ascending order. Options: ['ignore', 'asc', 'desc'] */
          orderImportKind: 'asc', /* sort import declarations in ascending order. Options: ['ignore', 'asc', 'desc'] */
        },
        'pathGroups': [
          {
            pattern: '@/**',
            group: 'parent',
            position: 'before',
          },
        ],
        'groups': [
          'builtin', // 内置模块 eg: import fs from 'fs'
          'external', // 外部模块 eg: import _ from 'lodash';
          'internal', // 内部模块 eg: import foo from 'src/foo';
          'parent', // 父级模块 eg: import qux from '../qux'
          'index', // 索引文件 eg: import main from './';
          'sibling', // 兄弟模块,"index" of the current directory  eg: import bar from './bar'
        ],
      },
    ],
  },
}, {
  'files': ['**/*.vue'],
  rules: {

  }
});
