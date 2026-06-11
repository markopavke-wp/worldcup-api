import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/:userId/predictions', authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true, displayName: true },
    });

    if (!user) return res.status(404).json({ error: 'Igrač nije pronađen' });

    const predictions = await prisma.prediction.findMany({
      where: {
        userId: user.id,
        match: { status: 'FINISHED' },
      },
      include: { match: true },
    });

    predictions.sort(
      (a, b) => new Date(b.match.kickoffAt) - new Date(a.match.kickoffAt)
    );

    res.json({ user, predictions });
  } catch (err) {
    next(err);
  }
});

export default router;
