import { config } from '../config.js';
import { syncFixtures } from '../services/syncService.js';
import { seedFixtures } from '../services/seedService.js';

const result = config.football.apiKey
  ? await syncFixtures()
  : await seedFixtures();

console.log(config.football.apiKey ? 'API sync završen:' : 'Seed završen:', result);
process.exit(0);
