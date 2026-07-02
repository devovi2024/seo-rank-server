import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRouter from './routes/authRoute.js';
import rankRouter from './routes/rankRoute.js';
import analysisRouter from './routes/analysisRoute.js';
import { startRankTrackingCron } from './cron/rankTrackingCron.js';

await connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/rank', rankRouter);
app.use('/api/analysis', analysisRouter);

// Start cron job for daily rank tracking
startRankTrackingCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});