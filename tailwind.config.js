/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf6ee',
          100: '#faebd7',
          200: '#f3d09e',
          300: '#ecb365',
          400: '#e5962c',
          500: '#c47a1a',
          600: '#9e5f13',
          700: '#78460e',
          800: '#52300a',
          900: '#2c1a05',
        },
        deep: {
          50:  '#eef0f7',
          100: '#d4d9ec',
          200: '#a8b3d9',
          300: '#7d8dc6',
          400: '#5267b3',
          500: '#2f4694',  // deep indigo
          600: '#253878',
          700: '#1b2a5c',
          800: '#111c40',
          900: '#080e24',
        },
        saffron: '#E8A020',
        cream:   '#FDF8F0',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
