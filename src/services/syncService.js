import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
import { normalizeTeamName } from '../lib/teamNames.js';
import { getTeamInfo } from '../lib/teams.js';
import {
  fetchFixtures as fetchApiFootballFixtures,
  fetchStandings as fetchApiFootballStandings,
  mapFixtureStatus,
  extractGroupName,
} from './footballApi.js';
import {
  fetchMatches as fetchFootballDataMatches,
  fetchStandings as fetchFootballDataStandings,
  mapMatchStatus as mapFootballDataStatus,
  mapGroupName,
  mapStage as mapFootballDataStage,
} from './footballDataApi.js';
import { getLockTime } from '../lib/outcome.js';
import { scoreMatch } from './scoringService.js';

const KICKOFF_TOLERANCE_MS = 24 * 60 * 60 * 1000;
const EXACT_KICKOFF_TOLERANCE_MS = 60 * 1000;

function kickoffMatches(a, b, toleranceMs = KICKOFF_TOLERANCE_MS) {
  return Math.abs(a.getTime() - b.getTime()) <= toleranceMs;
}

function findDbMatch(apiHome, apiAway, kickoffAt, dbMatches, usedIds) {
  const home = apiHome ? normalizeTeamName(apiHome) : '';
  const away = apiAway ? normalizeTeamName(apiAway) : '';
  const available = dbMatches.filter((match) => !usedIds.has(match.id));

  if (home && away) {
    const byTeams = available.find((match) => (
      normalizeTeamName(match.homeTeam) === home
      && normalizeTeamName(match.awayTeam) === away
      && kickoffMatches(match.kickoffAt, kickoffAt)
    ));
    if (byTeams) return byTeams;
  }

  // Knockout: football-data često vraća null timove — upari po tačnom vremenu
  const knockoutPool = available.filter((match) => !match.groupName);
  const byKickoff = knockoutPool.filter((match) => (
    kickoffMatches(match.kickoffAt, kickoffAt, EXACT_KICKOFF_TOLERANCE_MS)
  ));
  return byKickoff.length === 1 ? byKickoff[0] : null;
}

async function scoreFinishedMatches(finishedMatchIds) {
  let scored = 0;
  for (const matchId of finishedMatchIds) {
    const result = await scoreMatch(matchId);
    scored += result.scored;
  }
  return scored;
}

export async function syncFixturesFromApiFootball() {
  const fixtures = await fetchApiFootballFixtures();
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
        homeScore,
        awayScore,
        status,
        predictionsLockedAt: getLockTime(kickoffAt),
      },
    });

    upserted += 1;
    if (status === 'FINISHED') {
      finishedMatchIds.push(match.id);
    }
  }

  const scored = await scoreFinishedMatches(finishedMatchIds);
  return { upserted, scored, source: 'api-football' };
}

export async function syncFixturesFromFootballData() {
  const apiMatches = await fetchFootballDataMatches();
  const dbMatches = await prisma.match.findMany();
  let updated = 0;
  let unmatched = 0;
  const finishedMatchIds = [];
  const usedIds = new Set();

  for (const apiMatch of apiMatches) {
    const kickoffAt = new Date(apiMatch.utcDate);
    const dbMatch = findDbMatch(
      apiMatch.homeTeam?.name,
      apiMatch.awayTeam?.name,
      kickoffAt,
      dbMatches,
      usedIds,
    );

    if (!dbMatch) {
      unmatched += 1;
      continue;
    }

    usedIds.add(dbMatch.id);

    const status = mapFootballDataStatus(apiMatch.status);
    const homeScore = apiMatch.score?.fullTime?.home ?? null;
    const awayScore = apiMatch.score?.fullTime?.away ?? null;
    const groupName = mapGroupName(apiMatch.group);
    const homeTeam = apiMatch.homeTeam?.name
      ? normalizeTeamName(apiMatch.homeTeam.name)
      : dbMatch.homeTeam;
    const awayTeam = apiMatch.awayTeam?.name
      ? normalizeTeamName(apiMatch.awayTeam.name)
      : dbMatch.awayTeam;

    const match = await prisma.match.update({
      where: { id: dbMatch.id },
      data: {
        homeTeam,
        awayTeam,
        homeTeamLogo: apiMatch.homeTeam?.crest || getTeamInfo(homeTeam).flagUrl || dbMatch.homeTeamLogo,
        awayTeamLogo: apiMatch.awayTeam?.crest || getTeamInfo(awayTeam).flagUrl || dbMatch.awayTeamLogo,
        kickoffAt,
        stage: mapFootballDataStage(apiMatch.stage, apiMatch.group),
        groupName,
        homeScore,
        awayScore,
        status,
        predictionsLockedAt: getLockTime(kickoffAt),
      },
    });

    updated += 1;
    if (status === 'FINISHED') {
      finishedMatchIds.push(match.id);
    }
  }

  const scored = await scoreFinishedMatches(finishedMatchIds);
  return { upserted: updated, scored, unmatched, source: 'football-data' };
}

export async function syncFixtures() {
  if (config.footballData.token) {
    return syncFixturesFromFootballData();
  }
  if (config.football.apiKey) {
    return syncFixturesFromApiFootball();
  }
  throw new Error('Podesi FOOTBALL_DATA_TOKEN ili API_FOOTBALL_KEY za sync');
}

export async function getCachedStandings() {
  if (config.footballData.token) {
    return getFootballDataStandings();
  }

  try {
    const response = await fetchApiFootballStandings();
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

export async function getFootballDataStandings() {
  try {
    const standings = await fetchFootballDataStandings();
    if (!standings.length) return [];

    return standings
      .filter((entry) => entry.type === 'TOTAL' || !entry.type)
      .map((entry) => ({
        group: mapGroupName(entry.group) || 'Unknown',
        teams: (entry.table || []).map((row) => ({
          rank: row.position,
          team: normalizeTeamName(row.team.name),
          logo: row.team.crest || getTeamInfo(normalizeTeamName(row.team.name)).flagUrl,
          played: row.playedGames,
          won: row.won,
          draw: row.draw,
          lost: row.lost,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          goalDiff: row.goalDifference,
          points: row.points,
          form: row.form || '',
        })),
      }));
  } catch (error) {
    console.error('football-data standings failed:', error.message);
    return [];
  }
}
