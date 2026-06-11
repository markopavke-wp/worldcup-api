import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';
import { canEditPrediction, scoresMatchOutcome } from '../lib/outcome.js';

const router = Router();

const predictionSchema = z
  .object({
    outcome: z.enum(['1', 'X', '2']),
    homeScore: z.number().int().min(0).max(20).optional(),
    awayScore: z.number().int().min(0).max(20).optional(),
  })
  .superRefine((data, ctx) => {
    const hasHome = data.homeScore !== undefined;
    const hasAway = data.awayScore !== undefined;

    if (hasHome !== hasAway) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Unesi oba dela tačnog rezultata ili ostavi prazno',
      });
      return;
    }

    if (hasHome && !scoresMatchOutcome(data.outcome, data.homeScore, data.awayScore)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tačan rezultat mora da odgovara ishodu (1 = pobeda domaćina, X = nerešeno, 2 = pobeda gosta)',
      });
    }
  });

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const predictions = await prisma.prediction.findMany({
      where: { userId: req.userId },
      include: {
        match: true,
      },
      orderBy: { match: { kickoffAt: 'asc' } },
    });

    res.json({ predictions });
  } catch (err) {
    next(err);
  }
});

router.put('/:matchId', authRequired, async (req, res, next) => {
  try {
    const body = predictionSchema.parse(req.body);
    const match = await prisma.match.findUnique({ where: { id: req.params.matchId } });

    if (!match) return res.status(404).json({ error: 'Utakmica nije pronađena' });
    if (!canEditPrediction(match)) {
      return res.status(403).json({
        error: 'Prognoza je zaključana. Možeš je menjati najkasnije 1 sat pre početka utakmice.',
      });
    }

    const hasExact = body.homeScore !== undefined && body.awayScore !== undefined;

    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: { userId: req.userId, matchId: match.id },
      },
      create: {
        userId: req.userId,
        matchId: match.id,
        outcomePred: body.outcome,
        homeScorePred: hasExact ? body.homeScore : null,
        awayScorePred: hasExact ? body.awayScore : null,
      },
      update: {
        outcomePred: body.outcome,
        homeScorePred: hasExact ? body.homeScore : null,
        awayScorePred: hasExact ? body.awayScore : null,
        pointsAwarded: null,
      },
    });

    res.json({ prediction });
  } catch (err) {
    next(err);
  }
});

export default router;
