/**
 * @fileoverview OS-Specific Host Management.
 * Handles the mapping of custom domains to 127.0.0.1 across Windows, MacOS, and Linux.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { PortlensError } from '../utils/types';

export interface OSStrategy {
  mapDomain(domain: string): Promise<void>;
}

class WindowsStrategy implements OSStrategy {
  async mapDomain(domain: string): Promise<void> {
    const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
    try {
      const content = readFileSync(hostsPath, 'utf8');
      if (content.includes(domain)) return;

      /**
       * @hack Windows requires an elevated PowerShell process to write to the hosts file.
       * We spawn a temporary shell with 'RunAs' verb to trigger the UAC prompt.
       */
      const entry = `127.0.0.1 ${domain}`;
      const cmd = `powershell -Command "Start-Process cmd -ArgumentList '/c echo ${entry} >> ${hostsPath}' -Verb RunAs"`;
      execSync(cmd);
    } catch (e) {
      throw new PortlensError('ERR_WIN_PERMISSION', 'Administrator privileges required to modify Windows hosts file.');
    }
  }
}

class DarwinLinuxStrategy implements OSStrategy {
  async mapDomain(domain: string): Promise<void> {
    const hostsPath = '/etc/hosts';
    try {
      const content = readFileSync(hostsPath, 'utf8');
      if (content.includes(domain)) return;

      /**
       * @hack We use 'sudo tee -a' because it only requires the 'tee' command 
       * to have elevated permissions, rather than the entire Portlens process.
       */
      const cmd = `echo "127.0.0.1 ${domain}" | sudo tee -a ${hostsPath}`;
      execSync(cmd, { stdio: 'ignore' });
    } catch (e) {
      throw new PortlensError('ERR_PERMISSION', 'Elevated privileges required to modify /etc/hosts. Try: sudo portlens');
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