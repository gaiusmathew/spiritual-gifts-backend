const express = require('express');
const { sql } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all questions
router.get('/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await sql`SELECT * FROM questions ORDER BY question_order`;

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
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Calculate spiritual gifts scores
const calculateGifts = async (responses) => {
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
  const descriptions = await sql`SELECT gift_category, description FROM gift_descriptions`;

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

  return enrichedGifts;
};

// Submit quiz responses
router.post('/submit', authenticateToken, async (req, res) => {
  const { responses, comments } = req.body;
  const userId = req.user.id;

  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'Responses are required' });
  }

  try {
    // Use transaction
    await sql.begin(async sql => {
      // Create quiz response record with optional comments
      const responseResult = await sql`
        INSERT INTO quiz_responses (user_id, comments)
        VALUES (${userId}, ${comments || null})
        RETURNING id
      `;

      const responseId = responseResult[0].id;

      // Insert response details
      for (const response of responses) {
        await sql`
          INSERT INTO response_details (response_id, question_id, answer_value)
          VALUES (${responseId}, ${response.question_id}, ${response.answer_value})
        `;
      }

      // Fetch all responses with question details to calculate gifts
      const rows = await sql`
        SELECT rd.answer_value, q.gift_category, q.question_text
        FROM response_details rd
        JOIN questions q ON rd.question_id = q.id
        WHERE rd.response_id = ${responseId}
      `;

      const gifts = await calculateGifts(rows);

      res.status(201).json({
        message: 'Quiz submitted successfully',
        responseId,
        gifts
      });
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ error: 'Failed to save quiz response' });
  }
});

// Get user's quiz history
router.get('/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const history = await sql`
      SELECT qr.id, qr.created_at,
             COUNT(rd.id) as total_questions
      FROM quiz_responses qr
      LEFT JOIN response_details rd ON qr.id = rd.response_id
      WHERE qr.user_id = ${userId}
      GROUP BY qr.id
      ORDER BY qr.created_at DESC
    `;

    res.json({ history });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
});

// Get specific quiz result
router.get('/result/:responseId', authenticateToken, async (req, res) => {
  const { responseId } = req.params;
  const userId = req.user.id;

  try {
    // Verify the response belongs to the user (or user is admin)
    const quizResult = await sql`
      SELECT * FROM quiz_responses
      WHERE id = ${responseId}
      AND (user_id = ${userId} OR ${req.user.role} = 'admin')
    `;

    if (quizResult.length === 0) {
      return res.status(404).json({ error: 'Quiz result not found' });
    }

    const quizResponse = quizResult[0];

    // Fetch all responses with question details
    const rows = await sql`
      SELECT rd.answer_value, q.gift_category, q.question_text, q.id as question_id
      FROM response_details rd
      JOIN questions q ON rd.question_id = q.id
      WHERE rd.response_id = ${responseId}
      ORDER BY q.question_order
    `;

    const gifts = await calculateGifts(rows);

    res.json({
      responseId,
      userId: quizResponse.user_id,
      createdAt: quizResponse.created_at,
      comments: quizResponse.comments,
      gifts,
      responses: rows
    });
  } catch (err) {
    console.error('Get result error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz result' });
  }
});

module.exports = router;
