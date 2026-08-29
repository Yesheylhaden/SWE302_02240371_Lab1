import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

let app: any;

let container: Awaited<
  ReturnType<PostgreSqlContainer['start']>
>;

let pool: Pool;

beforeAll(async () => {
  // Start temporary PostgreSQL container
  container = await new PostgreSqlContainer(
    'postgres:15'
  ).start();

  // Configure application to use the temporary
  // PostgreSQL Testcontainer
  process.env.DB_HOST = container.getHost();

  process.env.DB_PORT =
    container.getPort().toString();

  process.env.DB_USER =
    container.getUsername();

  process.env.DB_PASSWORD =
    container.getPassword();

  process.env.DB_NAME =
    container.getDatabase();

  // Import server AFTER setting database
  // environment variables
  const serverModule =
    await import('../src/server.js');

  app = serverModule.default;

  // Create a separate pool for the tests
  pool = new Pool({
    host: container.getHost(),
    port: container.getPort(),
    user: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
  });

  // Create students table
  await pool.query(`
    CREATE TABLE students (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      drug_test_verified BOOLEAN DEFAULT FALSE
    )
  `);
});

beforeEach(async () => {
  // Clear students before every test
  await pool.query(
    'DELETE FROM students'
  );
});

afterAll(async () => {
  // Close the test pool first
  await pool.end();

  // Close the application's PostgreSQL pool
  // before stopping the Testcontainer
  const postgresModule =
    await import('../src/postgres.js');
  const appPool = postgresModule.default as any;

  if (appPool && typeof appPool.end === 'function') {
    await appPool.end();
  }

  // Stop the temporary PostgreSQL container
  await container.stop();
});

describe(
  'Student Management System - PostgreSQL Integration Tests',
  () => {

    it('should create/register a student', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          studentId: '02240001',
          password: 'Test123',
          name: 'Test Student',
          drugTestVerified: true,
        });

      expect(response.status).toBe(201);

      expect(response.body.success)
        .toBe(true);

      expect(
        response.body.student.student_id
      ).toBe('02240001');

      const result = await pool.query(
        `
        SELECT *
        FROM students
        WHERE student_id = $1
        `,
        ['02240001']
      );

      expect(result.rows)
        .toHaveLength(1);

      expect(result.rows[0].name)
        .toBe('Test Student');
    });

    it('should retrieve a student by student ID', async () => {
      await pool.query(
        `
        INSERT INTO students
          (
            student_id,
            password,
            name,
            drug_test_verified
          )
        VALUES ($1, $2, $3, $4)
        `,
        [
          '02240002',
          'Test123',
          'Student Two',
          true,
        ]
      );

      const response = await request(app)
        .get('/api/students/02240002');

      expect(response.status).toBe(200);

      expect(response.body.success)
        .toBe(true);

      expect(
        response.body.student.student_id
      ).toBe('02240002');
    });

    it('should return a list of registered students', async () => {
      await pool.query(`
        INSERT INTO students
          (
            student_id,
            password,
            name
          )
        VALUES
          (
            '02240003',
            'Test123',
            'Student Three'
          ),
          (
            '02240004',
            'Test123',
            'Student Four'
          )
      `);

      const response = await request(app)
        .get('/api/students');

      expect(response.status).toBe(200);

      expect(response.body.success)
        .toBe(true);

      expect(response.body.students)
        .toHaveLength(2);
    });

    it('should update student information', async () => {
      await pool.query(
        `
        INSERT INTO students
          (
            student_id,
            password,
            name
          )
        VALUES ($1, $2, $3)
        `,
        [
          '02240005',
          'Test123',
          'Old Name',
        ]
      );

      const response = await request(app)
        .put('/api/students/02240005')
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(200);

      expect(response.body.success)
        .toBe(true);

      expect(response.body.student.name)
        .toBe('Updated Name');

      const result = await pool.query(
        `
        SELECT name
        FROM students
        WHERE student_id = $1
        `,
        ['02240005']
      );

      expect(result.rows[0].name)
        .toBe('Updated Name');
    });

    it('should delete a student', async () => {
      await pool.query(
        `
        INSERT INTO students
          (
            student_id,
            password,
            name
          )
        VALUES ($1, $2, $3)
        `,
        [
          '02240006',
          'Test123',
          'Student Six',
        ]
      );

      const response = await request(app)
        .delete('/api/students/02240006');

      expect(response.status).toBe(200);

      expect(response.body.success)
        .toBe(true);

      const result = await pool.query(
        `
        SELECT *
        FROM students
        WHERE student_id = $1
        `,
        ['02240006']
      );

      expect(result.rows)
        .toHaveLength(0);
    });

    it('should prevent duplicate student records', async () => {
      await pool.query(
        `
        INSERT INTO students
          (
            student_id,
            password,
            name
          )
        VALUES ($1, $2, $3)
        `,
        [
          '02240007',
          'Test123',
          'Duplicate Student',
        ]
      );

      const response = await request(app)
        .post('/api/students')
        .send({
          studentId: '02240007',
          password: 'Test123',
          name: 'Duplicate Student',
        });

      expect(response.status).toBe(409);

      expect(response.body.success)
        .toBe(false);
    });

    it('should handle a non-existent student', async () => {
      const response = await request(app)
        .get('/api/students/99999999');

      expect(response.status).toBe(404);

      expect(response.body.success)
        .toBe(false);

      expect(response.body.message)
        .toBe('Student not found.');
    });

  }
);

