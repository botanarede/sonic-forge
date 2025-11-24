import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Sonic Forge',
  description: 'Technical Documentation for Sonic Forge',
  themeConfig: {
    sidebar: [
      {
        text: 'Architecture',
        items: [
          { text: 'Overview', link: '/architecture/overview' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Getting Started', link: '/development/getting-started' },
          { text: 'Components', link: '/development/components' },
          { text: 'Services', link: '/development/services' },
        ],
      },
      { text: 'Roadmap', link: '/roadmap' },
    ],
  },
});
