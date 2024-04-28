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
      0: '#fff',
      50: '#f3f6fb',
      100: '#e3ebf6',
      200: '#cedeef',
      300: '#acc7e4',
      400: '#84abd6',
      500: '#668ecb',
      600: '#5376bd',
      700: '#4865ad',
      800: '#445997',
      900: '#374771',
      950: '#252e46',
      gray: '#252525',
    },
    extend: {},
  },
  plugins: [],
} satisfies Config
