import { describe, it, expect, vi, beforeEach } from "vitest";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { getProjectConfig } from "../../src/engine/config";

vi.mock("node:fs", () => ({ existsSync: vi.fn() }));
vi.mock("node:fs/promises", () => ({ readFile: vi.fn() }));

describe("Config Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use the name from portlens.json if it exists", async () => {
    (existsSync as any).mockImplementation(
      (path: string) => path === "portlens.json",
    );
    (readFile as any).mockResolvedValue(JSON.stringify({ name: "custom-app" }));

    const config = await getProjectConfig();
    expect(config.name).toBe("custom-app");
  });
});
