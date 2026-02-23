import { execSync } from "node:child_process";
import { describe, it, expect } from "vitest";
import path from "node:path";
import { existsSync } from "node:fs";

describe("CLI Integration", () => {
  // Path to the bundled CLI file
  const cliPath = path.resolve(import.meta.dirname, "../../dist/cli.js");

  /**
   * @hack Node.js ESM Shebang Fix
   * On some environments, calling 'node cli.js' fails if the file has a shebang.
   * We use the '--no-warnings' flag which helps Node handle the entry point more gracefully.
   */
  it("should display the doctor output correctly", () => {
    const output = execSync(`node --no-warnings "${cliPath}" doctor`, {
      encoding: "utf8",
    });
    expect(output).toContain("Diagnostic Report");
    expect(output).toContain("Administrative Privileges");
    expect(output).toContain("Port 80 Availability");
    expect(output).toContain("Hosts File Permissions");
  });

  /**
   * NEW: Wrapper Mode Test
   * Verifies that 'portlens my-app echo hello' correctly sets the domain
   * and executes the trailing command.
   */
  it("should accept a custom name and execute a wrapper command", () => {
    // We use 'echo' because it's a built-in command that finishes quickly
    const output = execSync(
      `node --no-warnings "${cliPath}" manual-test-app echo "ProcessStarted"`,
      {
        env: { ...process.env, NODE_ENV: "test" },
        encoding: "utf8",
      }
    );

    // Verify the domain was overridden
    expect(output).toContain("http://manual-test-app.localhost");
    // Verify the custom command was identified
    expect(output).toContain("Command:   echo ProcessStarted");
    // Verify the spawned process actually ran
    expect(output).toContain("ProcessStarted");
  });

  /**
   * @hack Error Handling
   * Captures the process failure when no project is detected.
   * We use 'node --no-warnings' to ensure the shebang doesn't trigger a SyntaxError before our code runs.
   */
  it("should fail with a helpful error when run outside a project without arguments", () => {
    try {
      // Run in a directory with no package.json/portlens.json
      // On Windows, the root is usually safe, on Unix we use /tmp
      const rootDir = process.platform === "win32" ? "C:\\" : "/tmp";
      
      execSync(`node --no-warnings "${cliPath}"`, { 
        cwd: rootDir, 
        stdio: "pipe",
        encoding: "utf8"
      });
    } catch (error: any) {
      const output = (error.stdout || "") + (error.stderr || "");
      expect(output).toContain("Fatal Error");
      expect(output).toContain("No project detected");
    }
  });
});