const { sql } = require('./database/init');

const checkQuestions = async () => {
  try {
    // Get total count
    const totalResult = await sql`SELECT COUNT(*) as count FROM questions`;
    const total = parseInt(totalResult[0].count);
    
    console.log('\n=== QUESTION DATABASE STATUS ===\n');
    console.log(`Total Questions: ${total}`);
    
    // Get count by category
    const categoryResult = await sql`
      SELECT gift_category, COUNT(*) as count 
      FROM questions 
      GROUP BY gift_category 
      ORDER BY gift_category
    `;
    
    console.log('\n=== Questions by Category ===\n');
    categoryResult.forEach(row => {
      console.log(`${row.gift_category.padEnd(20)} : ${row.count} questions`);
    });
    
    console.log(`\n=== TOTAL CATEGORIES: ${categoryResult.length} ===`);
    
    // Check for responses
    const responsesResult = await sql`SELECT COUNT(*) as count FROM response_details`;
    const responseCount = parseInt(responsesResult[0].count);
    
    console.log(`\n=== USER RESPONSES: ${responseCount} ===`);
    
    if (responseCount > 0) {
      console.log('\n⚠️  WARNING: Cannot delete questions - users have submitted responses!');
      console.log('You need to delete user responses first.');
    } else {
      console.log('\n✅ Safe to delete - no user responses found');
    }
    
    console.log('\n================================\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking questions:', err);
    process.exit(1);
  }
};

checkQuestions();

