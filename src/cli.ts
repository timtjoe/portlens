#!/usr/bin/env node
import chalk from "chalk";
import { SequentialPortStrategy } from "./strategies/ports";
import { OSFactory } from "./strategies/os";
import { FrameworkFactory } from "./strategies/frameworks";
import { ProxyEngine } from "./engine/proxy";
import { getProjectConfig } from "./engine/config";
import { spawn } from "node:child_process";
import { PortlensDoctor } from "./engine/doctor";

async function bootstrap() {
  const rawArgs = process.argv.slice(2);

  if (rawArgs.includes("doctor")) {
    await new PortlensDoctor().diagnose();
    process.exit(0);
  }

  try {
    let manualName: string | undefined;
    let customCommand: string[] = [];

    // Destructure first element to satisfy strict null checks
    const [firstArg, ...restArgs] = rawArgs;

    if (firstArg && !firstArg.startsWith("-")) {
      manualName = firstArg;
      customCommand = restArgs;
    }

    const { name: configName, suffix } = await getProjectConfig();
    const domain = `${manualName || configName}${suffix}`;

    const port = await new SequentialPortStrategy().findAvailablePort(
      4000,
      4999,
    );

    const os = OSFactory.create();
    await os.mapDomain(domain);

    ProxyEngine.getInstance().start({ host: "127.0.0.1", port }, domain);

    const framework = FrameworkFactory.create();
    let commandToSpawn: string;
    let commandArgs: string[];

    if (customCommand.length > 0) {
      // HACK: We assume the first index of customCommand is the executable.
      // Array destructuring here ensures TS knows commandToSpawn isn't undefined.
      const [executable, ...args] = customCommand;
      commandToSpawn = executable!;
      commandArgs = args;
    } else {
      commandToSpawn = "npm";
      commandArgs = ["run", "dev", "--", ...framework.getArgs(port)];
    }

    console.log(`
${chalk.cyan.bold("🔭 Portlens v1.1")}
${chalk.green("✔")} Domain:   ${chalk.bold(`http://${domain}`)}
${chalk.green("✔")} Internal: ${chalk.gray(`localhost:${port}`)}
${chalk.green("✔")} Command:  ${chalk.yellow([commandToSpawn, ...commandArgs].join(" "))}
    `);

    const child = spawn(commandToSpawn, commandArgs, {
      stdio: "inherit",
      env: { ...process.env, PORT: port.toString() },
      shell: true, // Required for Windows PATH resolution of 'npm' and 'bun'
    });

    process.on("SIGINT", () => {
      child.kill();
      process.exit(0);
    });

    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.log(chalk.red(`\n✖ Process exited with code ${code}`));
      }
      process.exit(code || 0);
    });
  } catch (err: any) {
    console.error(chalk.red(`\n✖ Fatal Error: ${err.message}`));
    process.exit(1);
  }
}

bootstrap();
