/**
 * @fileoverview Doctor Engine.
 * Performs diagnostics and provides automatic repairs for port conflicts.
 */
import { createServer } from 'node:net';
import { access, constants } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import readline from 'node:readline/promises';
import chalk from 'chalk';
import { OSFactory } from '../strategies/os';
import { isElevated } from '../utils/sudo';

export class PortlensDoctor {
  async diagnose() {
    console.log(chalk.bold('\n🩺 Portlens Diagnostic Report\n'));

    const privileges = await this.checkPrivileges();
    const port80 = await this.checkPort80();
    const hosts = await this.checkHostsAccess();

    const results = [privileges, port80, hosts];
    const hasFailures = results.some((r) => r === false);

    if (!port80 && privileges && hosts) {
      await this.offerPortRepair();
    }

    if (hasFailures) {
      console.log(chalk.red.bold('\n✖ Some checks failed. Please resolve them to use Portlens.'));
    } else {
      console.log(chalk.green.bold('\n✔ All systems go! Your environment is ready.'));
    }
  }

  /**
   * @hack Interactive repair using native readline to avoid external prompt dependencies.
   */
  private async offerPortRepair() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(chalk.cyan('\n🔧 Auto-Repair Available'));
    const answer = await rl.question(chalk.white('    Would you like Portlens to attempt to free Port 80? (y/n): '));
    rl.close();

    if (answer.toLowerCase() === 'y') {
      try {
        this.killProcessOnPort(80);
        console.log(chalk.green('    ✔ Port 80 has been cleared.'));
      } catch (err: any) {
        console.log(chalk.red('    ✖ Failed to clear port automatically.'));
        if (process.platform === 'win32') {
            console.log(chalk.gray('    └─ Note: For System (PID 4), you may need to run "net stop http /y" manually.'));
        }
      }
    }
  }

  private async checkPrivileges() {
    const elevated = isElevated();
    this.report('Administrative Privileges', elevated, 'Run terminal as Admin/Sudo to bind Port 80.');
    return elevated;
  }

  private async checkPort80() {
    const port = 80;
    const isAvailable = await new Promise((resolve) => {
      const s = createServer();
      s.once('error', () => resolve(false));
      s.once('listening', () => s.close(() => resolve(true)));
      s.listen(port);
    });

    let hint = 'Port 80 is occupied. Stop Apache/Nginx/IIS.';

    if (!isAvailable) {
      try {
        const occupier = this.getProcessOnPort(port);
        if (occupier) {
          hint = `Port 80 is occupied by "${occupier}".`;
        }
      } catch { /* fallback */ }
    }

    this.report('Port 80 Availability', isAvailable as boolean, hint);
    return isAvailable as boolean;
  }

  /**
   * @hack Internal helper to identify port squatters using native OS commands.
   * Special logic added to detect Windows System (PID 4) services.
   */
  private getProcessOnPort(port: number): string | null {
    try {
      if (process.platform === 'win32') {
        const pidCmd = `netstat -ano | findstr :${port} | findstr LISTENING`;
        const output = execSync(pidCmd, { encoding: 'utf8' }).trim();
        const pid = output.split(/\s+/).pop();
        
        if (pid === '4') return 'System (IIS/HTTP.sys)';
        
        if (pid) {
          return execSync(`tasklist /FI "PID eq ${pid}" /NH`, { encoding: 'utf8' })
            .split(/\s+/)[1] || `PID ${pid}`;
        }
      } else {
        const cmd = `lsof -i :${port} -sTCP:LISTEN -t`;
        const pid = execSync(cmd, { encoding: 'utf8' }).trim();
        if (pid) {
          return execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8' }).trim();
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * @hack Aggressively terminates the process holding a specific port.
   * @important PID 4 on Windows cannot be killed via taskkill. We attempt to stop 
   * the web publishing and http services instead.
   */
  private killProcessOnPort(port: number) {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8' });
      const pid = output.trim().split(/\s+/).pop();
      
      if (pid === '4') {
        // Attempt to stop the services that usually hold Port 80 on Windows
        execSync('net stop w3svc /y', { stdio: 'ignore' });
        execSync('net stop http /y', { stdio: 'ignore' });
      } else if (pid) {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      }
    } else {
      const pid = execSync(`lsof -i :${port} -sTCP:LISTEN -t`, { encoding: 'utf8' }).trim();
      if (pid) execSync(`sudo kill -9 ${pid}`);
    }
  }

  private async checkHostsAccess() {
    const os = OSFactory.create();
    const path = (os as any).hostsPath || '/etc/hosts';
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
    if (!success && hint) console.log(chalk.gray(`    └─ Hint: ${hint}`));
  }
}