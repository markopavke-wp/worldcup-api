import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
import { getLockTime } from '../lib/outcome.js';
import { FIXTURE_ROWS } from '../../prisma/data/fixtures2026.js';
import { syncFixturesFromApiFootball, syncFixturesFromFootballData } from './syncService.js';
import { getTeamInfo } from '../lib/teams.js';

const MONTHS = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

const GROUPS = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);

function parseKickoff(dateStr, timeStr) {
  const [day, mon, year] = dateStr.split('-');
  const [hh, mm] = timeStr.split(':');
  const iso = `20${year}-${MONTHS[mon]}-${day.padStart(2, '0')}T${hh.padStart(2, '0')}:${(mm || '00').padStart(2, '0')}:00-04:00`;
  return new Date(iso);
}

function parseFixtureRow(line) {
  const [id, date, time, home, away, groupOrStage] = line.split('|');
  const externalId = Number(id);
  const kickoffAt = parseKickoff(date, time);

  if (GROUPS.has(groupOrStage)) {
    return {
      externalId,
      homeTeam: home,
      awayTeam: away,
      kickoffAt,
      stage: `Group Stage - Group ${groupOrStage}`,
      groupName: `Group ${groupOrStage}`,
    };
  }

  return {
    externalId,
    homeTeam: home,
    awayTeam: away,
    kickoffAt,
    stage: groupOrStage,
    groupName: null,
  };
}

export function getFixtureData() {
  return FIXTURE_ROWS
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseFixtureRow);
}

export async function seedFixtures() {
  const fixtures = getFixtureData();
  let upserted = 0;

  for (const fixture of fixtures) {
    const homeTeamLogo = getTeamInfo(fixture.homeTeam).flagUrl;
    const awayTeamLogo = getTeamInfo(fixture.awayTeam).flagUrl;

    await prisma.match.upsert({
      where: { externalId: fixture.externalId },
      create: {
        ...fixture,
        homeTeamLogo,
        awayTeamLogo,
        status: 'SCHEDULED',
        predictionsLockedAt: getLockTime(fixture.kickoffAt, fixture.stage),
      },
      update: {
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        homeTeamLogo,
        awayTeamLogo,
        kickoffAt: fixture.kickoffAt,
        stage: fixture.stage,
        groupName: fixture.groupName,
        predictionsLockedAt: getLockTime(fixture.kickoffAt, fixture.stage),
      },
    });
    upserted += 1;
  }

  return { upserted };
}

export async function ensureMatchesSeeded() {
  const count = await prisma.match.count();
  if (count > 0) {
    return { skipped: true, count };
  }

  if (config.football.apiKey && !config.footballData.token) {
    const result = await syncFixturesFromApiFootball();
    return { source: result.source, ...result };
  }

  const seedResult = await seedFixtures();

  if (config.footballData.token) {
    try {
      const syncResult = await syncFixturesFromFootballData();
      return { source: 'football-data', seeded: seedResult.upserted, ...syncResult };
    } catch (error) {
      console.warn('football-data sync nakon seed-a:', error.message);
    }
  }

  return { source: 'seed', ...seedResult };
}
