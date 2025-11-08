const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'spiritual-gifts.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fullname TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        }
      });

      // Questions table
      db.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          gift_category TEXT NOT NULL,
          question_text TEXT NOT NULL,
          question_order INTEGER NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('Error creating questions table:', err);
          reject(err);
        }
      });

      // Spiritual gifts descriptions table
      db.run(`
        CREATE TABLE IF NOT EXISTS gift_descriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          gift_category TEXT UNIQUE NOT NULL,
          description TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('Error creating gift_descriptions table:', err);
          reject(err);
        }
      });

      // Quiz responses table
      db.run(`
        CREATE TABLE IF NOT EXISTS quiz_responses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating quiz_responses table:', err);
          reject(err);
        }
      });

      // Response details table
      db.run(`
        CREATE TABLE IF NOT EXISTS response_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          response_id INTEGER NOT NULL,
          question_id INTEGER NOT NULL,
          answer_value INTEGER NOT NULL,
          FOREIGN KEY (response_id) REFERENCES quiz_responses(id),
          FOREIGN KEY (question_id) REFERENCES questions(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating response_details table:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { db, initializeDatabase };

