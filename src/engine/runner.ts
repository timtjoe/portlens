/**
 * @fileoverview Process Runner.
 * Manages the lifecycle of the development command.
 */
import { spawn, ChildProcess } from 'node:child_process';

export class ProcessRunner {
  /**
   * Spawns the dev server and handles path resolution.
   * @hack 'shell: true' is critical for Windows to resolve .cmd/.ps1 binaries.
   */
  static execute(executable: string, args: string[], port: number): ChildProcess {
    return spawn(executable, args, {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        PORT: port.toString() 
      },
      shell: true,
    });
  }
}