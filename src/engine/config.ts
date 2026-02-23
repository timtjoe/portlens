/**
 * @fileoverview Configuration Loader.
 * Reads local project settings to determine the desired .localhost name.
 * Supports custom configuration via portlens.json or routes.json.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export interface PortlensUserConfig {
  name?: string;
  suffix?: '.localhost' | '.test' | '.demo';
}

export async function getProjectConfig(): Promise<{ name: string; suffix: string }> {
  let name: string | undefined;
  let suffix = '.localhost';

  // 1. Check for portlens.json or routes.json (Highest Priority)
  const configFiles = ['portlens.json', 'routes.json'];
  for (const file of configFiles) {
    if (existsSync(file)) {
      try {
        const content = await readFile(file, 'utf-8');
        const data = JSON.parse(content);
        name = data.name;
        if (data.suffix) suffix = data.suffix;
        break; 
      } catch (e) {
        // Silently ignore malformed JSON and move to next fallback
      }
    }
  }

  // 2. Fallback to package.json name
  if (!name && existsSync('package.json')) {
    try {
      const content = await readFile('package.json', 'utf-8');
      const data = JSON.parse(content);
      // Handle scoped packages like @org/my-app -> my-app
      name = data.name?.split('/').pop();
    } catch (e) {
      // Ignore
    }
  }

  // 3. Last resort: Current Working Directory name
  const finalName = name || process.cwd().split(/[\\/]/).pop() || 'app';

  return { name: finalName, suffix };
}