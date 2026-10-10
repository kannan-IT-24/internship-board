import express from 'express';
import cors from 'cors';
import internshipsRouter from './routes/internships.js';
import applicationsRouter from './routes/applications.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { getDb } from './config/database.js';

export function createApp(customDb = null) {
  const app = express();

  // Attach database instance to app locals for dependency injection/testing
  app.locals.db = customDb || getDb();

  // Basic security hardening
  app.disable('x-powered-by');

  // CORS configuration
  const allowedOrigins = [
    process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, tests, mobile)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.github.io') ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
        callback(null, true); // Permissive in local demo mode, safe origins
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Request body parsing with strict size limits
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      data: {
        status: 'healthy',
        message: 'InternHub API is running smoothly.',
      },
    });
  });

  // Mount API routers
  app.use('/api/internships', internshipsRouter);
  app.use('/api/applications', applicationsRouter);

  // 404 handler for unknown routes
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export default createApp();
