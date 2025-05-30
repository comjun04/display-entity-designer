import react from '@vitejs/plugin-react-swc'
import { execSync } from 'child_process'
import { resolve } from 'path'
import { defineConfig } from 'vite'

import packageJson from './package.json'

const commitHash = execSync('git rev-parse --short HEAD').toString()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
    ],
  },
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __IS_DEV__: process.env.NODE_ENV === 'development',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          threejs: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
    chunkSizeWarningLimit: 700, // 700 KB
  },
})
