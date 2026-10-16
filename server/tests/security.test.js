/**
 * Task 4 Security & Integration Tests
 * Tests for: security headers, rate limiting, query parameter validation,
 * application form validation edge cases, and error envelope consistency.
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDb, initSchema } from '../src/config/database.js';
import { seedDatabase } from '../src/db/seed.js';

describe('Task 4 – Secure Application Integration Tests', () => {
  let app;
  let testDb;

  beforeEach(() => {
    // Fresh isolated in-memory database for each test
    testDb = getDb(':memory:');
    initSchema(testDb);
    seedDatabase(testDb);
    app = createApp(testDb);
  });

  // =========================================================================
  // A. Security Headers (Helmet)
  // =========================================================================

  it('SEC-01: GET /api/health should include Helmet security headers', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);

    // Helmet sets X-Content-Type-Options: nosniff
    assert.equal(res.headers['x-content-type-options'], 'nosniff');

    // Helmet sets X-Frame-Options (or CSP frame-ancestors instead)
    const hasFrameProtection =
      res.headers['x-frame-options'] ||
      (res.headers['content-security-policy'] &&
        res.headers['content-security-policy'].includes('frame-ancestors'));
    assert.ok(hasFrameProtection, 'Expected X-Frame-Options or CSP frame-ancestors header');

    // x-powered-by should NOT be present
    assert.equal(
      res.headers['x-powered-by'],
      undefined,
      'x-powered-by header should not be present'
    );
  });

  it('SEC-02: API responses should not expose X-Powered-By header', async () => {
    const res = await request(app).get('/api/internships');
    assert.equal(res.headers['x-powered-by'], undefined);
  });

  it('SEC-03: Error responses should not include stack trace or SQL internals', async () => {
    const res = await request(app).get('/api/internships/NONEXISTENT-ID');
    assert.equal(res.status, 404);
    assert.equal(res.body.error.stack, undefined, 'Stack trace must not leak to client');
    assert.equal(res.body.error.sql, undefined, 'SQL internals must not leak to client');
    assert.equal(typeof res.body.error.code, 'string');
    assert.equal(typeof res.body.error.message, 'string');
  });

  // =========================================================================
  // B. Query Parameter Validation & Length Limits
  // =========================================================================

  it('SEC-04: GET /api/internships with q param > 200 chars should return 400', async () => {
    const longQuery = 'a'.repeat(201);
    const res = await request(app).get(
      `/api/internships?q=${encodeURIComponent(longQuery)}`
    );
    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('SEC-05: GET /api/internships with domain param > 100 chars should return 400', async () => {
    const longDomain = 'D'.repeat(101);
    const res = await request(app).get(
      `/api/internships?domain=${encodeURIComponent(longDomain)}`
    );
    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('SEC-06: GET /api/internships with mode param > 20 chars should return 400', async () => {
    const longMode = 'M'.repeat(21);
    const res = await request(app).get(
      `/api/internships?mode=${encodeURIComponent(longMode)}`
    );
    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('SEC-09: Repeated search parameters should return 400 instead of causing a server error', async () => {
    const res = await request(app).get('/api/internships?q=frontend&q=analytics');
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('SEC-10: Unexpected server errors should not expose details in any environment', async () => {
    const originalConsoleError = console.error;
    const errorLogs = [];
    console.error = (...args) => errorLogs.push(args.join(' '));

    try {
      const failingApp = createApp({
        prepare() {
          throw new Error('SQL details applicant@example.com');
        },
      });
      const res = await request(failingApp).get('/api/internships');

      assert.equal(res.status, 500);
      assert.equal(res.body.error.message, 'An unexpected internal server error occurred.');
      assert.doesNotMatch(JSON.stringify(res.body), /SQL details|applicant@example\.com/);
      assert.doesNotMatch(errorLogs.join(' '), /SQL details|applicant@example\.com/);
    } finally {
      console.error = originalConsoleError;
    }
  });

  it('SEC-11: CORS should allow only configured production origins', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousOrigins = process.env.FRONTEND_ORIGIN;
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_ORIGIN = 'https://frontend.example.com';

    try {
      const corsApp = createApp(testDb);
      const allowed = await request(corsApp)
        .get('/api/health')
        .set('Origin', 'https://frontend.example.com');
      const unconfigured = await request(corsApp)
        .get('/api/health')
        .set('Origin', 'https://untrusted.github.io');

      assert.equal(allowed.headers['access-control-allow-origin'], 'https://frontend.example.com');
      assert.equal(unconfigured.headers['access-control-allow-origin'], undefined);
    } finally {
      if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousNodeEnv;
      if (previousOrigins === undefined) delete process.env.FRONTEND_ORIGIN;
      else process.env.FRONTEND_ORIGIN = previousOrigins;
    }
  });

  // =========================================================================
  // C. Application Form Validation – Server-side
  // =========================================================================

  it('APP-01: Valid application submission should return 201 with correct fields', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'Valid Applicant',
      applicant_email: 'valid@example.com',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'success');
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.internship_id, 'INT-001');
    assert.equal(res.body.data.applicant_name, 'Valid Applicant');
    assert.equal(res.body.data.applicant_email, 'valid@example.com');
    assert.ok(res.body.data.created_at);
  });

  it('APP-02: Empty applicant name should return 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: '',
      applicant_email: 'test@example.com',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('APP-03: Single-character applicant name should return 400 (min 2 chars)', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'X',
      applicant_email: 'test@example.com',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('APP-04: Name exceeding 100 chars should return 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'A'.repeat(101),
      applicant_email: 'test@example.com',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('APP-05: Missing applicant_email should return 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'Test User',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('APP-06: Invalid email "not-an-email" should return 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'Test User',
      applicant_email: 'not-an-email',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('APP-07: Invalid email missing domain "user@" should return 400', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'Test User',
      applicant_email: 'user@',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('APP-08: Duplicate application (same internship + email) should return 409 CONFLICT', async () => {
    const payload = {
      internship_id: 'INT-001',
      applicant_name: 'Duplicate Tester',
      applicant_email: 'dup@example.com',
    };

    const first = await request(app).post('/api/applications').send(payload);
    assert.equal(first.status, 201, 'First submission should succeed');

    const second = await request(app).post('/api/applications').send(payload);
    assert.equal(second.status, 409);
    assert.equal(second.body.error.code, 'CONFLICT');
    assert.doesNotMatch(second.body.error.message, /dup@example\.com/);
  });

  it('APP-09: Application to a closed internship (INT-004) should return 409 CONFLICT', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-004',
      applicant_name: 'Closed Applicant',
      applicant_email: 'closed@example.com',
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'CONFLICT');
    assert.match(res.body.error.message.toLowerCase(), /closed/);
  });

  it('APP-10: Application to a nonexistent internship ID should return 404 NOT_FOUND', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-DOES-NOT-EXIST',
      applicant_name: 'Ghost Applicant',
      applicant_email: 'ghost@example.com',
    });
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  it('APP-11: Missing internship_id should return 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/applications').send({
      applicant_name: 'No ID User',
      applicant_email: 'noid@example.com',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('APP-12: Request body larger than limit should return 413', async () => {
    // A 200KB payload exceeds the 100KB body limit
    const hugeBody = JSON.stringify({
      internship_id: 'INT-001',
      applicant_name: 'A'.repeat(100 * 1024),
      applicant_email: 'big@example.com',
    });
    const res = await request(app)
      .post('/api/applications')
      .set('Content-Type', 'application/json')
      .send(hugeBody);
    // Express returns 413 Payload Too Large
    assert.equal(res.status, 413);
  });

  // =========================================================================
  // D. SQL Injection Resistance
  // =========================================================================

  it('SEC-07: SQL injection in q parameter must return empty results safely', async () => {
    const injection = "'; DROP TABLE internships; --";
    const res = await request(app).get(
      `/api/internships?q=${encodeURIComponent(injection)}`
    );
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.length, 0);

    // Confirm the table was not dropped
    const verify = await request(app).get('/api/internships');
    assert.equal(verify.status, 200);
    assert.ok(verify.body.data.length > 0, 'Internships table must still exist');
  });

  it('SEC-08: SQL injection in applicant_email field must be rejected by validation', async () => {
    const res = await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'SQL Injector',
      applicant_email: "'; DROP TABLE applications; --",
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  // =========================================================================
  // E. Rate Limiting Headers Presence
  // =========================================================================

  it('RL-01: API responses should include RateLimit headers (draft-8 standard)', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);

    // express-rate-limit with standardHeaders: 'draft-8' sets RateLimit-* headers
    // At minimum one of these should be present:
    const hasRateLimitHeader =
      res.headers['ratelimit-limit'] !== undefined ||
      res.headers['ratelimit-remaining'] !== undefined ||
      res.headers['ratelimit-policy'] !== undefined ||
      res.headers['x-ratelimit-limit'] !== undefined;

    assert.ok(hasRateLimitHeader, 'Expected rate limit headers in response');
  });

  it('RL-02: Configured general rate limit should reject requests after its threshold', async () => {
    const previousLimit = process.env.RATE_LIMIT_MAX;
    const previousWindow = process.env.RATE_LIMIT_WINDOW_MS;
    process.env.RATE_LIMIT_MAX = '2';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';

    try {
      const limitedApp = createApp(testDb);
      assert.equal((await request(limitedApp).get('/api/health')).status, 200);
      assert.equal((await request(limitedApp).get('/api/health')).status, 200);

      const limited = await request(limitedApp).get('/api/health');
      assert.equal(limited.status, 429);
      assert.equal(limited.body.error.code, 'RATE_LIMIT_EXCEEDED');
    } finally {
      if (previousLimit === undefined) delete process.env.RATE_LIMIT_MAX;
      else process.env.RATE_LIMIT_MAX = previousLimit;
      if (previousWindow === undefined) delete process.env.RATE_LIMIT_WINDOW_MS;
      else process.env.RATE_LIMIT_WINDOW_MS = previousWindow;
    }
  });

  it('RL-03: Configured application rate limit should reject excess submissions', async () => {
    const previousLimit = process.env.APPLY_RATE_LIMIT_MAX;
    const previousWindow = process.env.APPLY_RATE_LIMIT_WINDOW_MS;
    process.env.APPLY_RATE_LIMIT_MAX = '1';
    process.env.APPLY_RATE_LIMIT_WINDOW_MS = '60000';

    try {
      const limitedApp = createApp(testDb);
      const first = await request(limitedApp).post('/api/applications').send({
        internship_id: 'INT-001',
        applicant_name: 'First Applicant',
        applicant_email: 'first@example.com',
      });
      const second = await request(limitedApp).post('/api/applications').send({
        internship_id: 'INT-001',
        applicant_name: 'Second Applicant',
        applicant_email: 'second@example.com',
      });

      assert.equal(first.status, 201);
      assert.equal(second.status, 429);
      assert.equal(second.body.error.code, 'RATE_LIMIT_EXCEEDED');
    } finally {
      if (previousLimit === undefined) delete process.env.APPLY_RATE_LIMIT_MAX;
      else process.env.APPLY_RATE_LIMIT_MAX = previousLimit;
      if (previousWindow === undefined) delete process.env.APPLY_RATE_LIMIT_WINDOW_MS;
      else process.env.APPLY_RATE_LIMIT_WINDOW_MS = previousWindow;
    }
  });

  // =========================================================================
  // F. Error Envelope Consistency
  // =========================================================================

  it('ERR-01: Unknown route should return 404 with standard error envelope', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
    assert.equal(typeof res.body.error.code, 'string');
    assert.equal(typeof res.body.error.message, 'string');
    assert.equal(res.body.error.stack, undefined);
  });

  it('ERR-02: Invalid JSON body should return 400 with standard error envelope', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'INVALID_JSON');
    assert.equal(res.body.error.message, 'Request body must contain valid JSON.');
    assert.doesNotMatch(JSON.stringify(res.body), /invalid json/i);
  });

  it('PRIV-01: Application listings should not disclose applicant names or emails', async () => {
    await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'Private Applicant',
      applicant_email: 'private@example.com',
    });

    const res = await request(app).get('/api/applications');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].applicant_name, undefined);
    assert.equal(res.body.data[0].applicant_email, undefined);
  });

  // =========================================================================
  // G. Administrative Security & Authorization
  // =========================================================================

  it('AUTH-01: When ADMIN_API_KEY is configured, unauthenticated POST /api/internships should return 401', async () => {
    const prevKey = process.env.ADMIN_API_KEY;
    process.env.ADMIN_API_KEY = 'secret-test-key-123';
    try {
      const res = await request(app).post('/api/internships').send({
        id: 'INT-AUTH-1',
        title: 'Auth Test Intern',
        domain: 'Web Development',
        mode: 'Remote',
        duration_weeks: 4,
        applications_open: 1,
      });
      assert.equal(res.status, 401);
      assert.equal(res.body.status, 'error');
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    } finally {
      if (prevKey === undefined) delete process.env.ADMIN_API_KEY;
      else process.env.ADMIN_API_KEY = prevKey;
    }
  });

  it('AUTH-02: When ADMIN_API_KEY is configured, invalid key should return 401', async () => {
    const prevKey = process.env.ADMIN_API_KEY;
    process.env.ADMIN_API_KEY = 'secret-test-key-123';
    try {
      const res = await request(app)
        .post('/api/internships')
        .set('x-api-key', 'wrong-key')
        .send({
          id: 'INT-AUTH-2',
          title: 'Auth Test Intern',
          domain: 'Web Development',
          mode: 'Remote',
          duration_weeks: 4,
          applications_open: 1,
        });
      assert.equal(res.status, 401);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    } finally {
      if (prevKey === undefined) delete process.env.ADMIN_API_KEY;
      else process.env.ADMIN_API_KEY = prevKey;
    }
  });

  it('AUTH-03: When ADMIN_API_KEY is configured, valid x-api-key should succeed with 201', async () => {
    const prevKey = process.env.ADMIN_API_KEY;
    process.env.ADMIN_API_KEY = 'secret-test-key-123';
    try {
      const res = await request(app)
        .post('/api/internships')
        .set('x-api-key', 'secret-test-key-123')
        .send({
          id: 'INT-AUTH-3',
          title: 'Authorized Created Intern',
          domain: 'Web Development',
          mode: 'Remote',
          duration_weeks: 4,
          applications_open: 1,
        });
      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.id, 'INT-AUTH-3');
    } finally {
      if (prevKey === undefined) delete process.env.ADMIN_API_KEY;
      else process.env.ADMIN_API_KEY = prevKey;
    }
  });

  it('AUTH-04: When ADMIN_API_KEY is configured, valid Authorization Bearer should succeed on PUT', async () => {
    const prevKey = process.env.ADMIN_API_KEY;
    process.env.ADMIN_API_KEY = 'secret-test-key-123';
    try {
      const res = await request(app)
        .put('/api/internships/INT-001')
        .set('Authorization', 'Bearer secret-test-key-123')
        .send({
          title: 'Updated Frontend Title',
          domain: 'Web Development',
          mode: 'Remote',
          duration_weeks: 6,
          applications_open: 1,
        });
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.title, 'Updated Frontend Title');
    } finally {
      if (prevKey === undefined) delete process.env.ADMIN_API_KEY;
      else process.env.ADMIN_API_KEY = prevKey;
    }
  });

  it('AUTH-05: In production without ADMIN_API_KEY, mutations should return 403 Forbidden', async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevKey = process.env.ADMIN_API_KEY;
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_API_KEY;
    try {
      const res = await request(app)
        .delete('/api/internships/INT-001');
      assert.equal(res.status, 403);
      assert.equal(res.body.status, 'error');
      assert.equal(res.body.error.code, 'FORBIDDEN');
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevKey === undefined) delete process.env.ADMIN_API_KEY;
      else process.env.ADMIN_API_KEY = prevKey;
    }
  });
});
