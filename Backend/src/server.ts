import express from 'express';
import cors from 'cors';

import './database.js';

import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payments.js';
import registrationRoutes from './routes/registration.js';
import resultsRoutes from './routes/results.js';

const app = express();

app.use(cors());

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message:
      'Student Management System backend is running.',
  });
});

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/payments',
  paymentRoutes
);

app.use(
  '/api/registration',
  registrationRoutes
);

app.use(
  '/api/results',
  resultsRoutes
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
