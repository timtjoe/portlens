/**
 * @fileoverview Framework Injection Strategy.
 */
import { existsSync } from "node:fs";

export interface FrameworkStrategy {
  id: string;
  getArgs: (port: number) => string[];
}

export class ViteStrategy implements FrameworkStrategy {
  id = "vite";
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
  getArgs = (_port: number) => [];
}

export class GenericStrategy implements FrameworkStrategy {
  id = "generic";
  getArgs = (_port: number) => [];
}

export class FrameworkFactory {
  static create(): FrameworkStrategy {
    if (existsSync("vite.config.ts") || existsSync("vite.config.js"))
      return new ViteStrategy();
    if (existsSync("next.config.js") || existsSync("next.config.mjs"))
      return new NextStrategy();
    return new GenericStrategy();
  }
}
