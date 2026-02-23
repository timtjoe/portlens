/**
 * @fileoverview Framework Injection Strategy.
 * Detects the underlying web framework and provides specific CLI arguments 
 * to ensure the dev server binds correctly to the Portlens-assigned port.
 */
import { existsSync } from "node:fs";

export interface FrameworkStrategy {
  id: string;
  getArgs: (port: number) => string[];
}

export class ViteStrategy implements FrameworkStrategy {
  id = "vite";
  /**
   * @important Vite Port Locking.
   * We use '--strictPort' to prevent Vite from automatically choosing the next 
   * available port if ours is busy, which would break the Proxy link.
   */
  getArgs = (port: number) => [
    "--port",
    port.toString(),
    "--host",
    "127.0.0.1",
    "--strictPort",
  ];
}

export class NextStrategy implements FrameworkStrategy {
  id = "next";
  /**
   * @hack Next.js Port Injection.
   * Next.js respects the 'PORT' environment variable over CLI arguments in many 
   * configurations, so we return an empty array and rely on the Runner's ENV injection.
   */
  getArgs = (_port: number) => [];
}

export class GenericStrategy implements FrameworkStrategy {
  id = "generic";
  getArgs = (_port: number) => [];
}

export class FrameworkFactory {
  /**
   * @important Framework Detection.
   * We detect the framework based on its specific configuration file footprint.
   */
  static create(): FrameworkStrategy {
    if (existsSync("vite.config.ts") || existsSync("vite.config.js"))
      return new ViteStrategy();
    if (existsSync("next.config.js") || existsSync("next.config.mjs"))
      return new NextStrategy();
    
    return new GenericStrategy();
  }
}