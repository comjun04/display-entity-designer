import { heroui } from '@heroui/theme'
import tailwindAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // https://www.heroui.com/docs/components/tooltip
    // For individual installation, please note that you should add ./node_modules/@heroui/theme/dist/components/popover.js to your tailwind.config.js file instead since tooltip reuses popover styles.
    '../../node_modules/@heroui/theme/dist/components/popover.js',
  ],
  theme: {},
  darkMode: 'class',
  plugins: [tailwindAnimate, heroui()],
}
