/**
 * @fileoverview Central type definitions for Portlens.
 * High-level interfaces to ensure type safety across strategies and engines.
 */

export interface NetAddress {
  port: number;
  host: string;
}

export interface PortlensConfig {
  domain: string;
  targetPort: number;
  framework: string;
}

/**
 * Custom error class for better error tracking in the CLI.
 */
export class PortlensError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'PortlensError';
  }
}