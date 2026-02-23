import { describe, it, expect, afterAll } from "vitest";
import { createServer } from "node:net";
import { SequentialPortStrategy } from "../../src/strategies/ports";

describe("SequentialPortStrategy", () => {
  it("should find the next available port if 4000 is blocked", async () => {
    // 1. Block port 4000 manually
    const blocker = createServer();
    await new Promise((resolve) => blocker.listen(4000, "127.0.0.1", resolve));

    const strategy = new SequentialPortStrategy();
    const port = await strategy.findAvailablePort(4000, 4005);

    // 2. It should skip 4000 and return 4001
    expect(port).toBe(4001);

    // Cleanup
    await new Promise((resolve) => blocker.close(resolve));
  });
});
