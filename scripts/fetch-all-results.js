const fs = require('fs');
const path = require('path');

async function login() {
  const loginUrl = 'http://localhost:5000/api/auth/login';
  const adminEmail = 'admin@spiritualgifts.com';

  console.log('Logging in as admin...');

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: adminEmail }),
    });

    if (!response.ok) {
      throw new Error(`Login failed! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✓ Login successful');
    return data.token;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}

async function fetchAllResults() {
  // First, login to get the token
  const token = await login();

  const baseUrl = 'http://localhost:5000/api/admin/results';
  const limit = 10;
  let page = 1;
  let allResults = [];
  let hasNextPage = true;

  console.log('Starting to fetch all results...');

  while (hasNextPage) {
    const url = `${baseUrl}?search=&giftFilter=&page=${page}&limit=${limit}`;
    console.log(`Fetching page ${page}...`);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add results from this page
      if (data.results && data.results.length > 0) {
        allResults = allResults.concat(data.results);
        console.log(`✓ Page ${page}: Found ${data.results.length} results (Total so far: ${allResults.length})`);
      }

      // Check if there's a next page
      hasNextPage = data.pagination && data.pagination.hasNextPage;
      page++;

      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      break;
    }
  }

  console.log(`\nTotal results fetched: ${allResults.length}`);

  // Remove duplicates - keep most recent entry for each email
  console.log('\nRemoving duplicate emails...');
  const emailMap = new Map();
  
  allResults.forEach((user) => {
    const email = user.email.toLowerCase().trim();
    
    if (!emailMap.has(email)) {
      emailMap.set(email, user);
    } else {
      const existing = emailMap.get(email);
      const existingDate = new Date(existing.created_at);
      const currentDate = new Date(user.created_at);
      
      // Keep the more recent one
      if (currentDate > existingDate) {
        emailMap.set(email, user);
      }
    }
  });
  
  // Convert map back to array, sorted by created_at (most recent first)
  const cleanedResults = Array.from(emailMap.values()).sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  
  const duplicatesRemoved = allResults.length - cleanedResults.length;
  console.log(`✓ Duplicates removed: ${duplicatesRemoved}`);
  console.log(`✓ Unique entries: ${cleanedResults.length}`);

  // Save to JSON file in sheets folder
  const outputPath = path.join(__dirname, 'sheets', 'spiritual-gifts-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(cleanedResults, null, 2), 'utf8');
  
  console.log(`\n✓ Results saved to: ${outputPath}`);
  console.log('\n✅ Fetch complete! Ready to generate Excel report.\n');
}

fetchAllResults().catch(console.error);

