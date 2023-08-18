import path from 'node:path';
import { fileURLToPath } from 'node:url';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  input: {
    index: path.resolve(__dirname, 'src/index.ts'),
    cli: path.resolve(__dirname, 'src/cli.ts'),
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  output: {
    dir: path.resolve(__dirname, 'dist'),
    format: 'esm',
    sourcemap: false,
    sourcemapIgnoreList() {
      return true;
    },
  },
  external: ['prettier', 'fast-glob'],
});
