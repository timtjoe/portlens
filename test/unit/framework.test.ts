import { describe, it, expect } from "vitest";
// Assuming your file is named framework.ts
import { ViteStrategy, NextStrategy, GenericStrategy } from "../../src/strategies/frameworks";

describe("Framework Strategies", () => {
  it("ViteStrategy should return correct CLI flags", () => {
    const strategy = new ViteStrategy();
    const args = strategy.getArgs(5173);
    expect(args).toEqual([
      "--port",
      "5173",
      "--host",
      "127.0.0.1",
      "--strictPort",
    ]);
  });

  it("NextStrategy should return empty args (uses ENV)", () => {
    const strategy = new NextStrategy();
    expect(strategy.getArgs(3000)).toEqual([]);
  });

  it("GenericStrategy should return empty args", () => {
    const strategy = new GenericStrategy();
    expect(strategy.getArgs(8080)).toEqual([]);
  });
});
