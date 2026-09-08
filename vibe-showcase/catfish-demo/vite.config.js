import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 展示页演示构建：挂在作品集展示壳的 /app-real/ 子路径下，
// 去掉 PWA（Service Worker 会和宿主站点冲突），base 指向子路径。
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
