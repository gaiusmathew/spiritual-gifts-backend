require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database/init');
const { seedGiftDescriptions, seedDefaultAdmin } = require('./database/seed');

// Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Lazy database initialization for serverless
let dbInitialized = false;
const ensureDbInitialized = async () => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      // await seedQuestions(); // REMOVED: Questions should be added manually via bulk upload
      await seedGiftDescriptions();
      await seedDefaultAdmin();
      dbInitialized = true;
      console.log('Database initialized for serverless');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }
};

// Middleware to ensure DB is initialized before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (error) {
    console.error('Request failed - DB init error:', error);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Spiritual Gifts API is running' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

// Export for Vercel
module.exports = app;

