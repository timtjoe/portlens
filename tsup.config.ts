import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  minify: true,
  target: 'node20',
  shims: true,
  // @important Ensure the shebang is the VERY first line with no leading whitespace
  banner: {
    js: '#!/usr/bin/env node',
  },
});