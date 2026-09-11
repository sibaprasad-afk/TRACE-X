import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/apiRouter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TRACE-X Blockchain Intelligence Platform',
    timestamp: new Date().toISOString()
  });
});

// API
app.use('/api', apiRouter);

// Production frontend
const distPath = path.join(process.cwd(), 'dist');

app.use(express.static(distPath));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// IMPORTANT:
// Vercel needs the Express app exported.
// Do NOT call app.listen() on Vercel.

export default app;

// Local development only
if (process.env.VERCEL !== '1') {
  const PORT = Number(process.env.PORT || 3000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `TRACE-X Server running on http://localhost:${PORT}`
    );
  });
}
