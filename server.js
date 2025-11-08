require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database/init');
const { seedQuestions, seedGiftDescriptions, seedDefaultAdmin } = require('./database/seed');

// Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Spiritual Gifts API is running' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    await seedQuestions();
    await seedGiftDescriptions();
    await seedDefaultAdmin();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Export for Vercel
module.exports = app;

