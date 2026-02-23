import { execSync } from "node:child_process";
import { describe, it, expect } from "vitest";
import path from "node:path";
import { existsSync } from "node:fs";

describe("CLI Integration", () => {
  const cliPath = path.resolve(import.meta.dirname, "../../dist/cli.js");

  it("should display the doctor output correctly", () => {
    const output = execSync(`node "${cliPath}" doctor`).toString();
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
      `node "${cliPath}" manual-test-app echo "ProcessStarted"`,
      {
        env: { ...process.env, NODE_ENV: "test" },
      },
    ).toString();

    // Verify the domain was overridden
    expect(output).toContain("http://manual-test-app.localhost");
    // Verify the custom command was identified
    expect(output).toContain("Command:  echo ProcessStarted");
    // Verify the spawned process actually ran
    expect(output).toContain("ProcessStarted");
  });

  it("should fail with a helpful error when run outside a project without arguments", () => {
    try {
      // Run in root or a temp dir with no package.json/portlens.json
      execSync(`node "${cliPath}"`, { cwd: path.resolve("/"), stdio: "pipe" });
    } catch (error: any) {
      const output = error.stdout?.toString() + error.stderr?.toString();
      expect(output).toContain("Fatal Error");
      expect(output).toContain("No project detected");
    }
  });
});
