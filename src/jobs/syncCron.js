import cron from 'node-cron';
import { config } from '../config.js';
import { syncFixtures } from '../services/syncService.js';

export function startSyncCron() {
  if (!config.cron.enabled) {
    console.log('Cron sync isključen (ENABLE_CRON=false)');
    return;
  }

  if (!config.footballData.token && !config.football.apiKey) {
    console.log('Cron sync preskočen — podesi FOOTBALL_DATA_TOKEN ili API_FOOTBALL_KEY');
    return;
  }

  cron.schedule(config.cron.schedule, async () => {
    try {
      console.log(`[${new Date().toISOString()}] Pokrećem sync utakmica...`);
      const result = await syncFixtures();
      console.log(`Sync završen: ${result.upserted} utakmica, ${result.scored} prognoza bodovano`);
    } catch (error) {
      console.error('Sync greška:', error.message);
    }
  });

  console.log(`Cron sync aktivan: ${config.cron.schedule}`);
}
