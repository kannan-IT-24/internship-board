import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDb, initSchema } from '../src/config/database.js';
import { seedDatabase } from '../src/db/seed.js';

describe('InternHub REST API Automated Test Suite', () => {
  let app;
  let testDb;

  beforeEach(() => {
    // Isolated in-memory database for each test
    testDb = getDb(':memory:');
    initSchema(testDb);
    seedDatabase(testDb);
    app = createApp(testDb);
  });

  // 1. Health endpoint
  it('1. GET /api/health should return 200 with health status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.status, 'healthy');
    assert.ok(res.body.data.message);
  });

  // 2. List internships
  it('2. GET /api/internships should return 200 with list of seeded internships', async () => {
    const res = await request(app).get('/api/internships');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 4);
    assert.equal(res.body.pagination.total, 4);
    assert.equal(res.body.data[0].id, 'INT-001');
  });

  // 3. Pagination
  it('3. GET /api/internships?page=1&limit=2 should return 200 with paginated results', async () => {
    const res = await request(app).get('/api/internships?page=1&limit=2');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.limit, 2);
    assert.equal(res.body.pagination.total, 4);
    assert.equal(res.body.pagination.totalPages, 2);
  });

  // 4. Search
  it('4. GET /api/internships?q=frontend should return matching record', async () => {
    const res = await request(app).get('/api/internships?q=frontend');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, 'INT-001');
    assert.match(res.body.data[0].title.toLowerCase(), /frontend/);
  });

  // 5. Domain filter
  it('5. GET /api/internships?domain=UI/UX should return matching domain records', async () => {
    const res = await request(app).get('/api/internships?domain=UI%2FUX');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, 'INT-003');
    assert.equal(res.body.data[0].domain, 'UI/UX');
  });

  // 6. Mode filter
  it('6. GET /api/internships?mode=Hybrid should return matching mode records', async () => {
    const res = await request(app).get('/api/internships?mode=Hybrid');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, 'INT-003');
    assert.equal(res.body.data[0].mode, 'Hybrid');
  });

  // 7. Successful detail request
  it('7. GET /api/internships/INT-001 should return 200 and single internship details', async () => {
    const res = await request(app).get('/api/internships/INT-001');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.id, 'INT-001');
    assert.equal(res.body.data.title, 'Frontend Practice Internship');
    assert.equal(res.body.data.domain, 'Web Development');
    assert.equal(res.body.data.mode, 'Remote');
    assert.equal(res.body.data.duration_weeks, 4);
    assert.equal(res.body.data.applications_open, 1);
  });

  // 8. Unknown internship ID
  it('8. GET /api/internships/INT-999 should return 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/internships/INT-999');
    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'NOT_FOUND');
    assert.ok(res.body.error.message);
  });

  // 9. Successful internship creation
  it('9. POST /api/internships should create a new internship and return 201', async () => {
    const newInternship = {
      id: 'INT-005',
      title: 'DevOps Cloud Internship',
      domain: 'Cloud Computing',
      mode: 'Remote',
      duration_weeks: 8,
      applications_open: 1,
    };

    const res = await request(app)
      .post('/api/internships')
      .send(newInternship);

    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.id, 'INT-005');
    assert.equal(res.body.data.title, 'DevOps Cloud Internship');

    // Confirm it exists in DB
    const getRes = await request(app).get('/api/internships/INT-005');
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.data.id, 'INT-005');
  });

  // 10. Missing required internship fields
  it('10. POST /api/internships should reject missing required fields with 400', async () => {
    const invalidPayload = {
      id: 'INT-006',
      // title is missing
      domain: 'Web Development',
      mode: 'Remote',
    };

    const res = await request(app)
      .post('/api/internships')
      .send(invalidPayload);

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  // 11. Duplicate internship ID
  it('11. POST /api/internships with duplicate ID should return 409 CONFLICT', async () => {
    const duplicatePayload = {
      id: 'INT-001', // Already exists in seed
      title: 'Duplicate Internship',
      domain: 'Web Development',
      mode: 'Remote',
      duration_weeks: 4,
      applications_open: 1,
    };

    const res = await request(app)
      .post('/api/internships')
      .send(duplicatePayload);

    assert.equal(res.status, 409);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'CONFLICT');
  });

  // 12. Successful update
  it('12. PUT /api/internships/:id should update internship and return 200', async () => {
    const updatePayload = {
      title: 'Advanced Frontend Practice Internship',
      domain: 'Web Development',
      mode: 'Hybrid',
      duration_weeks: 6,
      applications_open: 1,
    };

    const res = await request(app)
      .put('/api/internships/INT-001')
      .send(updatePayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.title, 'Advanced Frontend Practice Internship');
    assert.equal(res.body.data.mode, 'Hybrid');
    assert.equal(res.body.data.duration_weeks, 6);
  });

  // 13. Update for an unknown ID
  it('13. PUT /api/internships/:id for unknown ID should return 404 NOT_FOUND', async () => {
    const updatePayload = {
      title: 'Nonexistent Internship',
      domain: 'Web Development',
      mode: 'Remote',
      duration_weeks: 4,
      applications_open: 1,
    };

    const res = await request(app)
      .put('/api/internships/INT-999')
      .send(updatePayload);

    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  // 14. Successful deletion
  it('14. DELETE /api/internships/:id should delete internship with no applications and return 200', async () => {
    const res = await request(app).delete('/api/internships/INT-004');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.id, 'INT-004');
    assert.equal(res.body.data.deleted, true);

    // Verify subsequent lookup yields 404
    const getRes = await request(app).get('/api/internships/INT-004');
    assert.equal(getRes.status, 404);
  });

  // 15. Deletion of a missing record
  it('15. DELETE /api/internships/:id for missing record should return 404 NOT_FOUND', async () => {
    const res = await request(app).delete('/api/internships/INT-999');
    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  // 16. Invalid pagination
  it('16. GET /api/internships with negative page or non-numeric limit should return 400', async () => {
    const resNegative = await request(app).get('/api/internships?page=-1');
    assert.equal(resNegative.status, 400);
    assert.equal(resNegative.body.status, 'error');
    assert.equal(resNegative.body.error.code, 'VALIDATION_ERROR');

    const resLimit = await request(app).get('/api/internships?limit=abc');
    assert.equal(resLimit.status, 400);
    assert.equal(resLimit.body.status, 'error');
    assert.equal(resLimit.body.error.code, 'VALIDATION_ERROR');
  });

  // 17. Successful application
  it('17. POST /api/applications with valid data should return 201', async () => {
    const applicationPayload = {
      internship_id: 'INT-001',
      applicant_name: 'Demo Applicant',
      applicant_email: 'demo@example.com',
    };

    const res = await request(app)
      .post('/api/applications')
      .send(applicationPayload);

    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'success');
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.internship_id, 'INT-001');
    assert.equal(res.body.data.applicant_name, 'Demo Applicant');
    assert.equal(res.body.data.applicant_email, 'demo@example.com');
    assert.ok(res.body.data.created_at);
  });

  // 18. Missing applicant name
  it('18. POST /api/applications with missing name should return 400 VALIDATION_ERROR', async () => {
    const payload = {
      internship_id: 'INT-001',
      // applicant_name missing
      applicant_email: 'test@example.com',
    };

    const res = await request(app)
      .post('/api/applications')
      .send(payload);

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  // 19. Invalid email
  it('19. POST /api/applications with invalid email format should return 400 VALIDATION_ERROR', async () => {
    const payload = {
      internship_id: 'INT-001',
      applicant_name: 'Test Applicant',
      applicant_email: 'not-an-email',
    };

    const res = await request(app)
      .post('/api/applications')
      .send(payload);

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  // 20. Application for a nonexistent internship
  it('20. POST /api/applications for nonexistent internship should return 404 NOT_FOUND', async () => {
    const payload = {
      internship_id: 'INT-NONEXISTENT',
      applicant_name: 'Test Applicant',
      applicant_email: 'test@example.com',
    };

    const res = await request(app)
      .post('/api/applications')
      .send(payload);

    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  // 21. Duplicate application
  it('21. POST /api/applications duplicate should return 409 CONFLICT', async () => {
    const payload = {
      internship_id: 'INT-002',
      applicant_name: 'Alice Applicant',
      applicant_email: 'alice@example.com',
    };

    // First application succeeds
    const firstRes = await request(app).post('/api/applications').send(payload);
    assert.equal(firstRes.status, 201);

    // Second application with identical internship and email is rejected
    const secondRes = await request(app).post('/api/applications').send(payload);
    assert.equal(secondRes.status, 409);
    assert.equal(secondRes.body.status, 'error');
    assert.equal(secondRes.body.error.code, 'CONFLICT');
  });

  // 22. Application to a closed internship
  it('22. POST /api/applications to closed internship (INT-004) should return 409 CONFLICT', async () => {
    const payload = {
      internship_id: 'INT-004', // applications_open is 0
      applicant_name: 'Bob Applicant',
      applicant_email: 'bob@example.com',
    };

    const res = await request(app)
      .post('/api/applications')
      .send(payload);

    assert.equal(res.status, 409);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'CONFLICT');
    assert.match(res.body.error.message.toLowerCase(), /closed/);
  });

  // 23. Consistent error response format
  it('23. Error responses must strictly adhere to the standard error envelope', async () => {
    const res = await request(app).get('/api/internships/INT-UNKNOWN-ID');
    assert.equal(res.status, 404);
    assert.equal(typeof res.body, 'object');
    assert.equal(res.body.status, 'error');
    assert.ok(res.body.error);
    assert.equal(typeof res.body.error.code, 'string');
    assert.equal(typeof res.body.error.message, 'string');
    // Ensure no leaks of internals
    assert.equal(res.body.error.stack, undefined);
    assert.equal(res.body.error.sql, undefined);
  });

  // 24. SQL injection-style input is handled safely
  it('24. SQL injection strings should be sanitized via parameterized queries', async () => {
    const sqlInjectionQuery = "' OR '1'='1' --";
    const res = await request(app).get(
      `/api/internships?q=${encodeURIComponent(sqlInjectionQuery)}`
    );
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    // Injection must not return all records; it searches literally for the injection string
    assert.equal(res.body.data.length, 0);
  });

  // Extra: Prevent deleting an internship with active applications
  it('DELETE /api/internships/:id with existing applications should return 409 CONFLICT', async () => {
    // Apply for INT-001
    await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'Dependent Applicant',
      applicant_email: 'dep@example.com',
    });

    // Attempt to delete INT-001
    const res = await request(app).delete('/api/internships/INT-001');
    assert.equal(res.status, 409);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.error.code, 'CONFLICT');
    assert.match(res.body.error.message.toLowerCase(), /active application/);
  });

  // Extra: GET /api/applications pagination works
  it('GET /api/applications returns paginated application list', async () => {
    await request(app).post('/api/applications').send({
      internship_id: 'INT-001',
      applicant_name: 'App One',
      applicant_email: 'app1@example.com',
    });
    await request(app).post('/api/applications').send({
      internship_id: 'INT-002',
      applicant_name: 'App Two',
      applicant_email: 'app2@example.com',
    });

    const res = await request(app).get('/api/applications?page=1&limit=10');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.pagination.total, 2);
    assert.equal(res.body.data.length, 2);
  });
});
