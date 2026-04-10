import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'Fira Code', 'monospace'],
      },
      colors: {
        canvas: 'var(--app-canvas)',
        sidebar: 'var(--app-sidebar)',
        panel: 'var(--app-panel)',
        surface: 'var(--app-surface)',
        'surface-hover': 'var(--app-surface-hover)',
        'surface-emphasis': 'var(--app-surface-emphasis)',
        border: 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          quaternary: 'var(--text-quaternary)',
        },
        primary: {
          50: '#eef4ff',
          100: '#dfe8ff',
          200: '#c7d6ff',
          500: '#4f6ef7',
          600: '#405ce0',
          700: '#3247c7',
        },
        success: {
          50: '#eefbf5',
          500: '#1e9b68',
          600: '#187e55',
        },
        warning: {
          50: '#fff8eb',
          500: '#b98726',
          600: '#936716',
        },
        error: {
          50: '#fff1f2',
          500: '#d25560',
          600: '#ad434d',
        },
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 12px 28px rgba(16, 24, 40, 0.04)',
        panel: '0 1px 1px rgba(16, 24, 40, 0.03), 0 8px 22px rgba(16, 24, 40, 0.05)',
        innersoft: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [],
}

export default config
