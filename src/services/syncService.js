import { prisma } from '../lib/prisma.js';
import {
  fetchFixtures,
  fetchStandings,
  mapFixtureStatus,
  extractGroupName,
} from './footballApi.js';
import { getLockTime } from '../lib/outcome.js';
import { scoreMatch } from './scoringService.js';

export async function syncFixtures() {
  const fixtures = await fetchFixtures();
  let upserted = 0;
  const finishedMatchIds = [];

  for (const item of fixtures) {
    const { fixture, league, teams, goals, score } = item;
    const status = mapFixtureStatus(fixture.status);
    const kickoffAt = new Date(fixture.date);
    const homeScore = goals?.home ?? score?.fulltime?.home ?? null;
    const awayScore = goals?.away ?? score?.fulltime?.away ?? null;

    const match = await prisma.match.upsert({
      where: { externalId: fixture.id },
      create: {
        externalId: fixture.id,
        homeTeam: teams.home.name,
        awayTeam: teams.away.name,
        homeTeamLogo: teams.home.logo,
        awayTeamLogo: teams.away.logo,
        kickoffAt,
        stage: league.round || 'Group Stage',
        groupName: extractGroupName(league.round),
        homeScore: status === 'FINISHED' ? homeScore : null,
        awayScore: status === 'FINISHED' ? awayScore : null,
        status,
        predictionsLockedAt: getLockTime(kickoffAt),
      },
      update: {
        homeTeam: teams.home.name,
        awayTeam: teams.away.name,
        homeTeamLogo: teams.home.logo,
        awayTeamLogo: teams.away.logo,
        kickoffAt,
        stage: league.round || 'Group Stage',
        groupName: extractGroupName(league.round),
        homeScore: status === 'FINISHED' ? homeScore : homeScore,
        awayScore: status === 'FINISHED' ? awayScore : awayScore,
        status,
        predictionsLockedAt: getLockTime(kickoffAt),
      },
    });

    upserted += 1;
    if (status === 'FINISHED') {
      finishedMatchIds.push(match.id);
    }
  }

  let scored = 0;
  for (const matchId of finishedMatchIds) {
    const result = await scoreMatch(matchId);
    scored += result.scored;
  }

  return { upserted, scored };
}

export async function getCachedStandings() {
  try {
    const response = await fetchStandings();
    if (!response.length) return [];

    const league = response[0].league;
    return (league.standings || []).map((group) => ({
      group: group[0]?.group || 'Unknown',
      teams: group.map((row) => ({
        rank: row.rank,
        team: row.team.name,
        logo: row.team.logo,
        played: row.all.played,
        won: row.all.win,
        draw: row.all.draw,
        lost: row.all.lose,
        goalsFor: row.all.goals.for,
        goalsAgainst: row.all.goals.against,
        goalDiff: row.goalsDiff,
        points: row.points,
        form: row.form,
      })),
    }));
  } catch (error) {
    console.error('Standings fetch failed:', error.message);
    return [];
  }
}
