import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import internshipsRouter from './routes/internships.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createGeneralLimiter, createApplicationSubmitLimiter } from './middleware/rateLimiter.js';
import { getDb } from './config/database.js';
import { createApplicationsRouter } from './routes/applications.js';

export function createApp(customDb = null) {
  const app = express();

  // Attach database instance to app locals for dependency injection/testing
  app.locals.db = customDb || getDb();

  // Enable proxy trust when behind cloud load balancers (e.g. Render, Railway)
  if (process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  // -----------------------------------------------------------------------
  // Security Headers via Helmet
  // Sets X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security,
  // Content-Security-Policy, Referrer-Policy, X-DNS-Prefetch-Control, etc.
  // -----------------------------------------------------------------------
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

  // Remove X-Powered-By (belt-and-suspenders: helmet already removes it)
  app.disable('x-powered-by');

  // -----------------------------------------------------------------------
  // CORS — allow the hosted frontend plus explicitly configured exact origins
  // -----------------------------------------------------------------------
  const allowedOrigins = [
    'https://kannan-it-24.github.io',
    ...(process.env.FRONTEND_ORIGIN || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ];

  const developmentOrigins =
    process.env.NODE_ENV === 'production'
      ? []
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Node test runner, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || developmentOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
    })
  );

  // -----------------------------------------------------------------------
  // Request body parsing with strict size limits
  // -----------------------------------------------------------------------
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  // -----------------------------------------------------------------------
  // General rate limiting applied to all /api/* routes.
  // Each createApp() call gets its own limiter instance (safe for test isolation).
  // -----------------------------------------------------------------------
  app.use('/api/', createGeneralLimiter());

  // -----------------------------------------------------------------------
  // Health check endpoint — unauthenticated, no PII
  // -----------------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      data: {
        status: 'healthy',
        message: 'InternHub API is running smoothly.',
      },
    });
  });

  // -----------------------------------------------------------------------
  // Mount API routers
  // applications router receives its own limiter instance for isolation
  // -----------------------------------------------------------------------
  app.use('/api/internships', internshipsRouter);
  app.use('/api/applications', createApplicationsRouter(createApplicationSubmitLimiter()));

  // 404 handler for unknown routes
  app.use(notFoundHandler);

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp();
