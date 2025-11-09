const express = require('express');
const { sql } = require('../database/init');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorizeAdmin);

// Calculate spiritual gifts scores with descriptions
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

// Get all user results with search and filter
router.get('/results', async (req, res) => {
  const { search, giftFilter } = req.query;

  try {
    let results;
    
    if (search) {
      // Search with ILIKE (case-insensitive)
      const searchTerm = `%${search}%`;
      results = await sql`
        SELECT DISTINCT
          u.id as user_id,
          u.fullname,
          u.email,
          qr.id as response_id,
          qr.created_at
        FROM users u
        INNER JOIN quiz_responses qr ON u.id = qr.user_id
        WHERE u.fullname ILIKE ${searchTerm} OR u.email ILIKE ${searchTerm}
        ORDER BY qr.created_at DESC
      `;
    } else {
      results = await sql`
        SELECT DISTINCT
          u.id as user_id,
          u.fullname,
          u.email,
          qr.id as response_id,
          qr.created_at
        FROM users u
        INNER JOIN quiz_responses qr ON u.id = qr.user_id
        ORDER BY qr.created_at DESC
      `;
    }

    // If no gift filter, return results with top gifts
    if (!giftFilter) {
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          const rows = await sql`
            SELECT rd.answer_value, q.gift_category
            FROM response_details rd
            JOIN questions q ON rd.question_id = q.id
            WHERE rd.response_id = ${result.response_id}
          `;

          const gifts = await calculateGifts(rows);

          return {
            ...result,
            topGifts: gifts.slice(0, 3)
          };
        })
      );

      res.json({ results: enrichedResults });
    } else {
      // Filter by specific gift
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          const rows = await sql`
            SELECT rd.answer_value, q.gift_category
            FROM response_details rd
            JOIN questions q ON rd.question_id = q.id
            WHERE rd.response_id = ${result.response_id}
          `;

          const gifts = await calculateGifts(rows);

          const hasGift = gifts.some(g => 
            g.category.toLowerCase() === giftFilter.toLowerCase() && 
            g.percentage >= 60
          );

          if (hasGift) {
            return {
              ...result,
              topGifts: gifts.slice(0, 3)
            };
          }
          return null;
        })
      );

      const filtered = enrichedResults.filter(r => r !== null);
      res.json({ results: filtered });
    }
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Get specific user's quiz result details
router.get('/user/:userId/response/:responseId', async (req, res) => {
  const { userId, responseId } = req.params;

  try {
    // Get user info
    const userResult = await sql`SELECT * FROM users WHERE id = ${userId}`;

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'No user found, please Sign up' });
    }

    const user = userResult[0];

    // Get quiz response
    const quizResult = await sql`
      SELECT * FROM quiz_responses
      WHERE id = ${responseId} AND user_id = ${userId}
    `;

    if (quizResult.length === 0) {
      return res.status(404).json({ error: 'Quiz response not found' });
    }

    const quizResponse = quizResult[0];

    // Get all responses with question details
    const rows = await sql`
      SELECT rd.answer_value, q.gift_category, q.question_text, q.id as question_id, q.question_order
      FROM response_details rd
      JOIN questions q ON rd.question_id = q.id
      WHERE rd.response_id = ${responseId}
      ORDER BY q.question_order
    `;

    const gifts = await calculateGifts(rows);

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
  } catch (err) {
    console.error('Get user response error:', err);
    res.status(500).json({ error: 'Failed to fetch response details' });
  }
});

