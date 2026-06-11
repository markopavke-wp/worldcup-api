import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import matchesRoutes from './routes/matches.js';
import predictionsRoutes from './routes/predictions.js';
import leaderboardRoutes from './routes/leaderboard.js';
import standingsRoutes from './routes/standings.js';
import adminRoutes from './routes/admin.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/matches', matchesRoutes);
  app.use('/api/predictions', predictionsRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/standings', standingsRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(errorHandler);
  return app;
}
