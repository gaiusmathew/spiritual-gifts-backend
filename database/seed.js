const { sql } = require('./init');

// Questions from requirements file - shuffled to avoid grouping by category
const questions = [
  // Original order maintained but will be shuffled
  { gift_category: 'Teaching', question_text: 'I am disciplined and willing to study hard, sacrifice personal time and spend hours in preparing for speaking sessions.' },
  { gift_category: 'Teaching', question_text: 'God enables me to accurately interpret, clearly explain and apply His Word.' },
  { gift_category: 'Teaching', question_text: 'When someone asks a question about the Bible, I enjoy researching it and responding thoughtfully.' },
  { gift_category: 'Teaching', question_text: 'Other people often come to me asking "can you explain that passage?"' },
  { gift_category: 'Teaching', question_text: 'I can easily organize my thoughts, structure my sharing and communicate clearly when I teach.' },
  
  { gift_category: 'Exhorting', question_text: 'I easily notice when someone is discouraged and feel naturally moved to encourage them.' },
  { gift_category: 'Exhorting', question_text: 'When people share their burdens, I feel motivated to walk alongside them and uplift them.' },
  { gift_category: 'Exhorting', question_text: 'My teaching is more devotional in nature and focused on the doing aspect rather than revealing in-depth truths from God\'s Word.' },
  { gift_category: 'Exhorting', question_text: 'People often say they feel encouraged or motivated after I speak or teach.' },
  { gift_category: 'Exhorting', question_text: 'I enjoy mentoring, discipling, or counselling others personally.' },
  
  { gift_category: 'Prophesying', question_text: 'I have a strong hatred for sin and a deep passion for holiness, and I feel called to confront and address these matters in the church.' },
  { gift_category: 'Prophesying', question_text: 'I have a strong desire to help others grow spiritually and live according to God\'s Word.' },
  { gift_category: 'Prophesying', question_text: 'When I speak or teach, I do so with urgency and conviction, wanting people to respond.' },
  { gift_category: 'Prophesying', question_text: 'I\'m willing to confront issues of moral compromise in the church as the Spirit leads.' },
  { gift_category: 'Prophesying', question_text: 'I feel a strong burden for the church to be pure, truthful, and spiritually active rather than passive and comfortable.' },
  
  { gift_category: 'Word of Knowledge', question_text: 'I often see connections, themes, and patterns in Scripture that others might overlook.' },
  { gift_category: 'Word of Knowledge', question_text: 'When I speak from God\'s Word, it is usually rich in factual, historical, and contextual insights.' },
  { gift_category: 'Word of Knowledge', question_text: 'I believe God has equipped me to help people understand biblical truths in-depth than just teaching the practical applications.' },
  { gift_category: 'Word of Knowledge', question_text: 'I make good use of various study tools and resources to find accurate biblical information.' },
  { gift_category: 'Word of Knowledge', question_text: 'I often explain ideas in an academic way by connecting different Bible passages to show one unified truth.' },
  
  { gift_category: 'Word of Wisdom', question_text: 'I may not remember many facts or historical details, but applying Scripture to real life comes naturally to me.' },
  { gift_category: 'Word of Wisdom', question_text: 'I can easily recognise how a biblical principle should be lived out in a specific circumstance.' },
  { gift_category: 'Word of Wisdom', question_text: 'I can sense when a decision isn\'t spiritually wise, even if it seems acceptable for others, and help others think it through.' },
  { gift_category: 'Word of Wisdom', question_text: 'In preparing to teach, I focus on practical wisdom rather than theoretical knowledge.' },
  { gift_category: 'Word of Wisdom', question_text: 'When I speak from God\'s Word, I focus on finding practical lessons and applications.' },
  
  { gift_category: 'Evangelism', question_text: 'I have a strong desire to share my faith with unbelievers.' },
  { gift_category: 'Evangelism', question_text: 'I find it easy to initiate spiritual conversations with strangers, friends and unbelievers.' },
  { gift_category: 'Evangelism', question_text: 'I\'m not discouraged by rejection or tough questions when sharing my faith—I see them as part of evangelism.' },
  { gift_category: 'Evangelism', question_text: 'I am aware of people in my circle (work, college, community) who do not know about Jesus and feel a personal burden to reach them.' },
  { gift_category: 'Evangelism', question_text: 'I am comfortable asking someone, "have you heard about Jesus?" or "have you thought about life after death?"' }
];

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Shuffle questions and assign order
const shuffledQuestions = shuffleArray(questions).map((q, index) => ({
  ...q,
  question_order: index + 1
}));

