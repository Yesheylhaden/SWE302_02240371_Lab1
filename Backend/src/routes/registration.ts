import { Router } from 'express';

import db from '../database.js';

import {
  checkRegistrationEligibility,
} from '../utils/registration.js';

const router = Router();

router.post('/register', (req, res) => {

  const {
    studentId,
    moduleCode,
  } = req.body;

  if (!studentId || !moduleCode) {
    return res.status(400).json({
      success: false,
      message:
        'Student ID and module code are required.',
    });
  }

  const student = db
    .prepare(`
      SELECT
        student_id,
        drug_test_verified
      FROM students
      WHERE student_id = ?
    `)
    .get(studentId) as
    | {
        student_id: string;
        drug_test_verified: number;
      }
    | undefined;

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found.',
    });
  }

  const payment = db
    .prepare(`
      SELECT id
      FROM payments
      WHERE student_id = ?
      AND verified = 1
      ORDER BY id DESC
      LIMIT 1
    `)
    .get(studentId);

  const paymentVerified =
    Boolean(payment);

  const drugTestVerified =
    Boolean(student.drug_test_verified);

  const registrationOpen = true;

  const eligibility =
    checkRegistrationEligibility({
      paymentVerified,
      drugTestVerified,
      registrationOpen,
    });

  if (eligibility !== 'Registration Allowed') {
    return res.status(400).json({
      success: false,
      message: eligibility,
    });
  }

  const duplicate = db
    .prepare(`
      SELECT id
      FROM registrations
      WHERE student_id = ?
      AND module_code = ?
    `)
    .get(
      studentId,
      moduleCode
    );

  if (duplicate) {
    return res.status(409).json({
      success: false,
      message:
        'You cannot register the same module more than once.',
    });
  }

  const result = db
    .prepare(`
      INSERT INTO registrations
      (
        student_id,
        module_code
      )
      VALUES (?, ?)
    `)
    .run(
      studentId,
      moduleCode
    );

  return res.json({
    success: true,
    message:
      `${moduleCode} registration successful.`,
    registrationId:
      result.lastInsertRowid,
  });
});

router.get('/:studentId', (req, res) => {

  const registrations = db
    .prepare(`
      SELECT
        id,
        module_code,
        registered_at
      FROM registrations
      WHERE student_id = ?
      ORDER BY id DESC
    `)
    .all(req.params.studentId);

  return res.json({
    success: true,
    registrations,
  });
});

export default router;

