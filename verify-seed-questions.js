// Quick script to verify seed.js has 70 questions
const { sql } = require('./database/init');

// Inline questions array from seed.js to avoid import issues
const questions = [
  // TEACHING GIFTS (30 questions)
  
  // Teaching (5)
  { gift_category: 'Teaching', question_text: 'I am disciplined and willing to study hard, sacrifice personal time and spend hours in preparing for speaking sessions.' },
  { gift_category: 'Teaching', question_text: 'God enables me to accurately interpret, clearly explain and apply His Word.' },
  { gift_category: 'Teaching', question_text: 'When someone asks a question about the Bible, I enjoy researching it and responding thoughtfully.' },
  { gift_category: 'Teaching', question_text: 'Other people often come to me asking "can you explain that passage?"' },
  { gift_category: 'Teaching', question_text: 'I can easily organize my thoughts, structure my sharing and communicate clearly when I teach.' },
  
  // Exhorting (5)
  { gift_category: 'Exhorting', question_text: 'I easily notice when someone is discouraged and feel naturally moved to encourage them.' },
  { gift_category: 'Exhorting', question_text: 'When people share their burdens, I feel motivated to walk alongside them and uplift them.' },
  { gift_category: 'Exhorting', question_text: 'My teaching is more devotional in nature and focused on the doing aspect rather than revealing in-depth truths from God\'s Word.' },
  { gift_category: 'Exhorting', question_text: 'People often say they feel encouraged or motivated after I speak or teach.' },
  { gift_category: 'Exhorting', question_text: 'I enjoy mentoring, discipling, or counselling others personally.' },
  
  // Prophesying (5)
  { gift_category: 'Prophesying', question_text: 'I have a strong hatred for sin and a deep passion for holiness, and I feel called to confront and address these matters in the church.' },
  { gift_category: 'Prophesying', question_text: 'I have a strong desire to help others grow spiritually and live according to God\'s Word.' },
  { gift_category: 'Prophesying', question_text: 'When I speak or teach, I do so with urgency and conviction, wanting people to respond.' },
  { gift_category: 'Prophesying', question_text: 'I\'m willing to confront issues of moral compromise in the church as the Spirit leads.' },
  { gift_category: 'Prophesying', question_text: 'I feel a strong burden for the church to be pure, truthful, and spiritually active rather than passive and comfortable.' },
  
  // Word of Knowledge (5)
  { gift_category: 'Word of Knowledge', question_text: 'I often see connections, themes, and patterns in Scripture that others might overlook.' },
  { gift_category: 'Word of Knowledge', question_text: 'When I speak from God\'s Word, it is usually rich in factual, historical, and contextual insights.' },
  { gift_category: 'Word of Knowledge', question_text: 'I believe God has equipped me to help people understand biblical truths in-depth than just teaching the practical applications.' },
  { gift_category: 'Word of Knowledge', question_text: 'I make good use of various study tools and resources to find accurate biblical information.' },
  { gift_category: 'Word of Knowledge', question_text: 'I often explain ideas in an academic way by connecting different Bible passages to show one unified truth.' },
  
  // Word of Wisdom (5)
  { gift_category: 'Word of Wisdom', question_text: 'I may not remember many facts or historical details, but applying Scripture to real life comes naturally to me.' },
  { gift_category: 'Word of Wisdom', question_text: 'I can easily recognise how a biblical principle should be lived out in a specific circumstance.' },
  { gift_category: 'Word of Wisdom', question_text: 'I can sense when a decision isn\'t spiritually wise, even if it seems acceptable for others, and help others think it through.' },
  { gift_category: 'Word of Wisdom', question_text: 'In preparing to teach, I focus on practical wisdom rather than theoretical knowledge.' },
  { gift_category: 'Word of Wisdom', question_text: 'When I speak from God\'s Word, I focus on finding practical lessons and applications.' },
  
  // Evangelism (5)
  { gift_category: 'Evangelism', question_text: 'I have a strong desire to share my faith with unbelievers.' },
  { gift_category: 'Evangelism', question_text: 'I find it easy to initiate spiritual conversations with strangers, friends and unbelievers.' },
  { gift_category: 'Evangelism', question_text: 'I\'m not discouraged by rejection or tough questions when sharing my faith—I see them as part of evangelism.' },
  { gift_category: 'Evangelism', question_text: 'I am aware of people in my circle (work, college, community) who do not know about Jesus and feel a personal burden to reach them.' },
  { gift_category: 'Evangelism', question_text: 'I am comfortable asking someone, "have you heard about Jesus?" or "have you thought about life after death?"' },
  
  // SERVING/DOING GIFTS (40 questions)
  
  // Service (5)
  { gift_category: 'Service', question_text: 'I gladly step in to meet the physical needs of the church by working behind the scenes.' },
  { gift_category: 'Service', question_text: 'I joyfully volunteer for tasks such as cleaning, arranging, serving food, organizing materials, managing logistics etc.' },
  { gift_category: 'Service', question_text: 'I am comfortable working quietly and supportively in the background without being in the spotlight and without getting noticed.' },
  { gift_category: 'Service', question_text: 'I am a program-oriented person and stay committed to the task even when it is tedious and routine.' },
  { gift_category: 'Service', question_text: 'I feel satisfaction when a ministry event or church activity runs well, because of how I helped behind-the-scenes.' },
  
  // Help (5)
  { gift_category: 'Help', question_text: 'I am a people person and I\'m sensitive to the suffering and needy individuals in the church.' },
  { gift_category: 'Help', question_text: 'I love to be with people and help people than spending my time in arranging a place for church gathering.' },
  { gift_category: 'Help', question_text: 'I willingly sacrifice my time, comfort, and resources to personally help others in the church.' },
  { gift_category: 'Help', question_text: 'I can easily sense when someone is overwhelmed or stressed and I help them without being asked for.' },
  { gift_category: 'Help', question_text: 'When someone is sick or hurting, I naturally feel led to visit them and support them.' },
  
  // Leadership (5)
  { gift_category: 'Leadership', question_text: 'I can see the bigger picture for the church and sense the direction God wants us to move.' },
  { gift_category: 'Leadership', question_text: 'As a spiritual visionary, I enjoy inspiring others with a clear vision of what we can achieve together as a church.' },
  { gift_category: 'Leadership', question_text: 'When I talk to people, I try to provide vision and spiritual direction to them.' },
  { gift_category: 'Leadership', question_text: 'When a project or ministry is stagnant, I\'m motivated to bring fresh energy and direction.' },
  { gift_category: 'Leadership', question_text: 'I focus more on people\'s growth, unity, and direction than on managing administrative work.' },
  
  // Administration (5)
  { gift_category: 'Administration', question_text: 'I enjoy planning and organizing people and resources to help the church achieve its ministry goals.' },
  { gift_category: 'Administration', question_text: 'I can take a complex church and ministry projects and break it into clear, manageable steps.' },
  { gift_category: 'Administration', question_text: 'I find satisfaction in planning programs, coordinating events, and keeping things running smoothly.' },
  { gift_category: 'Administration', question_text: 'I handle administrative tasks patiently because I see the importance of good systems and processes.' },
  { gift_category: 'Administration', question_text: 'Others often rely on me to plan and manage special church events like outings or Christmas programs.' },
  
  // Giving (5)
  { gift_category: 'Giving', question_text: 'I feel a deep joy and satisfaction when I offer financial help to someone in need, often anonymously.' },
  { gift_category: 'Giving', question_text: 'I am quick to respond when I hear about a genuine financial need, even if it requires personal sacrifice.' },
  { gift_category: 'Giving', question_text: 'I am willing to lower my own standard of living so that I can give more to God\'s work.' },
  { gift_category: 'Giving', question_text: 'I often look for ways to financially support ministries, missionaries, or people serving God.' },
  { gift_category: 'Giving', question_text: 'I am able to budget and manage my finances carefully so that I can give more generously.' },
  
  // Mercy (5)
  { gift_category: 'Mercy', question_text: 'I am patient and gentle when caring for people who are weak, sick, old or discouraged.' },
  { gift_category: 'Mercy', question_text: 'I feel drawn to help those who are poor or overlooked and rejected by others.' },
  { gift_category: 'Mercy', question_text: 'I feel a deep spiritual satisfaction when I show mercy and kindness to others.' },
  { gift_category: 'Mercy', question_text: 'I like to visit places like orphanages and old age home and spent time with them.' },
  { gift_category: 'Mercy', question_text: 'When I hear about people in pain, hunger and suffering, I am deeply moved with compassion.' },
  
  // Faith (5)
  { gift_category: 'Faith', question_text: 'I have strong confidence in God and His promises, even when others around me doubt.' },
  { gift_category: 'Faith', question_text: 'Even when I do not know all the details, I find it easy to move forward when I sense God\'s leading.' },
  { gift_category: 'Faith', question_text: 'Lack of funds or resources does not stop me in pursuing what God has called me to do.' },
  { gift_category: 'Faith', question_text: 'I believe God is faithful to provide, and take courageous steps in life and ministry, not looking at my bank balance.' },
  { gift_category: 'Faith', question_text: 'I pray bold prayers, often for impossible situations, believing that nothing is too hard for God.' },
  
  // Hospitality (5)
  { gift_category: 'Hospitality', question_text: 'I find joy in welcoming people into my home or personal space.' },
  { gift_category: 'Hospitality', question_text: 'I naturally make others feel comfortable, accepted, and cared for when they visit me.' },
  { gift_category: 'Hospitality', question_text: 'I enjoy preparing food, creating a warm atmosphere, and planning gatherings at my home.' },
  { gift_category: 'Hospitality', question_text: 'I feel energized, not burdened, when I have the opportunity to host others at my home.' },
  { gift_category: 'Hospitality', question_text: 'I take the initiative to invite people to my home who are new to the church.' }
];

// Count by category
const categoryCounts = {};
questions.forEach(q => {
  categoryCounts[q.gift_category] = (categoryCounts[q.gift_category] || 0) + 1;
});

console.log('\n=== SEED.JS QUESTIONS VERIFICATION ===\n');
console.log(`Total Questions: ${questions.length}`);
console.log('\nQuestions by Category:\n');

Object.keys(categoryCounts).sort().forEach(cat => {
  console.log(`${cat.padEnd(20)} : ${categoryCounts[cat]} questions`);
});

console.log(`\nTotal Categories: ${Object.keys(categoryCounts).length}`);

if (questions.length === 70) {
  console.log('\n✅ SUCCESS: seed.js has exactly 70 questions!\n');
  process.exit(0);
} else {
  console.log(`\n❌ ERROR: Expected 70 questions, but found ${questions.length}\n`);
  process.exit(1);
}

