const elementsSizes = {
  xs: '24px',
  sm: '32px',
  base: '50px',
  lg: '60px',
  xl: '72px',
}

const headingStyles = {
  fontWeight: '500',
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    screens: {
      xs: 420 + 29.98 + 'px',
      sm: 580 + 29.98 + 'px',
      md: 720 + 29.98 + 'px',
      lg: 1170 + 29.98 + 'px',
      xl: 1366 + 29.98 + 'px',
    },
    container: {
      xs: 420 + 'px',
      sm: 580 + 'px',
      md: 720 + 'px',
      lg: 920 + 'px',
      xl: 1170 + 'px',
    },
    colors: {
      primary: '#b71540',
      sec: '#CE9B44',
      blue: '#2980b9',
      red: '#c0392b',
      green: '#27ae60',
      yellow: '#f39c12',
      gray: '#333',
      white: '#fff',
      black: '#000',
    },
    fontFamily: {
      base: 'var(--font-base)',
      alt: 'var(--font-alt)',
    },
    zIndex: [0, 321, 322, 323, 324, 325, 326, 327, 328, 329, 'auto'],
    extend: {
      inputSize: elementsSizes,
      btnSize: elementsSizes,
      backgroundColor: {
        l1: 'var(--bg1)',
        l2: 'var(--bg2)',
        l3: 'var(--bg3)',
      },
      fontSize: {
        '1.5xl': ['1.375rem', '1.35'],
        '2.1xl': ['1.5625rem', '1.35'],
        '2.5xl': ['1.75rem', '1.35'],
        '3.5xl': ['2rem', '1.35'],
        '4.5xl': ['2.5rem', '1.35'],
      },
      spacing: {
        15: '3.75rem',
        18: '4.5rem',
      },
    },
  },
  plugins: [
    require('@qpokychuk/tailwind-button-plugin'),
    require('@qpokychuk/tailwind-ratio-plugin'),
    require('./tailwind.form.js'),
  ],
}
