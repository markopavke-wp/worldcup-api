import { prisma } from '../lib/prisma.js';
import { getTeamInfo } from '../lib/teams.js';

function emptyStats(name) {
  const info = getTeamInfo(name);
  return {
    team: name,
    code: info.code,
    logo: info.flagUrl,
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
    form: '',
  };
}

function applyResult(stats, goalsFor, goalsAgainst) {
  stats.played += 1;
  stats.goalsFor += goalsFor;
  stats.goalsAgainst += goalsAgainst;
  stats.goalDiff = stats.goalsFor - stats.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    stats.won += 1;
    stats.points += 3;
    stats.form = `W${stats.form}`.slice(0, 5);
  } else if (goalsFor < goalsAgainst) {
    stats.lost += 1;
    stats.form = `L${stats.form}`.slice(0, 5);
  } else {
    stats.draw += 1;
    stats.points += 1;
    stats.form = `D${stats.form}`.slice(0, 5);
  }
}

export async function getStandingsFromDb() {
  const matches = await prisma.match.findMany({
    where: { groupName: { not: null } },
    orderBy: { kickoffAt: 'asc' },
  });

  const groups = new Map();

  for (const match of matches) {
    if (!groups.has(match.groupName)) {
      groups.set(match.groupName, new Map());
    }
    const teams = groups.get(match.groupName);

    for (const name of [match.homeTeam, match.awayTeam]) {
      if (!teams.has(name)) {
        teams.set(name, emptyStats(name));
      }
    }

    if (match.status !== 'FINISHED' || match.homeScore === null || match.awayScore === null) {
      continue;
    }

    applyResult(teams.get(match.homeTeam), match.homeScore, match.awayScore);
    applyResult(teams.get(match.awayTeam), match.awayScore, match.homeScore);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, teamsMap]) => ({
      group,
      teams: [...teamsMap.values()]
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
          if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
          return a.team.localeCompare(b.team, 'sr');
        })
        .map((team, index) => ({ rank: index + 1, ...team })),
    }));
}
