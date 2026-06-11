import { config } from '../config.js';

async function footballFetch(path, params = {}) {
  if (!config.football.apiKey) {
    throw new Error('API_FOOTBALL_KEY nije podešen. Registruj se na https://dashboard.api-football.com');
  }

  const url = new URL(`${config.football.baseUrl}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': config.football.apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API-Football error ${response.status}: ${body}`);
  }

  const data = await response.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

export async function fetchFixtures() {
  const data = await footballFetch('/fixtures', {
    league: config.football.leagueId,
    season: config.football.season,
  });
  return data.response || [];
}

export async function fetchStandings() {
  const data = await footballFetch('/standings', {
    league: config.football.leagueId,
    season: config.football.season,
  });
  return data.response || [];
}

export function mapFixtureStatus(apiStatus) {
  const short = apiStatus?.short || 'NS';
  const map = {
    NS: 'SCHEDULED',
    TBD: 'SCHEDULED',
    '1H': 'LIVE',
    HT: 'LIVE',
    '2H': 'LIVE',
    ET: 'LIVE',
    BT: 'LIVE',
    P: 'LIVE',
    LIVE: 'LIVE',
    FT: 'FINISHED',
    AET: 'FINISHED',
    PEN: 'FINISHED',
    PST: 'POSTPONED',
    CANC: 'CANCELLED',
    ABD: 'CANCELLED',
    AWD: 'FINISHED',
    WO: 'FINISHED',
  };
  return map[short] || 'SCHEDULED';
}

export function extractGroupName(round) {
  if (!round) return null;
  const match = round.match(/Group\s+([A-L])/i);
  return match ? `Group ${match[1].toUpperCase()}` : null;
}
