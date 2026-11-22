export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'zinc',
    },
    table: {
      slots: {
        th: 'p-2 truncate',
        td: 'p-2 border-b border-default',
        tr: 'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
      },
    },
  },
});
