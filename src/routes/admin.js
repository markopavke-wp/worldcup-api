import { Router } from 'express';
import { syncFixtures } from '../services/syncService.js';

const router = Router();

router.post('/sync', async (req, res, next) => {
  try {
    const adminKey = process.env.ADMIN_SYNC_KEY;
    if (adminKey && req.headers['x-admin-key'] !== adminKey) {
      return res.status(403).json({ error: 'Nedozvoljen pristup' });
    }

    const result = await syncFixtures();
    res.json({ message: 'Sinhronizacija završena', ...result });
  } catch (err) {
    next(err);
  }
});

export default router;
