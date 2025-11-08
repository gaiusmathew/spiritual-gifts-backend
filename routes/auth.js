const express = require('express');
const jwt = require('jsonwebtoken');
const { sql } = require('../database/init');

const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    return res.status(400).json({ error: 'Full name and email are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if user already exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const result = await sql`
      INSERT INTO users (fullname, email, role)
      VALUES (${fullname}, ${email}, 'user')
      RETURNING id
    `;

    const userId = result[0].id;
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
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Find user by email
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (result.length === 0) {
      return res.status(404).json({ error: 'No user found, please Sign up' });
    }

    const user = result[0];

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
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
