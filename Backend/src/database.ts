import Database from 'better-sqlite3';

const db = new Database('student_management.db');

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    drug_test_verified INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    transaction_number TEXT NOT NULL,
    screenshot_name TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)
      REFERENCES students(student_id)
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    module_code TEXT NOT NULL,
    registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, module_code),
    FOREIGN KEY (student_id)
      REFERENCES students(student_id)
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    module_code TEXT NOT NULL,
    module_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    FOREIGN KEY (student_id)
      REFERENCES students(student_id)
  );
`);

const existingStudent = db
  .prepare(
    'SELECT student_id FROM students WHERE student_id = ?'
  )
  .get('02240371');

if (!existingStudent) {
  db.prepare(`
    INSERT INTO students
    (student_id, password, name, drug_test_verified)
    VALUES (?, ?, ?, ?)
  `).run(
    '02240371',
    'Yeshey20',
    'Yeshey Lhaden',
    1
  );
}

const existingResults = db
  .prepare(
    'SELECT COUNT(*) as count FROM results WHERE student_id = ?'
  )
  .get('02240371') as { count: number };

if (existingResults.count === 0) {
  const insertResult = db.prepare(`
    INSERT INTO results
    (student_id, module_code, module_name, grade)
    VALUES (?, ?, ?, ?)
  `);

  insertResult.run(
    '02240371',
    'SWE302',
    'Software Testing',
    'A'
  );

  insertResult.run(
    '02240371',
    'WEB303',
    'Microservices',
    'A-'
  );

  insertResult.run(
    '02240371',
    'SWE303',
    'Software Engineering',
    'B+'
  );
}

export default db;

