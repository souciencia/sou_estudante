import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  initialGlobals: {
    backgrounds: { value: 'app', grid: false },
  },

  parameters: {
    nextjs: {
      appDirectory: true,
    },

    backgrounds: {
      default: 'app',
      options: {
        app: { name: 'App', value: '#f5f5f5' },
        light: { name: 'Light', value: '#ffffff' },
      },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
