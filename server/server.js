import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Database config
import { connectDB } from './config/db.js';
import { seedDatabase } from './data/seed.js';

// Models for cleanup
import User from './models/User.js';
import Issue from './models/Issue.js';
import Verification from './models/Verification.js';
import Notification from './models/Notification.js';

// Route files
import authRoutes from './routes/auth.js';
import issueRoutes from './routes/issues.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();

// Increase payload limits for base64 photo/video uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsPath));

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Community Hero API' });
});

// Port settings
const PORT = process.env.PORT || 5000;

// Connect to Database first, then spin up server
connectDB().then(async () => {
  // await seedDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${global.dbFallback ? 'Local JSON Fallback' : 'MongoDB'} mode`);
  });
});
