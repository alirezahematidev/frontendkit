import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), dts()],
  server: {
    port: 40002,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    lib: {
      formats: ['cjs', 'es'],
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        dynamicImportInCjs: true,
        globals: {
          react: 'React',
        },
      },
    },
  },
});
