import { config } from '../config.js';

async function footballDataFetch(path, params = {}) {
  if (!config.footballData.token) {
    throw new Error(
      'FOOTBALL_DATA_TOKEN nije podešen. Registruj se na https://www.football-data.org/client/register',
    );
  }

  const url = new URL(`${config.footballData.baseUrl}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': config.footballData.token,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`football-data.org error ${response.status}: ${body}`);
  }

  return response.json();
}

export async function fetchMatches() {
  const data = await footballDataFetch(`/competitions/${config.footballData.competition}/matches`, {
    season: config.footballData.season,
  });
  return data.matches || [];
}

export async function fetchStandings() {
  const data = await footballDataFetch(`/competitions/${config.footballData.competition}/standings`, {
    season: config.footballData.season,
  });
  return data.standings || [];
}

export function mapMatchStatus(apiStatus) {
  const map = {
    SCHEDULED: 'SCHEDULED',
    TIMED: 'SCHEDULED',
    IN_PLAY: 'LIVE',
    PAUSED: 'LIVE',
    FINISHED: 'FINISHED',
    POSTPONED: 'POSTPONED',
    CANCELLED: 'CANCELLED',
    SUSPENDED: 'CANCELLED',
    AWARDED: 'FINISHED',
  };
  return map[apiStatus] || 'SCHEDULED';
}

export function mapGroupName(group) {
  if (!group) return null;
  const match = group.match(/GROUP_([A-L])/i);
  return match ? `Group ${match[1].toUpperCase()}` : null;
}

const STAGE_LABELS = {
  GROUP_STAGE: 'Group Stage',
  LAST_16: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-finals',
  SEMI_FINALS: 'Semi-finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

export function mapStage(stage, group) {
  const groupName = mapGroupName(group);
  if (groupName) {
    return `Group Stage - ${groupName}`;
  }
  return STAGE_LABELS[stage] || stage || 'Knockout';
}
