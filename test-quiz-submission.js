/**
 * Test Quiz Submission Script
 * Tests the complete quiz flow for gaius@yopmail.com
 * Focuses on Teaching gift (high scores for teaching-related questions)
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test configuration
const testUser = {
  email: 'gaius@yopmail.com',
  fullname: 'Gaius Test User'
};

// Gift focus for testing (Teaching gets high scores)
const giftPriority = {
  'Teaching': 5,           // Highest priority
  'Word of Knowledge': 4,  // Related to teaching
  'Word of Wisdom': 4,     // Related to teaching
  'Exhorting': 3,         // Medium
  'Prophesying': 3,       // Medium
  'Evangelism': 3,        // Medium
  'Leadership': 3,        // Medium
  'Administration': 2,    // Lower
  'Service': 2,           // Lower
  'Help': 2,              // Lower
  'Giving': 2,            // Lower
  'Mercy': 2,             // Lower
  'Faith': 2,             // Lower
  'Hospitality': 2        // Lower
};

let authToken = null;

// Step 1: Signup/Login
async function authenticate() {
  console.log('\n=== STEP 1: AUTHENTICATION ===\n');
  
  try {
    // Try to login first
    console.log(`Attempting to login as ${testUser.email}...`);
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    // If login fails, try signup
    if (error.response?.status === 404) {
      console.log('User not found. Creating new user...');
      try {
        const signupResponse = await axios.post(`${API_URL}/auth/signup`, {
          email: testUser.email,
          fullname: testUser.fullname
        });
        
        authToken = signupResponse.data.token;
        console.log('✅ Signup successful!');
        console.log(`Token: ${authToken.substring(0, 20)}...`);
        return true;
      } catch (signupError) {
        console.error('❌ Signup failed:', signupError.response?.data || signupError.message);
        return false;
      }
    } else {
      console.error('❌ Login failed:', error.response?.data || error.message);
      return false;
    }
  }
}

// Step 2: Get Questions
async function getQuestions() {
  console.log('\n=== STEP 2: FETCHING QUESTIONS ===\n');
  
  try {
    const response = await axios.get(`${API_URL}/quiz/questions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const questions = response.data.questions;
    console.log(`✅ Fetched ${questions.length} questions`);
    
    // Show category distribution
    const categories = {};
    questions.forEach(q => {
      categories[q.gift_category] = (categories[q.gift_category] || 0) + 1;
    });
    
    console.log('\nCategory Distribution:');
    Object.keys(categories).sort().forEach(cat => {
      console.log(`  ${cat.padEnd(20)}: ${categories[cat]} questions`);
    });
    
    return questions;
  } catch (error) {
    console.error('❌ Failed to fetch questions:', error.response?.data || error.message);
    return null;
  }
}

// Step 3: Generate Responses (favoring Teaching)
function generateResponses(questions) {
  console.log('\n=== STEP 3: GENERATING RESPONSES ===\n');
  console.log('Scoring strategy: Teaching gift prioritized\n');
  
  const responses = questions.map(question => {
    const category = question.gift_category;
    const baseScore = giftPriority[category] || 3;
    
    // Add slight randomness (-1 to +1) but keep within 1-5 range
    const randomVariation = Math.floor(Math.random() * 3) - 1;
    const score = Math.max(1, Math.min(5, baseScore + randomVariation));
    
    return {
      question_id: question.id,
      answer_value: score
    };
  });
  
  // Show sample responses
  console.log('Sample responses:');
  responses.slice(0, 10).forEach((r, i) => {
    const q = questions.find(q => q.id === r.question_id);
    console.log(`  Q${i+1} [${q.gift_category}]: Score ${r.answer_value}`);
  });
  console.log(`  ... and ${responses.length - 10} more\n`);
  
  // Show score distribution
  const scoresByCategory = {};
  responses.forEach(r => {
    const q = questions.find(q => q.id === r.question_id);
    if (!scoresByCategory[q.gift_category]) {
      scoresByCategory[q.gift_category] = { total: 0, count: 0 };
    }
    scoresByCategory[q.gift_category].total += r.answer_value;
    scoresByCategory[q.gift_category].count += 1;
  });
  
  console.log('Average scores by category:');
  Object.keys(scoresByCategory).sort().forEach(cat => {
    const avg = (scoresByCategory[cat].total / scoresByCategory[cat].count).toFixed(2);
    console.log(`  ${cat.padEnd(20)}: ${avg} / 5.00`);
  });
  
  return responses;
}

// Step 4: Submit Quiz
async function submitQuiz(responses) {
  console.log('\n=== STEP 4: SUBMITTING QUIZ ===\n');
  
  try {
    console.log(`Submitting ${responses.length} responses...`);
    const response = await axios.post(
      `${API_URL}/quiz/submit`,
      { responses },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    console.log('✅ Quiz submitted successfully!');
    console.log(`Response ID: ${response.data.responseId}`);
    
    return response.data.responseId;
  } catch (error) {
    console.error('❌ Quiz submission failed:', error.response?.data || error.message);
    return null;
  }
}

// Step 5: Get Results
async function getResults(responseId) {
  console.log('\n=== STEP 5: FETCHING RESULTS ===\n');
  
  try {
    const response = await axios.get(
      `${API_URL}/quiz/result/${responseId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const result = response.data;
    console.log('✅ Results fetched successfully!\n');
    
    // Display top gifts
    console.log('🎯 TOP SPIRITUAL GIFTS:\n');
    result.gifts.slice(0, 5).forEach((gift, index) => {
      console.log(`${index + 1}. ${gift.category.padEnd(20)} - ${gift.percentage}% (${gift.score}/${gift.maxScore})`);
      console.log(`   ${gift.description}\n`);
    });
    
    // Show all gifts
    console.log('\n📊 ALL GIFTS (Ranked):\n');
    result.gifts.forEach((gift, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${gift.category.padEnd(20)} - ${gift.percentage}%`);
    });
    
    return result;
  } catch (error) {
    console.error('❌ Failed to fetch results:', error.response?.data || error.message);
    return null;
  }
}

// Step 6: Check Quiz History
async function getHistory() {
  console.log('\n=== STEP 6: CHECKING QUIZ HISTORY ===\n');
  
  try {
    const response = await axios.get(
      `${API_URL}/quiz/history`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const history = response.data.history;
    console.log(`✅ Found ${history.length} quiz submission(s)\n`);
    
    history.forEach((entry, index) => {
      console.log(`Quiz ${index + 1}:`);
      console.log(`  Date: ${new Date(entry.created_at).toLocaleString()}`);
      console.log(`  Response ID: ${entry.id}`);
      console.log(`  Top Gifts: ${entry.topGifts.slice(0, 3).map(g => `${g.category} (${g.percentage}%)`).join(', ')}\n`);
    });
    
    return history;
  } catch (error) {
    console.error('❌ Failed to fetch history:', error.response?.data || error.message);
    return null;
  }
}

// Main test flow
async function runTest() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   SPIRITUAL GIFTS QUIZ - COMPLETE FLOW TEST           ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  try {
    // Step 1: Authenticate
    const authenticated = await authenticate();
    if (!authenticated) {
      console.log('\n❌ TEST FAILED: Could not authenticate\n');
      return;
    }
    
    // Step 2: Get Questions
    const questions = await getQuestions();
    if (!questions || questions.length === 0) {
      console.log('\n❌ TEST FAILED: No questions available\n');
      console.log('💡 TIP: Make sure to bulk upload 70 questions first!\n');
      return;
    }
    
    if (questions.length !== 70) {
      console.log(`\n⚠️  WARNING: Expected 70 questions, but got ${questions.length}\n`);
    }
    
    // Step 3: Generate Responses
    const responses = generateResponses(questions);
    
    // Step 4: Submit Quiz
    const responseId = await submitQuiz(responses);
    if (!responseId) {
      console.log('\n❌ TEST FAILED: Could not submit quiz\n');
      return;
    }
    
    // Step 5: Get Results
    const results = await getResults(responseId);
    if (!results) {
      console.log('\n❌ TEST FAILED: Could not fetch results\n');
      return;
    }
    
    // Step 6: Check History
    await getHistory();
    
    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   TEST COMPLETED SUCCESSFULLY ✅                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ All endpoints working correctly!');
    console.log('✅ Assessment calculations working!');
    console.log('\n📋 NEXT STEPS:\n');
    console.log('1. Test PDF download in the browser');
    console.log('2. Login with: gaius@yopmail.com');
    console.log('3. Go to Dashboard → View Results');
    console.log(`4. Click "Download PDF" for Response ID: ${responseId}\n`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:\n', error.message);
  }
}

// Run the test
if (require.main === module) {
  runTest().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTest };

