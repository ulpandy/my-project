/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
           50: '#F5F4FE',
        100: '#ECEBFD',
        200: '#D8D4FB',
        300: '#BEB6F8',
        400: '#A49AF4',
        500: '#8F87F1', // основной
        600: '#7A6DE3',
        700: '#6358C7',
        800: '#4E44A8',
        900: '#3F378D',
      },
      secondary: {
        50: '#F9F3FE',
        100: '#F1E4FD',
        200: '#E3C9FA',
        300: '#D1A6F7',
        400: '#BF85F4',
        500: '#C68EFD', // основной
        600: '#AD72DE',
        700: '#8C59BA',
        800: '#6D4193',
        900: '#583578',
      },
      accent: {
        50: '#FFF7FC',
        100: '#FFEAF7',
        200: '#FFD6F1',
        300: '#FFB9EA',
        400: '#FE9EE2',
        500: '#E9A5F1', // основной
        600: '#D186D7',
        700: '#AD65B3',
        800: '#8B4B8F',
        900: '#6F3C73',
      },
      success: {
        50: '#FFF9FA',
        100: '#FFEFF1',
        200: '#FFD9DE',
        300: '#FFBFC8',
        400: '#FFA6B3',
        500: '#FED2E2', // основной
        600: '#E6B3C5',
        700: '#C191A2',
        800: '#9E707F',
        900: '#805963',
      },
      warning: {
        50: '#FFFEFC',
        100: '#FFF8F5',
        200: '#FFEFE6',
        300: '#FFE3D3',
        400: '#FFD7C1',
        500: '#FDFAF6', // основной
        600: '#E5E1DD',
        700: '#C2BCB8',
        800: '#9F9794',
        900: '#827A78',
      },
      error: {
        50: '#FFF1F3',
        100: '#FFE1E6',
        200: '#FFC8CF',
        300: '#FFA1A9',
        400: '#FF7B85',
        500: '#FF5B69', // насыщенный акцент к палитре
        600: '#E34D5A',
        700: '#C03E49',
        800: '#9D303A',
        900: '#81252F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}