import { Router } from 'express';

import db from '../database.js';

import {
  validateStudentId,
  validatePassword,
} from '../utils/validation.js';

const router = Router();

router.post('/login', (req, res) => {

  const {
    studentId,
    password,
  } = req.body;

  if (!validateStudentId(studentId)) {
    return res.status(400).json({
      success: false,
      message:
        'Student ID must contain exactly 8 digits.',
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        'Invalid password format.',
    });
  }

  const student = db
    .prepare(`
      SELECT
        student_id,
        name,
        drug_test_verified
      FROM students
      WHERE student_id = ?
      AND password = ?
    `)
    .get(
      studentId,
      password
    ) as
    | {
        student_id: string;
        name: string;
        drug_test_verified: number;
      }
    | undefined;

  if (!student) {
    return res.status(401).json({
      success: false,
      message:
        'Invalid Student ID or password.',
    });
  }

  return res.json({
    success: true,
    student: {
      studentId: student.student_id,
      name: student.name,
      drugTestVerified:
        Boolean(student.drug_test_verified),
    },
  });
});

export default router;

