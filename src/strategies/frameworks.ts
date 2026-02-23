/**
 * @fileoverview Framework Injection Strategy.
 * Ensures flags like --port and --host are injected for frameworks that ignore ENV variables.
 */
import { existsSync } from 'node:fs';

export interface FrameworkStrategy {
  id: string;
  getArgs: (port: number) => string[];
}

class ViteStrategy implements FrameworkStrategy {
  id = 'vite';
  getArgs = (port: number) => ['--port', port.toString(), '--host', '127.0.0.1', '--strictPort'];
}

class NextStrategy implements FrameworkStrategy {
  id = 'next';
  getArgs = () => []; // Next.js respects process.env.PORT
}

class GenericStrategy implements FrameworkStrategy {
  id = 'generic';
  getArgs = () => [];
}

export class FrameworkFactory {
  static create(): FrameworkStrategy {
    if (existsSync('vite.config.ts') || existsSync('vite.config.js')) return new ViteStrategy();
    if (existsSync('next.config.js') || existsSync('next.config.mjs')) return new NextStrategy();
    return new GenericStrategy();
  }
}