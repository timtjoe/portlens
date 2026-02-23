import { it, expect, describe } from 'vitest';
import { SequentialPortStrategy } from '../strategies/ports';
import { createServer } from 'node:net';

describe('SequentialPortStrategy', () => {
  it('should find the next available port if one is blocked', async () => {
    const blocker = createServer();
    blocker.listen(4000);
    
    const strategy = new SequentialPortStrategy();
    const port = await strategy.findAvailablePort(4000, 4005);
    
    expect(port).toBe(4001);
    blocker.close();
  });
});