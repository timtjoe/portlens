#!/usr/bin/env node
import chalk from "chalk";
import { SequentialPortStrategy } from "./strategies/ports";
import { OSFactory } from "./strategies/os";
import { FrameworkFactory } from "./strategies/frameworks";
import { ProxyEngine } from "./engine/proxy";
import { getProjectConfig } from "./engine/config";
import { ProcessRunner } from "./engine/runner";
import { PortlensDoctor } from "./engine/doctor";
import { ChildProcess } from "node:child_process";

async function bootstrap() {
  const rawArgs = process.argv.slice(2);

  if (rawArgs.includes("doctor")) {
    await new PortlensDoctor().diagnose();
    process.exit(0);
  }

  let child: ChildProcess | null = null;
  let currentDomain: string | null = null;
  const os = OSFactory.create();

  const cleanup = async () => {
    if (currentDomain) await os.unmapDomain(currentDomain).catch(() => {});
    if (child) child.kill();
    process.exit();
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  try {
    const [firstArg, ...restArgs] = rawArgs;
    let manualName: string | undefined;
    let customCommand: string[] = [];

    if (firstArg && !firstArg.startsWith("-")) {
      manualName = firstArg;
      customCommand = restArgs;
    }

    const { name: configName, suffix } = await getProjectConfig();
    currentDomain = `${manualName || configName}${suffix}`;

    const port = await new SequentialPortStrategy().findAvailablePort(4000, 4999);
    await os.mapDomain(currentDomain);
    
    ProxyEngine.getInstance().start({ host: "127.0.0.1", port }, currentDomain);

    let executable: string;
    let args: string[];

    if (customCommand.length > 0) {
      // @hack Non-null assertion (!) is safe here because customCommand.length > 0
      executable = customCommand[0]!; 
      args = customCommand.slice(1);
    } else {
      const framework = FrameworkFactory.create();
      executable = "npm";
      args = ["run", "dev", "--", ...framework.getArgs(port)];
    }

    console.log(`
${chalk.cyan.bold("🔭 Portlens v1.1")}
${chalk.green("✔")} Domain:   ${chalk.bold(`http://${currentDomain}`)}
${chalk.green("✔")} Internal: ${chalk.gray(`localhost:${port}`)}
${chalk.green("✔")} Command:  ${chalk.yellow([executable, ...args].join(" "))}
    `);

    child = ProcessRunner.execute(executable, args, port);

    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.log(chalk.red(`\n✖ Process exited with code ${code}`));
      }
      cleanup();
    });

  } catch (err: any) {
    console.error(chalk.red(`\n✖ Fatal Error: ${err.message}`));
    await cleanup();
    process.exit(1);
  }
}

bootstrap();