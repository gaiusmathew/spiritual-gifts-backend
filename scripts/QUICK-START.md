# Quick Start Guide

## 🚀 Run the Complete Pipeline

### Prerequisites
✅ Server must be running on `http://localhost:5000`

---

## Step-by-Step Instructions

### 1️⃣ Start the Server
```bash
# In project root
npm run dev
```
Wait for: `Server is running on port 5000`

---

### 2️⃣ Fetch Results from Database
```bash
# In a new terminal
cd scripts
node fetch-all-results.js
```

**Output:**
- Fetches all results with pagination
- Removes duplicates automatically
- Saves to `sheets/spiritual-gifts-results.json`

---

### 3️⃣ Generate Excel Report
```bash
node create-excel-correct.js
```

**Output:**
- Transforms JSON to Excel format
- Saves to `sheets/spiritual-gifts-results.xlsx`

---

### 4️⃣ Verify Data Integrity
```bash
cd test
node cross-check-excel-json.js
```

**Expected:** ✅ ALL TESTS PASSED!

---

## 📁 Output Location

All final files are in: **`scripts/sheets/`**

- `spiritual-gifts-results.json` - Raw data
- `spiritual-gifts-results.xlsx` - Excel report

---

## 🔄 Full Command Sequence

```bash
# Terminal 1
npm run dev

# Terminal 2
cd scripts
node fetch-all-results.js
node create-excel-correct.js
cd test
node cross-check-excel-json.js
```

---

## ✅ Success Indicators

**Fetch Script:**
```
✓ Login successful
Total results fetched: X
✓ Duplicates removed: Y
✓ Unique entries: 54
✅ Fetch complete!
```

**Excel Script:**
```
Processing 54 entries...
✓ Excel file created successfully!
✅ Complete! File contains 54 entries.
```

**Test Script:**
```
✅ ALL TESTS PASSED!
✅ DATA INTEGRITY VERIFIED - READY FOR USE
```

---

**For detailed documentation, see:** [README.md](README.md)

