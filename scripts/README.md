# Spiritual Gifts Results Export Scripts

This folder contains scripts to fetch spiritual gifts assessment results from the database and export them to Excel format.

## 📋 Prerequisites

1. **Server must be running** on `http://localhost:5000`
2. Node.js and npm installed
3. Required packages installed (run `npm install` in project root if needed)

## 🚀 Quick Start

### Step 1: Start the Server

```bash
# In the project root directory
npm run dev
```

**Wait for the server to be ready:**
```
Server is running on port 5000
API available at http://localhost:5000/api
✅ Connected to PostgreSQL database
```

### Step 2: Fetch Results from Database

```bash
# In a new terminal, navigate to scripts folder
cd scripts

# Run the fetch script (uses pagination to load all results)
node fetch-all-results.js
```

**What this does:**
- Logs in as admin (`admin@spiritualgifts.com`)
- Fetches all quiz results with pagination (10 per page)
- Removes duplicate emails (keeps most recent entry)
- Saves cleaned data to `sheets/spiritual-gifts-results.json`

**Expected output:**
```
Logging in as admin...
✓ Login successful
Starting to fetch all results...
Fetching page 1...
✓ Page 1: Found 10 results (Total so far: 10)
...
Total results fetched: 64
Duplicates removed: 10
✓ Cleaned data saved to: sheets/spiritual-gifts-results.json
```

### Step 3: Generate Excel Report

```bash
# In the scripts folder
node create-excel-correct.js
```

**What this does:**
- Reads `sheets/spiritual-gifts-results.json`
- Transforms data into Excel format
- Creates columns for all 14 spiritual gift categories
- Fills in percentages for top 5 gifts, marks others as "NA"
- Saves to `sheets/spiritual-gifts-results.xlsx`

**Expected output:**
```
Processing 54 entries...
✓ Excel file created successfully!
✓ Output saved to: sheets/spiritual-gifts-results.xlsx
✅ Complete! File contains 54 entries.
```

### Step 4: Verify Data Integrity

```bash
# In the scripts folder
cd test
node cross-check-excel-json.js
```

**What this does:**
- Compares Excel file with JSON source
- Runs 7 comprehensive validation tests
- Checks for data accuracy, duplicates, and formatting

**Expected output:**
```
✅ ALL TESTS PASSED!

The Excel file perfectly matches the JSON data:
  - 54 entries verified
  - 14 gift categories validated
  - No duplicates or data mismatches found

✅ DATA INTEGRITY VERIFIED - READY FOR USE
```

## 📁 Output Files

All final files are saved in the `sheets/` folder:

- **sheets/spiritual-gifts-results.json** - Raw data from database (cleaned)
- **sheets/spiritual-gifts-results.xlsx** - Formatted Excel report

## 📊 Excel File Format

| Name | Teaching | Exhorting | Prophesying | Word of Wisdom | Word of Knowledge | Evangelism | Service | Help | Leadership | Administration | Mercy | Faith | Giving | Hospitality |
|------|----------|-----------|-------------|----------------|-------------------|------------|---------|------|------------|----------------|-------|-------|--------|-------------|
| John Doe | 96% | NA | 92% | NA | 88% | NA | NA | 84% | NA | NA | 80% | NA | NA | NA |

- **Top 5 gifts** show percentage
- **Other gifts** show "NA"

## 🧪 Testing

### Run All Validation Tests

```bash
cd test
node cross-check-excel-json.js
```

### Tests Performed

1. ✅ Entry count verification
2. ✅ Gift categories validation (all 14 present)
3. ✅ Data accuracy check (every entry, every field)
4. ✅ Duplicate email detection
5. ✅ Top 5 gifts validation
6. ✅ Percentage format verification (XX%)
7. ✅ Random sample verification

## 🔄 Full Pipeline (All Commands)

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run export pipeline
cd scripts

# Step 1: Fetch from database
node fetch-all-results.js

# Step 2: Generate Excel
node create-excel-correct.js

# Step 3: Verify data
cd test
node cross-check-excel-json.js
```

## 📝 Spiritual Gift Categories

### Speaking Gifts (6)
- Teaching
- Exhorting
- Prophesying
- Word of Wisdom
- Word of Knowledge
- Evangelism

### Serving Gifts (8)
- Service
- Help (Helps)
- Leadership
- Administration
- Mercy
- Faith
- Giving
- Hospitality

## 🔍 Troubleshooting

### Error: "Connection refused"
- **Problem:** Server is not running
- **Solution:** Start the server with `npm run dev`

### Error: "Login failed! status: 404"
- **Problem:** Admin user doesn't exist
- **Solution:** Server creates admin on startup, restart server

### Error: "No results found"
- **Problem:** No quiz responses in database
- **Solution:** Check if users have submitted quizzes

### Excel file has wrong data
- **Problem:** Stale data or incorrect transformation
- **Solution:** 
  1. Delete `sheets/spiritual-gifts-results.json`
  2. Re-run `fetch-all-results.js`
  3. Re-run `create-excel-correct.js`
  4. Run verification test

## 📌 Notes

- **Duplicate Handling:** If multiple submissions exist for the same email, only the most recent is kept
- **Pagination:** Fetches 10 results per page automatically
- **Authentication:** Uses admin credentials (`admin@spiritualgifts.com`)
- **Data Sorting:** Results sorted by `created_at` (most recent first)

## 🎯 Current Status

- **Total unique entries:** 54
- **Duplicates removed:** 10
- **Data accuracy:** 100% verified
- **Status:** ✅ Ready for use

---

**Last Updated:** November 2025  
**Maintained by:** Spiritual Gifts Backend Team

