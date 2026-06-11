import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { getLeaderboard } from '../services/scoringService.js';

const router = Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
});

export default router;
