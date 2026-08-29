import express from 'express';
import cors from 'cors';

import studentRoutes from './routes/students.js';

const app = express();

app.use(cors());

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Student Management System backend is running.',
  });
});

app.use(
  '/api/students',
  studentRoutes
);

const PORT = 5050;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `Backend server running on http://localhost:${PORT}`
    );
  });
}

export default app;