import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  minify: true,
  target: 'node20',
  shims: true, // Injects __dirname/ __filename for ESM
});