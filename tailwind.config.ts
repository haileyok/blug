import type {Config} from 'tailwindcss'

export default {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: {
      padding: '1.5rem',
      screens: {
        sm: '100%',
        md: '100%',
        lg: '850px',
      },
    },
    borderWidth: {
      0: '0',
      1: '1px',
      2: '2px',
      3: '3px',
      4: '4px',
    },
    colors: {
      0: '#09090b',
      50: '#18181b',
      100: '#1f1f23',
      200: '#27272a',
      300: '#3f3f46',
      400: '#52525b',
      500: '#71717a',
      600: '#60a5fa',
      700: '#3b82f6',
      800: '#2563eb',
      900: '#d4d4d8',
      950: '#fafafa',
      gray: '#ffffff',
    },
    extend: {},
  },
  plugins: [],
} satisfies Config
