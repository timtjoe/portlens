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
   * * @important Race Condition Strategy.
   * While a port could technically be grabbed by another process between this check 
   * and the actual app start, we mitigate this by using a wide range (1000 ports) 
   * and prioritizing local loopback (127.0.0.1) binding.
   */
  async findAvailablePort(start: number, end: number): Promise<number> {
    for (let port = start; port <= end; port++) {
      const isAvailable = await new Promise((resolve) => {
        const server = createServer();

        /**
         * @hack Socket Detachment.
         * We use server.unref() to ensure this check does not keep the Node.js 
         * event loop active if the promise takes longer than expected to resolve.
         */
        server.unref(); 

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