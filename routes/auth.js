const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../database/init');

const router = express.Router();

// Signup endpoint
router.post('/signup', (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    return res.status(400).json({ error: 'Full name and email are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check if user already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    db.run(
      'INSERT INTO users (fullname, email, role) VALUES (?, ?, ?)',
      [fullname, email, 'user'],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }

        const userId = this.lastID;
        const token = jwt.sign(
          { id: userId, email, fullname, role: 'user' },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: userId, fullname, email, role: 'user' }
        });
      }
    );
  });
});

// Login endpoint
router.post('/login', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'No user found, please Sign up' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, fullname: user.fullname, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
      }
    });
  });
});

module.exports = router;

