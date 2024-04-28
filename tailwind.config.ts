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
      '50': '#f9f8fb',
      '100': '#f2f0f7',
      '200': '#e5e0ee',
      '300': '#d3c8df',
      '400': '#b7a7cb',
      '500': '#9882b3',
      '600': '#7c6495',
      '700': '#66517b',
      '800': '#544365',
      '900': '#493b54',
      '950': '#291e34',
    },
    extend: {},
  },
  plugins: [],
} satisfies Config
