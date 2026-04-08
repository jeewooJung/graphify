import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Linear light palette
        background: '#ffffff',
        surface: '#fafafa',
        'surface-hover': '#f9fafb',
        border: '#e5e7eb',
        'border-light': '#f3f4f6',

        // Text colors
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        'text-tertiary': '#9ca3af',

        // Brand color (Blue)
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#3366cc', // Main accent
          600: '#2d5ab8', // Hover
          700: '#1e3a73', // Active
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },

      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },

      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },

      fontSize: {
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['12px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '3xl': ['36px', { lineHeight: '44px' }],
        '4xl': ['48px', { lineHeight: '60px' }],
      },

      boxShadow: {
        none: 'none',
        xs: '0 1px 2px #f0f0f0',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 2px 4px rgba(0, 0, 0, 0.1)',
        lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },

      transitionDuration: {
        default: '150ms',
        fast: '100ms',
        slow: '300ms',
      },

      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
