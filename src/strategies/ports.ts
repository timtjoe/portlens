/**
 * @fileoverview Port Management Strategy.
 * Implements a scanning mechanism to find available ports in the 4000-4999 range.
 */
import { createServer } from 'node:net';
import { PortlensError } from '../utils/types';

export interface PortStrategy {
  findAvailablePort(start: number, end: number): Promise<number>;
}

export class SequentialPortStrategy implements PortStrategy {
  /**
   * Scans for a free port by attempting to bind a temporary server.
   * @bug Potential Race Condition: Another process could grab the port 
   * between the check and the actual app start. 
   * @solution We keep the range wide to minimize collisions.
   */
  async findAvailablePort(start: number, end: number): Promise<number> {
    for (let port = start; port <= end; port++) {
      const isAvailable = await new Promise((resolve) => {
        const server = createServer();
        server.unref(); // Don't let this keep the process alive
        server.on('error', () => resolve(false));
        server.listen(port, '127.0.0.1', () => {
          server.close(() => resolve(true));
        });
      });
      if (isAvailable) return port;
    }
    throw new PortlensError('ERR_NO_PORT', `No free ports found in range ${start}-${end}`);
  }
}