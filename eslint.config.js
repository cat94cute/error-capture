import antfu from '@antfu/eslint-config'

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
    },
  },
  {
    rules: {
      'vue/block-order': ['error', {
        order: ['template', 'script[setup]', 'script:not[setup]', 'style']
      }],
      'style/comma-dangle': 'off',
      'style/indent-binary-ops': 'off',
      'no-console': 'off',
    },
  }
)
