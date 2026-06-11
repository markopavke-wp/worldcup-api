import 'dotenv/config';

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: requireEnv('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  football: {
    baseUrl: 'https://v3.football.api-sports.io',
    apiKey: process.env.API_FOOTBALL_KEY || '',
    leagueId: Number(process.env.API_FOOTBALL_LEAGUE_ID) || 1,
    season: Number(process.env.API_FOOTBALL_SEASON) || 2026,
  },
  footballData: {
    baseUrl: 'https://api.football-data.org/v4',
    token: process.env.FOOTBALL_DATA_TOKEN || '',
    competition: process.env.FOOTBALL_DATA_COMPETITION || 'WC',
    season: Number(process.env.FOOTBALL_DATA_SEASON) || 2026,
  },
  cron: {
    enabled: process.env.ENABLE_CRON === 'true',
    schedule: process.env.SYNC_CRON || '*/15 * * * *',
  },
};
