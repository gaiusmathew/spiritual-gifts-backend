const postgres = require('postgres');

// Create PostgreSQL connection using Supabase pooler
// Support both DATABASE_URL and POSTGRES_URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const sql = postgres(connectionString, {
  ssl: 'require'
});

// Test connection
console.log('Connecting to PostgreSQL database...');

const initializeDatabase = async () => {
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Users table created/verified');

    // Questions table
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        gift_category TEXT NOT NULL,
        question_text TEXT NOT NULL,
        question_order INTEGER NOT NULL
      )
    `;
    console.log('Questions table created/verified');

    // Spiritual gifts descriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS gift_descriptions (
        id SERIAL PRIMARY KEY,
        gift_category TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL
      )
    `;
    console.log('Gift descriptions table created/verified');

    // Quiz responses table
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;
    console.log('Quiz responses table created/verified');
    
    // Add comments column if it doesn't exist (for existing databases)
    try {
      await sql`
        ALTER TABLE quiz_responses 
        ADD COLUMN IF NOT EXISTS comments TEXT
      `;
      console.log('Comments column added/verified');
    } catch (err) {
      // Column might already exist, that's fine
      console.log('Comments column already exists or error:', err.message);
    }

    // Response details table
    await sql`
      CREATE TABLE IF NOT EXISTS response_details (
        id SERIAL PRIMARY KEY,
        response_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer_value INTEGER NOT NULL,
        FOREIGN KEY (response_id) REFERENCES quiz_responses(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `;
    console.log('Response details table created/verified');

    console.log('✅ Database initialized successfully');
    console.log('✅ Connected to PostgreSQL database');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  }
};

module.exports = { sql, initializeDatabase };
