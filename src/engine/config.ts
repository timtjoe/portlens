/**
 * @fileoverview Configuration Loader.
 * Reads local project settings to determine the desired .localhost name.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

export interface PortlensUserConfig {
  name?: string;
  suffix?: ".localhost" | ".test" | ".demo";
}

export async function getProjectConfig(): Promise<{
  name: string;
  suffix: string;
}> {
  // 1. Strict Project Check
  // We only consider it a "project" if it has a config file or a package.json
  const hasConfig = existsSync("portlens.json") || existsSync("routes.json");
  const hasPkg = existsSync("package.json");

  if (!hasConfig && !hasPkg) {
    throw new Error(
      "No project detected (missing package.json or portlens.json)",
    );
  }

  let name: string | undefined;
  let suffix = ".localhost";

  // 2. Check for portlens.json or routes.json (Highest Priority)
  const configFiles = ["portlens.json", "routes.json"];
  for (const file of configFiles) {
    if (existsSync(file)) {
      try {
        const content = await readFile(file, "utf-8");
        const data = JSON.parse(content);
        name = data.name;
        if (data.suffix) suffix = data.suffix;
        break;
      } catch (e) {
        // Ignore malformed JSON
      }
    }
  }

  // 3. Fallback to package.json name
  if (!name && hasPkg) {
    try {
      const content = await readFile("package.json", "utf-8");
      const data = JSON.parse(content);
      name = data.name?.split("/").pop();
    } catch (e) {
      // Ignore
    }
  }

  // 4. Final resolve
  const finalName = name || process.cwd().split(/[\\/]/).pop() || "app";

  return { name: finalName, suffix };
}
