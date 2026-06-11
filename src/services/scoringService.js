import { prisma } from '../lib/prisma.js';
import { calculatePoints } from '../lib/outcome.js';

export async function scoreMatch(matchId) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match || match.status !== 'FINISHED') {
    return { scored: 0 };
  }

  if (match.homeScore === null || match.awayScore === null) {
    return { scored: 0 };
  }

  const predictions = await prisma.prediction.findMany({
    where: { matchId, pointsAwarded: null },
  });

  let scored = 0;
  for (const prediction of predictions) {
    const points = calculatePoints(
      prediction.outcomePred,
      prediction.homeScorePred,
      prediction.awayScorePred,
      match.homeScore,
      match.awayScore
    );

    await prisma.prediction.update({
      where: { id: prediction.id },
      data: { pointsAwarded: points },
    });
    scored += 1;
  }

  return { scored };
}

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      email: true,
      predictions: {
        select: {
          pointsAwarded: true,
          match: { select: { status: true } },
        },
      },
    },
    orderBy: { displayName: 'asc' },
  });

  return users
    .map((user) => {
      const finished = user.predictions.filter(
        (p) => p.match.status === 'FINISHED' && p.pointsAwarded !== null
      );

      const totalPoints = finished.reduce((sum, p) => sum + p.pointsAwarded, 0);
      const exactHits = finished.filter((p) => p.pointsAwarded === 3).length;
      const outcomeHits = finished.filter((p) => p.pointsAwarded >= 1).length;
      const predictionsCount = user.predictions.length;

      return {
        userId: user.id,
        displayName: user.displayName,
        totalPoints,
        exactHits,
        outcomeHits,
        predictionsCount,
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
      return a.displayName.localeCompare(b.displayName, 'sr');
    })
    .map((entry, index) => ({ rank: index + 1, ...entry }));
}
