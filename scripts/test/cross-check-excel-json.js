const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

console.log('=== CROSS-CHECKING EXCEL WITH JSON ===\n');

// Read the JSON data
const jsonPath = path.join(__dirname, '../sheets/spiritual-gifts-results.json');
const results = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Read the Excel file
const excelPath = path.join(__dirname, '../sheets/spiritual-gifts-results.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const excelData = XLSX.utils.sheet_to_json(worksheet);

console.log(`JSON file: ${jsonPath}`);
console.log(`Excel file: ${excelPath}\n`);

// Test 1: Entry count check
console.log('TEST 1: Entry Count Check');
console.log(`  JSON entries: ${results.length}`);
console.log(`  Excel entries: ${excelData.length}`);
const test1Pass = results.length === excelData.length;
console.log(`  Result: ${test1Pass ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: All gift categories check
const giftColumns = [
  'Teaching',
  'Exhorting',
  'Prophesying',
  'Word of Wisdom',
  'Word of Knowledge',
  'Evangelism',
  'Service',
  'Help',
  'Leadership',
  'Administration',
  'Mercy',
  'Faith',
  'Giving',
  'Hospitality'
];

console.log('TEST 2: Gift Categories Check');
const excelHeaders = Object.keys(excelData[0]).filter(key => key !== 'Name');
const missingCategories = giftColumns.filter(cat => !excelHeaders.includes(cat));
const extraCategories = excelHeaders.filter(cat => !giftColumns.includes(cat));

if (missingCategories.length === 0 && extraCategories.length === 0) {
  console.log(`  ✅ PASS - All ${giftColumns.length} gift categories present`);
} else {
  console.log('  ❌ FAIL');
  if (missingCategories.length > 0) {
    console.log(`  Missing: ${missingCategories.join(', ')}`);
  }
  if (extraCategories.length > 0) {
    console.log(`  Extra: ${extraCategories.join(', ')}`);
  }
}
console.log('');

// Test 3: Data accuracy check
console.log('TEST 3: Data Accuracy Check (All Entries)');
let allMatch = true;
let mismatchCount = 0;
const mismatches = [];

results.forEach((user, index) => {
  const excelRow = excelData[index];
  
  if (!excelRow) {
    mismatches.push(`Missing Excel row ${index + 1} for ${user.fullname}`);
    allMatch = false;
    mismatchCount++;
    return;
  }
  
  // Check name
  if (excelRow.Name !== user.fullname) {
    mismatches.push(`Row ${index + 1}: Name mismatch - JSON: "${user.fullname}", Excel: "${excelRow.Name}"`);
    allMatch = false;
    mismatchCount++;
  }
  
  // Check each top gift
  user.topGifts.forEach(gift => {
    const excelValue = excelRow[gift.category];
    const expectedValue = `${gift.percentage}%`;
    
    if (excelValue !== expectedValue) {
      mismatches.push(`Row ${index + 1} (${user.fullname}): ${gift.category} - Expected: ${expectedValue}, Got: ${excelValue}`);
      allMatch = false;
      mismatchCount++;
    }
  });
  
  // Check that non-top gifts are marked as "NA"
  giftColumns.forEach(giftCategory => {
    const isTopGift = user.topGifts.some(g => g.category === giftCategory);
    if (!isTopGift) {
      const excelValue = excelRow[giftCategory];
      if (excelValue !== 'NA') {
        mismatches.push(`Row ${index + 1} (${user.fullname}): ${giftCategory} should be NA but is ${excelValue}`);
        allMatch = false;
        mismatchCount++;
      }
    }
  });
});

if (allMatch) {
  console.log(`  ✅ PASS - All ${results.length} entries match perfectly`);
} else {
  console.log(`  ❌ FAIL - ${mismatchCount} mismatches found`);
  console.log('\n  First 10 mismatches:');
  mismatches.slice(0, 10).forEach(m => console.log(`    - ${m}`));
  if (mismatches.length > 10) {
    console.log(`    ... and ${mismatches.length - 10} more`);
  }
}
console.log('');

// Test 4: No duplicate emails check
console.log('TEST 4: Duplicate Email Check');
const emails = new Set();
let duplicateCount = 0;
const duplicateEmails = [];

results.forEach(user => {
  const email = user.email.toLowerCase().trim();
  if (emails.has(email)) {
    duplicateEmails.push(email);
    duplicateCount++;
  }
  emails.add(email);
});

if (duplicateCount === 0) {
  console.log(`  ✅ PASS - No duplicate emails found`);
} else {
  console.log(`  ❌ FAIL - ${duplicateCount} duplicate emails found`);
  duplicateEmails.forEach(email => console.log(`    - ${email}`));
}
console.log('');

// Test 5: Top 5 gifts check
console.log('TEST 5: Top 5 Gifts Check');
let allHave5Gifts = true;
const invalidGiftCounts = [];

results.forEach((user, index) => {
  if (user.topGifts.length !== 5) {
    allHave5Gifts = false;
    invalidGiftCounts.push(`Row ${index + 1} (${user.fullname}): ${user.topGifts.length} gifts`);
  }
});

if (allHave5Gifts) {
  console.log(`  ✅ PASS - All entries have exactly 5 top gifts`);
} else {
  console.log(`  ❌ FAIL - Some entries don't have 5 top gifts`);
  invalidGiftCounts.forEach(msg => console.log(`    - ${msg}`));
}
console.log('');

// Test 6: Percentage format check
console.log('TEST 6: Percentage Format Check');
let allPercentagesValid = true;
const invalidPercentages = [];

excelData.forEach((row, index) => {
  giftColumns.forEach(gift => {
    const value = row[gift];
    if (value !== 'NA') {
      // Check if it's in format "XX%"
      if (!/^\d{1,3}%$/.test(value)) {
        allPercentagesValid = false;
        invalidPercentages.push(`Row ${index + 1} (${row.Name}): ${gift} = "${value}"`);
      }
    }
  });
});

if (allPercentagesValid) {
  console.log(`  ✅ PASS - All percentages formatted correctly (XX%)`);
} else {
  console.log(`  ❌ FAIL - Invalid percentage formats found`);
  invalidPercentages.slice(0, 10).forEach(msg => console.log(`    - ${msg}`));
}
console.log('');

// Test 7: Sample verification (random 5 entries)
console.log('TEST 7: Sample Verification (Random 5 Entries)');
const sampleIndices = [0, Math.floor(results.length * 0.25), Math.floor(results.length * 0.5), Math.floor(results.length * 0.75), results.length - 1];

sampleIndices.forEach(i => {
  const user = results[i];
  const excelRow = excelData[i];
  
  console.log(`\n  Entry ${i + 1}: ${user.fullname}`);
  console.log(`    Email: ${user.email}`);
  console.log(`    Created: ${user.created_at}`);
  console.log(`    Top Gifts:`);
  
  user.topGifts.forEach(gift => {
    const excelValue = excelRow[gift.category];
    const match = excelValue === `${gift.percentage}%` ? '✓' : '✗';
    console.log(`      ${match} ${gift.category}: ${gift.percentage}% ${excelValue !== `${gift.percentage}%` ? `(Excel: ${excelValue})` : ''}`);
  });
});

// Final Summary
console.log('\n\n' + '='.repeat(60));
console.log('FINAL SUMMARY');
console.log('='.repeat(60));

const allTestsPass = test1Pass && missingCategories.length === 0 && extraCategories.length === 0 && 
                     allMatch && duplicateCount === 0 && allHave5Gifts && allPercentagesValid;

if (allTestsPass) {
  console.log('\n✅ ALL TESTS PASSED!');
  console.log('\nThe Excel file perfectly matches the JSON data:');
  console.log(`  - ${results.length} entries verified`);
  console.log(`  - ${giftColumns.length} gift categories validated`);
  console.log(`  - No duplicates or data mismatches found`);
  console.log('\n✅ DATA INTEGRITY VERIFIED - READY FOR USE\n');
} else {
  console.log('\n❌ SOME TESTS FAILED');
  console.log('\nPlease review the failed tests above and fix the issues.\n');
}

