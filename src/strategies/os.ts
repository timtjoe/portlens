/**
 * @fileoverview OS-Specific Host Management.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { PortlensError } from '../utils/types';

export interface OSStrategy {
  mapDomain(domain: string): Promise<void>;
  unmapDomain(domain: string): Promise<void>;
}

class WindowsStrategy implements OSStrategy {
  private hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';

  async mapDomain(domain: string): Promise<void> {
    try {
      const content = readFileSync(this.hostsPath, 'utf8');
      if (content.includes(domain)) return;

      const entry = `127.0.0.1 ${domain}`;
      // @hack Windows requires an elevated PowerShell process to write to the hosts file via RunAs.
      const cmd = `powershell -Command "Start-Process cmd -ArgumentList '/c echo ${entry} >> ${this.hostsPath}' -Verb RunAs"`;
      execSync(cmd);
    } catch (e) {
      throw new PortlensError('ERR_WIN_PERMISSION', 'Administrator privileges required to modify Windows hosts file.');
    }
  }

  async unmapDomain(domain: string): Promise<void> {
    try {
      // @hack To remove a line on Windows, we read, filter, and overwrite the file using elevated PowerShell.
      const cmd = `powershell -Command "Start-Process powershell -ArgumentList '-Command \\"(Get-Content ${this.hostsPath}) -replace \\'127.0.0.1 ${domain}\\', \\'\\' | Set-Content ${this.hostsPath}\\"' -Verb RunAs"`;
      execSync(cmd);
    } catch (e) {
      // Silent fail on cleanup to avoid blocking process exit
    }
  }
}

class DarwinLinuxStrategy implements OSStrategy {
  private hostsPath = '/etc/hosts';

  async mapDomain(domain: string): Promise<void> {
    try {
      const content = readFileSync(this.hostsPath, 'utf8');
      if (content.includes(domain)) return;

      // @hack 'sudo tee -a' avoids requiring the entire Portlens process to be root.
      const cmd = `echo "127.0.0.1 ${domain}" | sudo tee -a ${this.hostsPath}`;
      execSync(cmd, { stdio: 'ignore' });
    } catch (e) {
      throw new PortlensError('ERR_PERMISSION', 'Elevated privileges required to modify /etc/hosts. Try: sudo portlens');
    }
  }

  async unmapDomain(domain: string): Promise<void> {
    try {
      // @hack Using sed with sudo to delete the specific domain entry line.
      const cmd = `sudo sed -i '' '/127.0.0.1 ${domain}/d' ${this.hostsPath} 2>/dev/null || sudo sed -i '/127.0.0.1 ${domain}/d' ${this.hostsPath}`;
      execSync(cmd, { stdio: 'ignore' });
    } catch (e) {
      // Silent fail on cleanup
    }
  }
}

export class OSFactory {
  static create(): OSStrategy {
    if (process.platform === 'win32') return new WindowsStrategy();
    if (['darwin', 'linux'].includes(process.platform)) return new DarwinLinuxStrategy();
    throw new PortlensError('ERR_OS_UNSUPPORTED', `Platform ${process.platform} is not supported.`);
  }
}