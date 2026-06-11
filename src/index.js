import { createApp } from './app.js';
import { config } from './config.js';
import { startSyncCron } from './jobs/syncCron.js';
import { ensureMatchesSeeded } from './services/seedService.js';

const app = createApp();

app.listen(config.port, async () => {
  console.log(`World Cup API pokrenut na portu ${config.port}`);
  try {
    const seedResult = await ensureMatchesSeeded();
    if (seedResult.skipped) {
      console.log(`Utakmice već u bazi (${seedResult.count})`);
    } else {
      console.log(`Utakmice učitane (${seedResult.source}):`, seedResult);
    }
  } catch (error) {
    console.error('Učitavanje utakmica nije uspelo:', error.message);
  }
  startSyncCron();
});