// Delete a user and all their data
router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin users
    if (user[0].role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Get all quiz responses for this user
    const responses = await sql`SELECT id FROM quiz_responses WHERE user_id = ${userId}`;
    const responseIds = responses.map(r => r.id);

    // Delete in correct order to respect foreign key constraints
    if (responseIds.length > 0) {
      // 1. Delete all response details for this user's quiz responses
      await sql`DELETE FROM response_details WHERE response_id = ANY(${responseIds})`;
      
      // 2. Delete all quiz responses for this user
      await sql`DELETE FROM quiz_responses WHERE user_id = ${userId}`;
    }

    // 3. Delete the user
    await sql`DELETE FROM users WHERE id = ${userId}`;

    res.json({ 
      success: true, 
      message: 'User and all associated data deleted successfully',
      deletedUser: {
        id: user[0].id,
        fullname: user[0].fullname,
        email: user[0].email
      }
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all gift categories
router.get('/gift-categories', async (req, res) => {
  try {
    const categories = await sql`
      SELECT DISTINCT gift_category FROM questions ORDER BY gift_category
    `;

    res.json({
      categories: categories.map(c => c.gift_category)
    });
  } catch (err) {
    console.error('Get gift categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all gift descriptions
router.get('/gift-descriptions', async (req, res) => {
  try {
    const descriptions = await sql`
      SELECT gift_category, description FROM gift_descriptions ORDER BY gift_category
    `;

    res.json({
      descriptions
    });
  } catch (err) {
    console.error('Get gift descriptions error:', err);
    res.status(500).json({ error: 'Failed to fetch descriptions' });
  }
});

// Create admin user
router.post('/create-admin', async (req, res) => {
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

    // Create new admin user
    const result = await sql`
      INSERT INTO users (fullname, email, role)
      VALUES (${fullname}, ${email}, 'admin')
      RETURNING id
    `;

    const userId = result[0].id;

    res.status(201).json({
      message: 'Admin user created successfully',
      user: { 
        id: userId, 
        fullname, 
        email, 
        role: 'admin' 
      }
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  const { role, search } = req.query;

  try {
    let users;

    if (role && search) {
      const searchTerm = `%${search}%`;
      users = await sql`
        SELECT id, fullname, email, role, created_at FROM users
        WHERE role = ${role}
        AND (fullname ILIKE ${searchTerm} OR email ILIKE ${searchTerm})
        ORDER BY created_at DESC
      `;
    } else if (role) {
      users = await sql`
        SELECT id, fullname, email, role, created_at FROM users
        WHERE role = ${role}
        ORDER BY created_at DESC
      `;
    } else if (search) {
      const searchTerm = `%${search}%`;
      users = await sql`
        SELECT id, fullname, email, role, created_at FROM users
        WHERE fullname ILIKE ${searchTerm} OR email ILIKE ${searchTerm}
        ORDER BY created_at DESC
      `;
    } else {
      users = await sql`
        SELECT id, fullname, email, role, created_at FROM users
        ORDER BY created_at DESC
      `;
    }

    // Count quiz responses for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const countResult = await sql`
          SELECT COUNT(*) as quiz_count FROM quiz_responses WHERE user_id = ${user.id}
        `;

        return {
          ...user,
          quiz_count: parseInt(countResult[0].quiz_count)
        };
      })
    );

    res.json({ 
      users: enrichedUsers,
      total: enrichedUsers.length
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ==================== QUESTION MANAGEMENT ROUTES ====================

// Get all questions with optional filtering
router.get('/questions', async (req, res) => {
  const { category, search } = req.query;

  try {
    let questions;

    if (category && search) {
      const searchTerm = `%${search}%`;
      questions = await sql`
        SELECT * FROM questions
        WHERE gift_category = ${category}
        AND question_text ILIKE ${searchTerm}
        ORDER BY question_order
      `;
    } else if (category) {
      questions = await sql`
        SELECT * FROM questions
        WHERE gift_category = ${category}
        ORDER BY question_order
      `;
    } else if (search) {
      const searchTerm = `%${search}%`;
      questions = await sql`
        SELECT * FROM questions
        WHERE question_text ILIKE ${searchTerm}
        ORDER BY question_order
      `;
    } else {
      questions = await sql`
        SELECT * FROM questions
        ORDER BY question_order
      `;
    }

    res.json({
      questions,
      total: questions.length
    });
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get single question by ID
router.get('/questions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const question = await sql`
      SELECT * FROM questions WHERE id = ${id}
    `;

    if (question.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ question: question[0] });
  } catch (err) {
    console.error('Get question error:', err);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Create new question
router.post('/questions', async (req, res) => {
  const { gift_category, question_text, question_order } = req.body;

  if (!gift_category || !question_text) {
    return res.status(400).json({ error: 'Gift category and question text are required' });
  }

  try {
    // If question_order not provided, get the max order and add 1
    let order = question_order;
    if (!order) {
      const maxOrder = await sql`
        SELECT COALESCE(MAX(question_order), 0) as max_order FROM questions
      `;
      order = maxOrder[0].max_order + 1;
    }

    const result = await sql`
      INSERT INTO questions (gift_category, question_text, question_order)
      VALUES (${gift_category}, ${question_text}, ${order})
      RETURNING *
    `;

    res.status(201).json({
      message: 'Question created successfully',
      question: result[0]
    });
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question
router.put('/questions/:id', async (req, res) => {
  const { id } = req.params;
  const { gift_category, question_text, question_order } = req.body;

  if (!gift_category || !question_text || !question_order) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await sql`
      UPDATE questions
      SET gift_category = ${gift_category},
          question_text = ${question_text},
          question_order = ${question_order}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({
      message: 'Question updated successfully',
      question: result[0]
    });
  } catch (err) {
    console.error('Update question error:', err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete question
router.delete('/questions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if question is used in any responses
    const usageCheck = await sql`
      SELECT COUNT(*) as count FROM response_details WHERE question_id = ${id}
    `;

    if (parseInt(usageCheck[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete question that has been answered by users',
        responseCount: parseInt(usageCheck[0].count)
      });
    }

    const result = await sql`
      DELETE FROM questions WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({
      message: 'Question deleted successfully',
      question: result[0]
    });
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Bulk upload questions
router.post('/questions/bulk', async (req, res) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Questions array is required' });
  }

  // Validate all questions
  for (const q of questions) {
    if (!q.gift_category || !q.question_text) {
      return res.status(400).json({
        error: 'Each question must have gift_category and question_text'
      });
    }
  }

  try {
    // Get current max order
    const maxOrder = await sql`
      SELECT COALESCE(MAX(question_order), 0) as max_order FROM questions
    `;
    let currentOrder = maxOrder[0].max_order;

    const insertedQuestions = [];

    // Insert questions one by one
    for (const q of questions) {
      currentOrder++;
      const order = q.question_order || currentOrder;

      const result = await sql`
        INSERT INTO questions (gift_category, question_text, question_order)
        VALUES (${q.gift_category}, ${q.question_text}, ${order})
        RETURNING *
      `;

      insertedQuestions.push(result[0]);
    }

    res.status(201).json({
      message: `${insertedQuestions.length} questions created successfully`,
      questions: insertedQuestions,
      total: insertedQuestions.length
    });
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ error: 'Failed to upload questions' });
  }
});

// Delete all questions (with safety check)
router.delete('/questions', async (req, res) => {
  const { confirm } = req.body;

  if (confirm !== 'DELETE_ALL_QUESTIONS') {
    return res.status(400).json({
      error: 'Please confirm deletion by sending {"confirm": "DELETE_ALL_QUESTIONS"}'
    });
  }

  try {
    // Check if any questions have responses
    const usageCheck = await sql`
      SELECT COUNT(*) as count FROM response_details
    `;

    if (parseInt(usageCheck[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete questions. Users have already submitted responses.',
        responseCount: parseInt(usageCheck[0].count)
      });
    }

    const deleted = await sql`
      DELETE FROM questions RETURNING *
    `;

    res.json({
      message: `${deleted.length} questions deleted successfully`,
      deletedCount: deleted.length
    });
  } catch (err) {
    console.error('Delete all questions error:', err);
    res.status(500).json({ error: 'Failed to delete questions' });
  }
});

module.exports = router;
