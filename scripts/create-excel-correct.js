const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Read the JSON data
const jsonPath = path.join(__dirname, 'sheets', 'spiritual-gifts-results.json');
const results = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Define all gift columns in exact order
const giftColumns = [
  'Teaching',
  'Exhorting',
  'Prophesying',
  'Word of Wisdom',
  'Word of Knowledge',
  'Evangelism',
  'Service',
  'Help',        // Note: JSON has "Help", not "Helps"
  'Leadership',
  'Administration',
  'Mercy',
  'Faith',
  'Giving',
  'Hospitality'
];

console.log('\n=== CREATING CORRECTED EXCEL FILE ===\n');

// Function to transform a single user's data
function transformUserData(user) {
  const row = {
    'Name': user.fullname
  };

  // Initialize all gifts to "NA"
  giftColumns.forEach(gift => {
    row[gift] = 'NA';
  });

  // Fill in the percentages for top 5 gifts
  if (user.topGifts && user.topGifts.length > 0) {
    user.topGifts.forEach(gift => {
      const category = gift.category;
      if (giftColumns.includes(category)) {
        row[category] = `${gift.percentage}%`;
      }
    });
  }

  return row;
}

// Process all entries
const transformedData = results.map(transformUserData);

console.log(`Processing ${transformedData.length} entries...\n`);

// Create array of arrays for Excel (this ensures clean headers)
const headers = ['Name', ...giftColumns];
const dataRows = transformedData.map(row => {
  return headers.map(header => row[header] || 'NA');
});

// Combine headers and data
const worksheetData = [headers, ...dataRows];

// Create workbook and worksheet
const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

// Set column widths
const columnWidths = [
  { wch: 30 }, // Name column
  ...giftColumns.map(() => ({ wch: 12 })) // Gift columns
];
worksheet['!cols'] = columnWidths;

// Create workbook
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Spiritual Gifts Results');

// Save to Excel file
const outputPath = path.join(__dirname, 'sheets', 'spiritual-gifts-results.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✓ Excel file created successfully!');
console.log(`✓ Output saved to: ${outputPath}\n`);

// Display verification for first 3 entries
console.log('=== VERIFICATION (First 3 entries) ===\n');

results.slice(0, 3).forEach((user, index) => {
  console.log(`${index + 1}. ${user.fullname}`);
  console.log('   JSON Top Gifts:');
  user.topGifts.forEach(gift => {
    console.log(`      ${gift.category}: ${gift.percentage}%`);
  });
  
  console.log('   Excel Output:');
  const transformed = transformedData[index];
  giftColumns.forEach(gift => {
    if (transformed[gift] !== 'NA') {
      console.log(`      ${gift}: ${transformed[gift]}`);
    }
  });
  console.log('');
});

console.log(`\n✅ Complete! File contains ${transformedData.length} entries.`);
console.log('\n📝 Next step: Run verification test');
console.log('   cd test');
console.log('   node cross-check-excel-json.js\n');

