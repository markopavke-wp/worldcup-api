import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';
import { canEditPrediction } from '../lib/outcome.js';
import { enrichTeam } from '../lib/teams.js';

const router = Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const { group, status } = req.query;
    const matches = await prisma.match.findMany({
      where: {
        ...(group ? { groupName: String(group) } : {}),
        ...(status ? { status: String(status).toUpperCase() } : {}),
      },
      orderBy: { kickoffAt: 'asc' },
      include: {
        predictions: {
          where: { userId: req.userId },
          select: {
            id: true,
            homeScorePred: true,
            awayScorePred: true,
            outcomePred: true,
            pointsAwarded: true,
          },
        },
      },
    });

    const result = matches.map((match) => ({
      ...match,
      homeTeamInfo: enrichTeam(match.homeTeam, match.homeTeamLogo),
      awayTeamInfo: enrichTeam(match.awayTeam, match.awayTeamLogo),
      prediction: match.predictions[0] || null,
      canEdit: canEditPrediction(match),
      predictions: undefined,
    }));

    res.json({ matches: result });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
      include: {
        predictions: {
          where: { userId: req.userId },
          select: {
            id: true,
            homeScorePred: true,
            awayScorePred: true,
            outcomePred: true,
            pointsAwarded: true,
          },
        },
      },
    });

    if (!match) return res.status(404).json({ error: 'Utakmica nije pronađena' });

    res.json({
      match: {
        ...match,
        homeTeamInfo: enrichTeam(match.homeTeam, match.homeTeamLogo),
        awayTeamInfo: enrichTeam(match.awayTeam, match.awayTeamLogo),
        prediction: match.predictions[0] || null,
        canEdit: canEditPrediction(match),
        predictions: undefined,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
