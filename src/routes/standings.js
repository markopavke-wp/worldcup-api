import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { config } from '../config.js';
import { getCachedStandings } from '../services/syncService.js';
import { getStandingsFromDb } from '../services/standingsService.js';

const router = Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    let standings = [];

    if (config.football.apiKey) {
      standings = await getCachedStandings();
    }

    if (!standings.length) {
      standings = await getStandingsFromDb();
    }

    res.json({ standings });
  } catch (err) {
    next(err);
  }
});

export default router;
