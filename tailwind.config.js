/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Modern color scheme for UNI LOCATE
      colors: {
        // Primary brand colors - Modern Purple/Indigo gradient
        primary: {
          DEFAULT: '#8B5CF6', // Vibrant Purple
          dark: '#6D28D9', // Deep Purple
          light: '#A78BFA', // Light Purple
          lighter: '#C4B5FD', // Very Light Purple
        },
        // Secondary accent colors
        accent: {
          DEFAULT: '#06B6D4', // Cyan
          dark: '#0891B2',
          light: '#22D3EE',
        },
      },
      // Gradient backgrounds
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      },
    },
  },
  plugins: [],
}

