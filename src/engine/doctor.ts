/**
 * @fileoverview Doctor Engine.
 * Performs diagnostics to ensure the local environment is capable of running Portlens.
 */
import { createServer } from 'node:net';
import { access, constants } from 'node:fs/promises';
import chalk from 'chalk';
import { OSFactory } from '../strategies/os';
import { isElevated } from '../utils/sudo';

export class PortlensDoctor {
  async diagnose() {
    console.log(chalk.bold('\n🩺 Portlens Diagnostic Report\n'));

    const checks = [
      this.checkPrivileges(),
      this.checkPort80(),
      this.checkHostsAccess(),
    ];

    const results = await Promise.all(checks);
    const hasFailures = results.some(r => r === false);

    if (hasFailures) {
      console.log(chalk.red.bold('\n✖ Some checks failed. Please resolve them to use Portlens.'));
    } else {
      console.log(chalk.green.bold('\n✔ All systems go! Your environment is ready.'));
    }
  }

  private async checkPrivileges() {
    const elevated = isElevated();
    this.report('Administrative Privileges', elevated, 'Run terminal as Admin/Sudo to bind Port 80.');
    return elevated;
  }

  private async checkPort80() {
    const isAvailable = await new Promise((resolve) => {
      const s = createServer();
      s.once('error', () => resolve(false));
      s.once('listening', () => s.close(() => resolve(true)));
      s.listen(80);
    });
    this.report('Port 80 Availability', isAvailable as boolean, 'Port 80 is occupied. Stop Apache/Nginx/IIS.');
    return isAvailable;
  }

  private async checkHostsAccess() {
    const os = OSFactory.create();
    const path = (os as any).getHostsPath?.() || '/etc/hosts';
    try {
      await access(path, constants.R_OK | constants.W_OK);
      this.report('Hosts File Permissions', true);
      return true;
    } catch {
      this.report('Hosts File Permissions', false, `Cannot write to ${path}.`);
      return false;
    }
  }

  private report(task: string, success: boolean, hint?: string) {
    const icon = success ? chalk.green('✔') : chalk.red('✖');
    console.log(`${icon} ${task}`);
    if (!success && hint) console.log(chalk.gray(`   └─ Hint: ${hint}`));
  }
}