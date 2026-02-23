/**
 * @fileoverview Singleton Proxy Server.
 * A zero-dependency HTTP and WebSocket proxy using native node:http.
 */
import http from 'node:http';
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

      req.pipe(proxyReq);
      proxyReq.on('error', () => {
        res.writeHead(502);
        res.end(`[Portlens] ${domain} is booting or unreachable.`);
      });
    });

    /**
     * @important WebSocket Support. 
     * Required for HMR (Hot Module Replacement) in Vite/Next.
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
      proxyReq.end();
    });

    // Binding to Port 80 requires sudo
    this.server.listen(80);
  }
}