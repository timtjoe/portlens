/**
 * @fileoverview Singleton Proxy Server.
 * A zero-dependency HTTP and WebSocket proxy using native node:http.
 */
import http from 'node:http';
import chalk from 'chalk';
import type { NetAddress } from '../utils/types';

export class ProxyEngine {
  private static instance: ProxyEngine;
  private server?: http.Server;

  private constructor() {}

  static getInstance(): ProxyEngine {
    if (!ProxyEngine.instance) ProxyEngine.instance = new ProxyEngine();
    return ProxyEngine.instance;
  }

  start(target: NetAddress, domain: string) {
    this.server = http.createServer((req, res) => {
      // @hack Internal function for recursive retries to allow target framework boot time.
      const attemptProxy = (retries = 5) => {
        const proxyReq = http.request({
          hostname: target.host,
          port: target.port,
          path: req.url,
          method: req.method,
          headers: req.headers
        }, (proxyRes) => {
          res.writeHead(proxyRes.statusCode!, proxyRes.headers);
          proxyRes.pipe(res);
        });

        proxyReq.on('error', () => {
          if (retries > 0) {
            setTimeout(() => attemptProxy(retries - 1), 500);
          } else {
            res.writeHead(502);
            res.end(`[Portlens] ${domain} is booting or unreachable.`);
          }
        });

        req.pipe(proxyReq);
      };

      attemptProxy();
    });

    /**
     * @important WebSocket Support. 
     * Handles HMR (Hot Module Replacement) upgrades for Vite/Next.
     */
    this.server.on('upgrade', (req, socket, head) => {
      const proxyReq = http.request({
        hostname: target.host,
        port: target.port,
        method: 'GET',
        headers: req.headers
      });

      proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
        socket.write(proxyHead);
        proxySocket.pipe(socket).pipe(proxySocket);
      });

      proxyReq.on('error', () => socket.destroy());
      proxyReq.end();
    });

    // @hack Port 0 in test mode lets the OS pick a free port, avoiding EACCES/EADDRINUSE.
    const primaryPort = process.env.NODE_ENV === 'test' ? 0 : 80;
    const fallbackPorts = [8080, 8888, 0];

    const listen = (port: number) => {
      this.server?.listen(port);
    };

    this.server.on('error', (err: any) => {
      if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
        const next = fallbackPorts.shift();
        
        if (next !== undefined) {
          // @hack Visual feedback so the user knows why their URL might need a port suffix.
          if (process.env.NODE_ENV !== 'test') {
            console.log(chalk.yellow(`⚠ Port ${err.port} busy or restricted. Trying fallback port ${next}...`));
          }
          listen(next);
        } else {
          console.error(`\n✖ Permission Denied: Cannot bind to Port ${primaryPort}.`);
          console.error(`  └─ Hint: Portlens needs sudo/administrator rights to use Port 80.\n`);
          process.exit(1);
        }
      } else {
        console.error(`\n✖ Proxy Error: ${err.message}`);
        process.exit(1);
      }
    });

    listen(primaryPort);
  }
}