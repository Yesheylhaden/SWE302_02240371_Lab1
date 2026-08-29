import { Router } from 'express';
import pool from '../postgres.js';

const router = Router();

// Create/Register a student
router.post('/', async (req, res) => {
  const {
    studentId,
    password,
    name,
    drugTestVerified = false,
  } = req.body;

  if (!studentId || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Student ID, password, and name are required.',
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO students
        (student_id, password, name, drug_test_verified)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id,
        student_id,
        name,
        drug_test_verified
      `,
      [
        studentId,
        password,
        name,
        drugTestVerified,
      ]
    );

    return res.status(201).json({
      success: true,
      student: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Student already exists.',
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create student.',
    });
  }
});

// Get all students
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        student_id,
        name,
        drug_test_verified
      FROM students
      ORDER BY id
    `);

    return res.json({
      success: true,
      students: result.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students.',
    });
  }
});

// Get one student
router.get('/:studentId', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        student_id,
        name,
        drug_test_verified
      FROM students
      WHERE student_id = $1
      `,
      [req.params.studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    return res.json({
      success: true,
      student: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student.',
    });
  }
});

// Update student
router.put('/:studentId', async (req, res) => {
  const {
    password,
    name,
    drugTestVerified,
  } = req.body;

  if (!password && !name && drugTestVerified === undefined) {
    return res.status(400).json({
      success: false,
      message: 'At least one field is required for update.',
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE students
      SET
        password = COALESCE($1, password),
        name = COALESCE($2, name),
        drug_test_verified =
          COALESCE($3, drug_test_verified)
      WHERE student_id = $4
      RETURNING
        id,
        student_id,
        name,
        drug_test_verified
      `,
      [
        password ?? null,
        name ?? null,
        drugTestVerified ?? null,
        req.params.studentId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    return res.json({
      success: true,
      student: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update student.',
    });
  }
});

// Delete student
router.delete('/:studentId', async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM students
      WHERE student_id = $1
      RETURNING student_id
      `,
      [req.params.studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Student deleted successfully.',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete student.',
    });
  }
});

export default router;