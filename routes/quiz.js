const express = require('express');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all questions
router.get('/questions', authenticateToken, (req, res) => {
  db.all('SELECT * FROM questions ORDER BY question_order', (err, questions) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.json({
      questions,
      instructions: {
        scale: [
          { value: 5, label: 'Very true of me' },
          { value: 4, label: 'Mostly true of me' },
          { value: 3, label: 'Sometimes true of me' },
          { value: 2, label: 'Rarely true of me' },
          { value: 1, label: 'Not true of me' }
        ],
        tip: 'Avoid choosing "3" unless it truly happens only once in a while. Try to lean toward either side that best fits you.'
      }
    });
  });
});

// Calculate spiritual gifts scores
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

// Submit quiz responses
router.post('/submit', authenticateToken, (req, res) => {
  const { responses } = req.body;
  const userId = req.user.id;

  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'Responses are required' });
  }

  // Start transaction
  db.serialize(() => {
    // Create quiz response record
    db.run(
      'INSERT INTO quiz_responses (user_id) VALUES (?)',
      [userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save quiz response' });
        }

        const responseId = this.lastID;

        // Prepare statement for inserting response details
        const stmt = db.prepare('INSERT INTO response_details (response_id, question_id, answer_value) VALUES (?, ?, ?)');

        responses.forEach(response => {
          stmt.run(responseId, response.question_id, response.answer_value);
        });

        stmt.finalize((err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to save response details' });
          }

          // Fetch all responses with question details to calculate gifts
          db.all(
            `SELECT rd.answer_value, q.gift_category, q.question_text
             FROM response_details rd
             JOIN questions q ON rd.question_id = q.id
             WHERE rd.response_id = ?`,
            [responseId],
            (err, rows) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to calculate results' });
              }

              calculateGifts(rows, (err, gifts) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to calculate results' });
                }

                res.status(201).json({
                  message: 'Quiz submitted successfully',
                  responseId,
                  gifts
                });
              });
            }
          );
        });
      }
    );
  });
});

// Get user's quiz history
router.get('/history', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT qr.id, qr.created_at,
            COUNT(rd.id) as total_questions
     FROM quiz_responses qr
     LEFT JOIN response_details rd ON qr.id = rd.response_id
     WHERE qr.user_id = ?
     GROUP BY qr.id
     ORDER BY qr.created_at DESC`,
    [userId],
    (err, responses) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch quiz history' });
      }

      res.json({ history: responses });
    }
  );
});

// Get specific quiz result
router.get('/result/:responseId', authenticateToken, (req, res) => {
  const { responseId } = req.params;
  const userId = req.user.id;

  // Verify the response belongs to the user (or user is admin)
  db.get(
    'SELECT * FROM quiz_responses WHERE id = ? AND (user_id = ? OR ? = "admin")',
    [responseId, userId, req.user.role],
    (err, quizResponse) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!quizResponse) {
        return res.status(404).json({ error: 'Quiz result not found' });
      }

      // Fetch all responses with question details
      db.all(
        `SELECT rd.answer_value, q.gift_category, q.question_text, q.id as question_id
         FROM response_details rd
         JOIN questions q ON rd.question_id = q.id
         WHERE rd.response_id = ?
         ORDER BY q.question_order`,
        [responseId],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch results' });
          }

          calculateGifts(rows, (err, gifts) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch results' });
            }

            res.json({
              responseId,
              userId: quizResponse.user_id,
              createdAt: quizResponse.created_at,
              gifts,
              responses: rows
            });
          });
        }
      );
    }
  );
});

module.exports = router;

