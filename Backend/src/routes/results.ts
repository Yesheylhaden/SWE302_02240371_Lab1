
import { Router } from 'express';

import db from '../database.js';

const router = Router();

router.get('/:studentId', (req, res) => {

  const student = db
    .prepare(
      'SELECT student_id FROM students WHERE student_id = ?'
    )
    .get(req.params.studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found.',
    });
  }

  const results = db
    .prepare(`
      SELECT
        module_code,
        module_name,
        grade
      FROM results
      WHERE student_id = ?
    `)
    .all(req.params.studentId);

  return res.json({
    success: true,
    results,
  });
});

export default router;

