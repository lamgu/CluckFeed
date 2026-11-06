import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import ingredientsRouter from './routes/ingredients.js';
import presetsRouter from './routes/presets.js';
import historyRouter from './routes/history.js';
import hoppersRouter from './routes/hoppers.js';
import farmRouter from './routes/farm.js';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);

// Init database
initDb();

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json());

// Routes
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/presets', presetsRouter);
app.use('/api/history', historyRouter);
app.use('/api/hoppers', hoppersRouter);
app.use('/api/farm', farmRouter);
app.use('/api/chat', chatRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Server] CluckFeed API running at http://localhost:${PORT}`);
});

export default app;

