/**
 * @fileoverview Portlens CLI Orchestrator.
 * Standardizes the sequence of operations for a stable dev environment.
 */
import chalk from 'chalk';
import { SequentialPortStrategy } from './strategies/ports';
import { OSFactory } from './strategies/os';
import { FrameworkFactory } from './strategies/frameworks';
import { ProxyEngine } from './engine/proxy';
import { getProjectConfig } from './engine/config';
import { spawn } from 'node:child_process';
import { PortlensDoctor } from './engine/doctor';

async function bootstrap() {
  // Check for "doctor" command
  if (process.argv.includes('doctor')) {
    const doctor = new PortlensDoctor();
    await doctor.diagnose();
    process.exit(0);
  }
  try {
    // 1. Load configuration and determine domain
    const { name, suffix } = await getProjectConfig();
    const domain = `${name}${suffix}`;
    
    // 2. Identify a free internal port (Strategy Pattern)
    const portFinder = new SequentialPortStrategy();
    const port = await portFinder.findAvailablePort(4000, 4999);

    // 3. Map OS Domain (OS Strategy)
    const os = OSFactory.create();
    await os.mapDomain(domain);

    // 4. Start Proxy Engine (Singleton)
    const proxy = ProxyEngine.getInstance();
    proxy.start({ host: '127.0.0.1', port }, domain);

    // 5. Inject Framework-specific flags (Framework Strategy)
    const framework = FrameworkFactory.create();
    const flags = framework.getArgs(port);

    console.log(`
${chalk.cyan.bold('🔭 Portlens v1.0')}
${chalk.green('✔')} Domain:   ${chalk.bold(`http://${domain}`)}
${chalk.green('✔')} Internal: ${chalk.gray(`localhost:${port}`)}
${chalk.green('✔')} Strategy: ${chalk.yellow(framework.id)}
    `);

    /**
     * @important
     * We spawn the child process with 'shell: true' to ensure that PATH 
     * resolution for 'npm' works correctly across Windows and Unix.
     */
    const child = spawn('npm', ['run', 'dev', '--', ...flags], {
      stdio: 'inherit',
      env: { ...process.env, PORT: port.toString() },
      shell: true 
    });

    // Cleanup on exit
    process.on('SIGINT', () => {
      child.kill();
      process.exit(0);
    });

    // Handle unexpected child exit
    child.on('exit', (code) => {
      if (code !== 0) {
        console.log(chalk.red(`\n✖ Dev server exited with code ${code}`));
      }
      process.exit(code || 0);
    });

  } catch (err: any) {
    console.error(chalk.red(`\n✖ Fatal Error: ${err.message}`));
    process.exit(1);
  }
}

bootstrap();