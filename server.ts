import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getTabletsHandler, getTabletByIdHandler, createTabletHandler, updateTabletHandler, deleteTabletHandler } from './integrations/api/tablets.ts';
import prisma from './prismaClient.ts';

export const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:5173', // Vite default port
      'http://localhost:3000', // Common development port
      'https://tnaar-healthcare.vercel.app/', // Vercel deployment
      // Add your production domain here
      process.env.FRONTEND_URL || '' // For deployment environments
    ];
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.railway.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get('/api/tablets', async (req, res) => {
  const { status, body } = await getTabletsHandler();
  res.status(status).json(body);
});

app.get('/api/tablets/:id', async (req, res) => {
  const { id } = req.params;
  const { status, body } = await getTabletByIdHandler(id);
  res.status(status).json(body);
});

app.post('/api/tablets', async (req, res) => {
  const { status, body } = await createTabletHandler(req.body);
  res.status(status).json(body);
});

app.put('/api/tablets/:id', async (req, res) => {
  const { id } = req.params;
  const { status, body } = await updateTabletHandler(id, req.body);
  res.status(status).json(body);
});

app.delete('/api/tablets/:id', async (req, res) => {
  const { id } = req.params;
  const { status, body } = await deleteTabletHandler(id);
  res.status(status).json(body);
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'OK', message: 'Server and database are running' });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed', error: error.message });
  }
});

// --- Static hosting for frontend build ---
// Resolve project paths (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine repository root regardless of running from TS (backend/) or compiled JS (backend/dist)
const isCompiledDist = path.basename(__dirname) === 'dist';
const backendDir = isCompiledDist ? path.resolve(__dirname, '..') : __dirname;
const repoRoot = isCompiledDist ? path.resolve(__dirname, '..', '..') : path.resolve(__dirname, '..');

// Prefer serving the built frontend from frontend/dist. Fallback to backend/dist if present.
const frontendDistPath = path.resolve(repoRoot, 'frontend', 'dist');
const backendDistPath = path.resolve(backendDir, 'dist');
const activeDistPath = fs.existsSync(frontendDistPath)
  ? frontendDistPath
  : (fs.existsSync(backendDistPath) ? backendDistPath : null);

if (activeDistPath) {
  app.use(express.static(activeDistPath));
}

// Client-side routing fallback: send index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (!activeDistPath) {
    return res.status(503).json({
      error: 'Frontend not built',
      details: 'No dist folder found. Build the frontend (cd frontend && npm run build) and restart the server.'
    });
  }
  const indexPath = path.join(activeDistPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(503).json({
      error: 'Frontend index missing',
      details: `Missing index.html at ${indexPath}. Build the frontend (cd frontend && npm run build).`
    });
  }
  res.sendFile(indexPath);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});