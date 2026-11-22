export const vueLayoutRules = {
  'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
  'vue/attributes-order': [
    'error',
    {
      order: [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'UNIQUE',
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'GLOBAL',
        'ATTR_STATIC',
        'ATTR_DYNAMIC',
        'EVENTS',
        'CONTENT',
      ],
      alphabetical: false,
    },
  ],
  'vue/html-closing-bracket-newline': ['error', { singleline: 'never', multiline: 'always' }],
  'vue/html-indent': [
    'error',
    2,
    { attribute: 1, baseIndent: 1, closeBracket: 0, alignAttributesVertically: true, ignores: [] },
  ],
  'vue/multiline-html-element-content-newline': [
    'error',
    { ignoreWhenEmpty: true, ignores: ['span'], allowEmptyLines: false },
  ],
  'vue/padding-line-between-blocks': ['error', 'always'],
  'vue/singleline-html-element-content-newline': [
    'error',
    { ignoreWhenNoAttributes: false, ignoreWhenEmpty: true, ignores: ['span'] },
  ],
};
