# Bulk Assessment - Enhanced Features

## 🎯 New Features Added

### 1. Search Functionality

- **Search by Name**: Type student's full name or partial name
- **Search by Code**: Type student code (e.g., "STU001")
- **Real-time Filtering**: Results update as you type
- **Location**: Search bar below the filter dropdowns

### 2. Class Filter

- **Filter by Class**: Select specific classes (J1, J2, J3, W1, W2, S1, S2)
- **All Classes Option**: View all students in the grade level
- **Combined Filtering**: Works together with grade level and search

### 3. Trial-Based Assessment System

#### Current Trial Selector

- Choose Trial 1, 2, or 3 from dropdown
- Displayed prominently in the interface
- Affects grade assignment logic

#### Automatic Trial Assignment Logic

**When All Learning Outcomes Pass:**

- Student gets Grade A
- Assigned to **Current Trial**
- Example: If Current Trial = 1, student is assigned to Trial 1

**When Any Learning Outcome Fails:**

- Student gets Grade B (Trial 1) or Grade C (Trial 2+)
- Assigned to **Next Trial** (Current Trial + 1)
- Example: If Current Trial = 1, student is assigned to Trial 2

#### Auto-Grade Suggestion

The system automatically suggests grades based on outcomes and current trial:

**Trial 1:**

- **All Pass** → Grade A (stays in Trial 1)
- **Any Fail** → Grade B (moves to Trial 2)

**Trial 2:**

- **All Pass** → Grade B (stays in Trial 2)
- **Any Fail** → Grade C (moves to Trial 3)

**Trial 3:**

- **All Pass** → Grade C (stays in Trial 3)
- **Any Fail** → Grade C (stays in Trial 3)

**All Fail (any trial)** → Grade D (when using "All Fail" button)

You can still manually override the suggested grade if needed.

---

## 🔄 Complete Workflow

### Step 1: Setup Filters

1. Select **Grade Level** (Junior/Wheeler/Senior)
2. Select **Class** (optional - defaults to "All Classes")
3. Select **Competency** to assess
4. Select **Current Trial** (1, 2, or 3)
5. Use **Search** to find specific students (optional)

### Step 2: Assess Students

1. Click on any student card
2. Side sheet opens with:
   - Student info with Trial badge
   - Trial-based grading rules displayed
   - Quick action buttons (All Pass / All Fail)
   - Learning outcomes checklist
   - Auto-suggested grade
   - Notes field

### Step 3: Mark Outcomes

**Option A - Quick Actions:**

- Click "All Pass" → All outcomes marked as passed, Grade A suggested
- Click "All Fail" → All outcomes marked as failed, Grade D suggested

**Option B - Individual Selection:**

- Click each outcome card to toggle pass/fail
- Grade auto-updates based on results

### Step 4: Review & Save

- Check the auto-suggested grade
- Adjust grade manually if needed
- Add notes (optional)
- Click "Save Assessment"

### Step 5: Submit All

- Repeat for other students
- Click "Submit All Assessments" when done
- All assessments saved with trial assignments

---

## 📊 Trial Assignment Examples

### Example 1: Perfect Performance (Trial 1)

- Current Trial: 1
- All outcomes: ✓ Passed
- **Result**: Grade A, Trial 1 (stays in Trial 1)

### Example 2: Needs Improvement (Trial 1)

- Current Trial: 1
- Outcomes: 4/6 passed (2 failed)
- **Result**: Grade B, Trial 2 (moves to next trial)

### Example 3: Perfect Performance (Trial 2)

- Current Trial: 2
- All outcomes: ✓ Passed
- **Result**: Grade B, Trial 2 (stays in Trial 2)

### Example 4: Needs More Work (Trial 2)

- Current Trial: 2
- Outcomes: 5/6 passed (1 failed)
- **Result**: Grade C, Trial 3 (moves to next trial)

### Example 5: Perfect Performance (Trial 3)

- Current Trial: 3
- All outcomes: ✓ Passed
- **Result**: Grade C, Trial 3 (stays in Trial 3)

### Example 6: Still Struggling (Trial 3)

- Current Trial: 3
- Outcomes: 3/6 passed (3 failed)
- **Result**: Grade C, Trial 3 (stays in Trial 3 - final attempt)

### Example 7: Complete Failure (Any Trial)

- Current Trial: Any
- All outcomes: ✗ Failed
- **Result**: Grade D, Next Trial (or stays in Trial 3)

---

## 💡 Pro Tips

### For Fastest Assessment:

1. Set Current Trial at the start
2. Use "All Pass" button for students who clearly passed
3. Use "All Fail" button for students who clearly failed
4. Only toggle individual outcomes for mixed results
5. Skip notes unless necessary

### For Organized Sessions:

1. Filter by specific class
2. Assess all students in that class
3. Submit all at once
4. Move to next class

### For Finding Specific Students:

1. Use search to quickly find a student
2. Assess them
3. Clear search to see all students again

### Understanding Trial Progression:

- Trial 1 → First attempt (Grade A or B possible)
- Trial 2 → Second attempt (Grade A or C possible)
- Trial 3 → Final attempt (Grade A or C possible)
- Students who pass all outcomes stay in current trial
- Students who fail any outcome move to next trial for remediation

---

## 🎨 Visual Indicators

### Student Cards:

- **Green background** = Assessed
- **Grade badge** = A (green), B (blue), C (yellow), D (red)
- **Trial badge** = Purple badge showing trial number
- **Outcome count** = "✓ X/Y outcomes passed"

### Assessment Sheet:

- **Green checkmarks** = Passed outcomes
- **Green borders** = Passed outcome cards
- **Trial badge** = Purple badge in header
- **Info box** = Blue box explaining trial rules

### Progress Tracking:

- **Top counter** = "X/Y assessed"
- **Per student** = Outcome pass count
- **Submit button** = Shows total count

---

## 🔧 Technical Details

### Data Structure:

```typescript
{
  studentId: string;
  competencyId: string;
  grade: "A" | "B" | "C" | "D";
  outcomes: Record<string, boolean>; // outcome name -> pass/fail
  notes: string;
  trial: number; // 1, 2, or 3
}
```

### Trial Assignment Logic:

```typescript
const allPassed = passedCount === totalCount;
const assignedTrial = allPassed ? currentTrial : currentTrial + 1;
```

### Grade Suggestion Logic:

```typescript
if (allPassed) {
  grade = "A";
} else if (currentTrial === 1) {
  grade = "B";
} else {
  grade = "C";
}
// Unless manually set to "D"
```

---

## 📝 Summary

The enhanced bulk assessment system now provides:

- ✅ Fast student search by name or code
- ✅ Class-level filtering for organized sessions
- ✅ Trial-based assessment with automatic assignment
- ✅ Smart grade suggestions based on outcomes and trial
- ✅ Clear visual feedback throughout the process
- ✅ Flexible workflow supporting both quick and detailed assessment

This makes the assessment process both faster and more structured, while maintaining detailed tracking of learning outcomes and trial progression.
