export function getOutcome(homeScore, awayScore) {
  if (homeScore > awayScore) return '1';
  if (homeScore < awayScore) return '2';
  return 'X';
}

export function scoresMatchOutcome(outcome, homeScore, awayScore) {
  return getOutcome(homeScore, awayScore) === outcome;
}

export function calculatePoints(outcomePred, homePred, awayPred, actualHome, actualAway) {
  const actualOutcome = getOutcome(actualHome, actualAway);
  let points = 0;

  if (outcomePred === actualOutcome) {
    points += 1;
  }

  if (homePred !== null && awayPred !== null) {
    if (homePred === actualHome && awayPred === actualAway) {
      points += 2;
    }
  }

  return points;
}

export function getLockTime(kickoffAt) {
  const lock = new Date(kickoffAt);
  lock.setHours(lock.getHours() - 1);
  return lock;
}

export function canEditPrediction(match) {
  if (match.status !== 'SCHEDULED') return false;
  return new Date() < new Date(match.predictionsLockedAt);
}
