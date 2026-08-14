
import { Router } from 'express';

import db from '../database.js';

import {
  validateTransactionNumber,
  validateScreenshot,
} from '../utils/validation.js';

const router = Router();

router.post('/submit', (req, res) => {

  const {
    studentId,
    transactionNumber,
    screenshotName,
  } = req.body;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: 'Student ID is required.',
    });
  }

  if (!validateTransactionNumber(
    transactionNumber
  )) {
    return res.status(400).json({
      success: false,
      message:
        'Invalid transaction number. Format must be 123-123456789.',
    });
  }

  if (!screenshotName) {
    return res.status(400).json({
      success: false,
      message:
        'Payment screenshot is mandatory.',
    });
  }

  if (!validateScreenshot(
    screenshotName
  )) {
    return res.status(400).json({
      success: false,
      message:
        'Only JPG, JPEG, and PNG files are allowed.',
    });
  }

  const student = db
    .prepare(
      'SELECT student_id FROM students WHERE student_id = ?'
    )
    .get(studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found.',
    });
  }

  const result = db
    .prepare(`
      INSERT INTO payments
      (
        student_id,
        transaction_number,
        screenshot_name,
        verified
      )
      VALUES (?, ?, ?, ?)
    `)
    .run(
      studentId,
      transactionNumber,
      screenshotName,
      1
    );

  return res.json({
    success: true,
    message:
      'Payment submitted and verified successfully.',
    paymentId: result.lastInsertRowid,
    receipt: {
      studentId,
      transactionNumber,
      screenshotName,
      status: 'Verified',
    },
  });
});

router.get('/:studentId', (req, res) => {

  const payments = db
    .prepare(`
      SELECT
        id,
        transaction_number,
        screenshot_name,
        verified,
        created_at
      FROM payments
      WHERE student_id = ?
      ORDER BY id DESC
    `)
    .all(req.params.studentId);

  return res.json({
    success: true,
    payments,
  });
});

export default router;

