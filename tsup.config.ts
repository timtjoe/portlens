import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  minify: true,
  target: 'node20',
  shims: true, 
  // @important Force shebang for CLI execution
  banner: {
    js: '#!/usr/bin/env node',
  },
});