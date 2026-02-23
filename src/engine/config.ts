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
  /**
   * @important Strict Project Validation.
   * To prevent Portlens from running in arbitrary directories (like System32),
   * we mandate the presence of a project manifest.
   */
  const hasConfig = existsSync("portlens.json") || existsSync("routes.json");
  const hasPkg = existsSync("package.json");

  if (!hasConfig && !hasPkg) {
    throw new Error(
      "No project detected (missing package.json or portlens.json)",
    );
  }

  let name: string | undefined;
  let suffix = ".localhost";

  /**
   * @important Configuration Priority.
   * Explicit Portlens configs always override generic package.json names.
   */
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
        // @hack Silently ignore malformed JSON to prevent the CLI from crashing 
        // during startup; we fall back to package.json or CWD instead.
      }
    }
  }

  // 3. Fallback to package.json name
  if (!name && hasPkg) {
    try {
      const content = await readFile("package.json", "utf-8");
      const data = JSON.parse(content);
      /**
       * @hack Scoped Package Handling.
       * If a package is named '@org/my-app', we extract just 'my-app' 
       * to create a valid, readable local domain.
       */
      name = data.name?.split("/").pop();
    } catch (e) {
      // Ignore
    }
  }

  // 4. Final resolve
  const finalName = name || process.cwd().split(/[\\/]/).pop() || "app";

  return { name: finalName, suffix };
}