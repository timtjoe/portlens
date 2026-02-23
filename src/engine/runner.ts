/**
 * @fileoverview Process Runner.
 * Spawns the development command (npm run dev) and injects the port.
 */
import { spawn } from 'node:child_process';

export function startDevServer(port: number, args: string[]) {
  const fullArgs = ['run', 'dev', '--', ...args];
  
  const child = spawn('npm', fullArgs, {
    stdio: 'inherit',
    env: { ...process.env, PORT: port.toString() }
  });

  process.on('SIGINT', () => {
    child.kill();
    process.exit();
  });
}