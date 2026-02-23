import { describe, it, expect, vi, beforeEach } from "vitest";
import { existsSync } from "node:fs";
import { FrameworkFactory } from "../../src/strategies/frameworks";

// Mock the filesystem
vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}));

describe("FrameworkFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return ViteStrategy when vite.config.ts is present", () => {
    // Force existsSync to return true ONLY for the vite config file
    (existsSync as any).mockImplementation(
      (path: string) => path === "vite.config.ts",
    );

    const strategy = FrameworkFactory.create();
    expect(strategy.id).toBe("vite");
  });

  it("should return GenericStrategy when no config files exist", () => {
    (existsSync as any).mockReturnValue(false);

    const strategy = FrameworkFactory.create();
    expect(strategy.id).toBe("generic");
  });
});
