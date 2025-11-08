const express = require('express');
const { db } = require('../database/init');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorizeAdmin);

// Calculate spiritual gifts scores with descriptions
const calculateGifts = (responses, callback) => {
  const giftScores = {};

  responses.forEach(response => {
    if (!giftScores[response.gift_category]) {
      giftScores[response.gift_category] = {
        category: response.gift_category,
        totalScore: 0,
        maxScore: 0,
        count: 0
      };
    }
    giftScores[response.gift_category].totalScore += response.answer_value;
    giftScores[response.gift_category].maxScore += 5;
    giftScores[response.gift_category].count += 1;
  });

  // Calculate percentages
  const giftsArray = Object.values(giftScores).map(gift => ({
    category: gift.category,
    score: gift.totalScore,
    maxScore: gift.maxScore,
    percentage: Math.round((gift.totalScore / gift.maxScore) * 100),
    averageScore: (gift.totalScore / gift.count).toFixed(2)
  }));

  // Sort by percentage descending
  giftsArray.sort((a, b) => b.percentage - a.percentage);

  // Fetch descriptions from database
  db.all('SELECT gift_category, description FROM gift_descriptions', (err, descriptions) => {
    if (err) {
      callback(err, null);
      return;
    }

    // Create a map of descriptions
    const descMap = {};
    descriptions.forEach(desc => {
      descMap[desc.gift_category] = desc.description;
    });

    // Add descriptions to gifts
    const enrichedGifts = giftsArray.map(gift => ({
      ...gift,
      description: descMap[gift.category] || ''
    }));

    callback(null, enrichedGifts);
  });
};

// Get all user results with search and filter
router.get('/results', (req, res) => {
  const { search, giftFilter } = req.query;

  let query = `
    SELECT DISTINCT
      u.id as user_id,
      u.fullname,
      u.email,
      qr.id as response_id,
      qr.created_at
    FROM users u
    INNER JOIN quiz_responses qr ON u.id = qr.user_id
    WHERE 1=1
  `;

  const params = [];

  // Add search filter
  if (search) {
    query += ' AND (u.fullname LIKE ? OR u.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY qr.created_at DESC';

  db.all(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch results' });
    }

    // If no gift filter, return results
    if (!giftFilter) {
      // For each result, fetch their top gifts
      const promises = results.map(result => {
        return new Promise((resolve, reject) => {
          db.all(
            `SELECT rd.answer_value, q.gift_category
             FROM response_details rd
             JOIN questions q ON rd.question_id = q.id
             WHERE rd.response_id = ?`,
            [result.response_id],
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                calculateGifts(rows, (err, gifts) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve({
                      ...result,
                      topGifts: gifts.slice(0, 3)
                    });
                  }
                });
              }
            }
          );
        });
      });

      Promise.all(promises)
        .then(enrichedResults => {
          res.json({ results: enrichedResults });
        })
        .catch(err => {
          res.status(500).json({ error: 'Failed to calculate gifts' });
        });
    } else {
      // Filter by specific gift
      const promises = results.map(result => {
        return new Promise((resolve, reject) => {
          db.all(
            `SELECT rd.answer_value, q.gift_category
             FROM response_details rd
             JOIN questions q ON rd.question_id = q.id
             WHERE rd.response_id = ?`,
            [result.response_id],
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                calculateGifts(rows, (err, gifts) => {
                  if (err) {
                    reject(err);
                  } else {
                    const hasGift = gifts.some(g => 
                      g.category.toLowerCase() === giftFilter.toLowerCase() && 
                      g.percentage >= 60
                    );
                    if (hasGift) {
                      resolve({
                        ...result,
                        topGifts: gifts.slice(0, 3)
                      });
                    } else {
                      resolve(null);
                    }
                  }
                });
              }
            }
          );
        });
      });

      Promise.all(promises)
        .then(enrichedResults => {
          const filtered = enrichedResults.filter(r => r !== null);
          res.json({ results: filtered });
        })
        .catch(err => {
          res.status(500).json({ error: 'Failed to filter results' });
        });
    }
  });
});

// Get specific user's quiz result details
router.get('/user/:userId/response/:responseId', (req, res) => {
  const { userId, responseId } = req.params;

  // Get user info
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'No user found, please Sign up' });
    }

    // Get quiz response
    db.get(
      'SELECT * FROM quiz_responses WHERE id = ? AND user_id = ?',
      [responseId, userId],
      (err, quizResponse) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!quizResponse) {
          return res.status(404).json({ error: 'Quiz response not found' });
        }

        // Get all responses with question details
        db.all(
          `SELECT rd.answer_value, q.gift_category, q.question_text, q.id as question_id, q.question_order
           FROM response_details rd
           JOIN questions q ON rd.question_id = q.id
           WHERE rd.response_id = ?
           ORDER BY q.question_order`,
          [responseId],
          (err, rows) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch response details' });
            }

            calculateGifts(rows, (err, gifts) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to calculate gifts' });
              }

              res.json({
                user: {
                  id: user.id,
                  fullname: user.fullname,
                  email: user.email
                },
                quiz: {
                  responseId,
                  createdAt: quizResponse.created_at
                },
                gifts,
                responses: rows
              });
            });
          }
        );
      }
    );
  });
});

// Get all gift categories
router.get('/gift-categories', (req, res) => {
  db.all(
    'SELECT DISTINCT gift_category FROM questions ORDER BY gift_category',
    (err, categories) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }

      res.json({
        categories: categories.map(c => c.gift_category)
      });
    }
  );
});

// Get all gift descriptions
router.get('/gift-descriptions', (req, res) => {
  db.all(
    'SELECT gift_category, description FROM gift_descriptions ORDER BY gift_category',
    (err, descriptions) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch descriptions' });
      }

      res.json({
        descriptions
      });
    }
  );
});

// Create admin user
router.post('/create-admin', (req, res) => {
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

    // Create new admin user
    db.run(
      'INSERT INTO users (fullname, email, role) VALUES (?, ?, ?)',
      [fullname, email, 'admin'],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create admin user' });
        }

        const userId = this.lastID;

        res.status(201).json({
          message: 'Admin user created successfully',
          user: { 
            id: userId, 
            fullname, 
            email, 
            role: 'admin' 
          }
        });
      }
    );
  });
});

// Get all users
router.get('/users', (req, res) => {
  const { role, search } = req.query;

  let query = 'SELECT id, fullname, email, role, created_at FROM users WHERE 1=1';
  const params = [];

  // Filter by role (user or admin)
  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  // Search by name or email
  if (search) {
    query += ' AND (fullname LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // Count quiz responses for each user
    const promises = users.map(user => {
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT COUNT(*) as quiz_count FROM quiz_responses WHERE user_id = ?',
          [user.id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                ...user,
                quiz_count: result.quiz_count
              });
            }
          }
        );
      });
    });

    Promise.all(promises)
      .then(enrichedUsers => {
        res.json({ 
          users: enrichedUsers,
          total: enrichedUsers.length
        });
      })
      .catch(err => {
        res.status(500).json({ error: 'Failed to enrich user data' });
      });
  });
});

module.exports = router;

