import { config } from '../config.js';
import { syncFixtures } from '../services/syncService.js';
import { seedFixtures } from '../services/seedService.js';

const result = config.footballData.token || config.football.apiKey
  ? await syncFixtures()
  : await seedFixtures();

const label = result.source || (config.footballData.token || config.football.apiKey ? 'sync' : 'seed');
console.log(`${label} završen:`, result);
process.exit(0);
