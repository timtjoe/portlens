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
    /**
     * @important Windows Privilege Check.
     * The 'net session' command is a lightweight way to check for Admin rights
     * because it requires an elevated token to execute successfully.
     */
    try {
      execSync('net session', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @hack Unix Root Check.
   * On Unix-like systems, a User ID (UID) of 0 is strictly reserved for the 
   * root user. We use optional chaining for environments where getuid might 
   * be undefined (though rare in Node.js).
   */
  return process.getuid?.() === 0;
}