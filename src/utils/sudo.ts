/**
 * @fileoverview Permission Utility.
 * Checks if the process can bind to privileged ports or write to system files.
 */
import { execSync } from 'node:child_process';

/**
 * Checks if the current process has administrative/root privileges.
 */
export function isElevated(): boolean {
  if (process.platform === 'win32') {
    try {
      execSync('net session', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
  return process.getuid?.() === 0;
}