const seedQuestions = async () => {
  try {
    // Check if questions already exist
    const result = await sql`SELECT COUNT(*) as count FROM questions`;
    const count = parseInt(result[0].count);

    if (count > 0) {
      console.log('Questions already seeded');
      return;
    }

    // Insert questions
    for (const q of shuffledQuestions) {
      await sql`
        INSERT INTO questions (gift_category, question_text, question_order)
        VALUES (${q.gift_category}, ${q.question_text}, ${q.question_order})
      `;
    }

    console.log('✅ Questions seeded successfully');
  } catch (err) {
    console.error('Error seeding questions:', err);
    throw err;
  }
};

const giftDescriptions = [
  {
    gift_category: 'Teaching',
    description: 'The Spirit-given ability to deeply study, accurately interpret, clearly explain, and faithfully apply God\'s Word so that others grow toward spiritual maturity in Christ.'
  },
  {
    gift_category: 'Exhorting',
    description: 'The Spirit-given ability to encourage, comfort, and urge others toward obedience, faithfulness, and spiritual growth through words of counsel, comfort, or challenge.'
  },
  {
    gift_category: 'Prophesying',
    description: 'The Spirit-enabled ability to boldly proclaim God\'s written Word with passion, clarity and conviction, exposing sin, calling for repentance, and building up the church in holiness.'
  },
  {
    gift_category: 'Word of Knowledge',
    description: 'The Spirit-given ability to deeply understand, analyze, and articulate biblical truths and doctrinal insights with intellectual clarity and precision.'
  },
  {
    gift_category: 'Word of Wisdom',
    description: 'The Spirit-given ability to apply biblical truths and spiritual principles wisely to life situations, guiding others in godly and practical decision-making.'
  },
  {
    gift_category: 'Evangelism',
    description: 'The Spirit-given ability to effectively share the gospel with unbelievers and lead them to faith in Jesus Christ with clarity and conviction.'
  }
];

const seedGiftDescriptions = async () => {
  try {
    // Check if descriptions already exist
    const result = await sql`SELECT COUNT(*) as count FROM gift_descriptions`;
    const count = parseInt(result[0].count);

    if (count > 0) {
      console.log('Gift descriptions already seeded');
      return;
    }

    // Insert descriptions
    for (const gift of giftDescriptions) {
      await sql`
        INSERT INTO gift_descriptions (gift_category, description)
        VALUES (${gift.gift_category}, ${gift.description})
      `;
    }

    console.log('✅ Gift descriptions seeded successfully');
  } catch (err) {
    console.error('Error seeding gift descriptions:', err);
    throw err;
  }
};

const seedDefaultAdmin = async () => {
  try {
    // Check if any admin user exists
    const result = await sql`SELECT * FROM users WHERE role = ${'admin'}`;

    if (result.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin user
    const defaultAdmin = {
      fullname: 'Admin User',
      email: 'admin@spiritualgifts.com',
      role: 'admin'
    };

    await sql`
      INSERT INTO users (fullname, email, role)
      VALUES (${defaultAdmin.fullname}, ${defaultAdmin.email}, ${defaultAdmin.role})
    `;

    console.log(`✅ Default admin user created: ${defaultAdmin.email}`);
    console.log('You can now login with this email to get admin access');
  } catch (err) {
    console.error('Error seeding default admin:', err);
    throw err;
  }
};

module.exports = { seedQuestions, seedGiftDescriptions, seedDefaultAdmin };
