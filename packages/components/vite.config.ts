import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), dts()],
  server: {
    port: 40000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'node/cli': resolve(__dirname, 'src/node/cli.ts'),
      },
    },
    rollupOptions: {
      external: ['react', 'antd'],
      output: {
        inlineDynamicImports: false,
        dynamicImportInCjs: true,
        globals: {
          react: 'React',
        },
      },
    },
  },
})
