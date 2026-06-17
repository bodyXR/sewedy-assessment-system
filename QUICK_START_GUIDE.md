# Quick Start Guide - Assignment & Enrollment Flow

## 🎯 Overview

Before enrolling students in a course, you must first create assignments for that course.

## 📋 Step-by-Step Guide

### Part 1: Create Assignments (First Time Setup)

1. **Login as Controller**

   ```
   Role: Controller
   ```

2. **Navigate to Assignments**

   ```
   Sidebar → Assignments
   ```

3. **Select Course**

   ```
   Dropdown → Select course (e.g., "Network Infrastructure")
   ```

4. **Create Assignment**

   ```
   Click "Create Assignment" button
   ```

5. **Fill Form**

   ```
   Title: "Week 1: Basic Networking"          ← Required
   Description: "Configure router settings"    ← Optional
   Assignment Link: "https://..."              ← Optional
   Deadline: Select date & time                ← Required
   Total Grade: 100                            ← Required
   ```

6. **Submit**

   ```
   Click "Create Assignment"
   ```

7. **Repeat**
   ```
   Create all assignments for the course
   (e.g., Week 1, Week 2, Final Project)
   ```

### Part 2: Enroll Students

1. **Navigate to Enroll Students**

   ```
   Sidebar → Enroll Students
   ```

2. **Select Course**

   ```
   Dropdown → Select same course
   System checks: ✅ Assignments exist
   ```

3. **Select Students**

   ```
   Filter by class (optional)
   Check students to enroll
   Or click "Select All"
   ```

4. **Enroll**
   ```
   Click "Enroll Students" button
   Success: Students enrolled with submission placeholders
   ```

## ⚠️ Important Rules

### Cannot Enroll Without Assignments

```
❌ No Assignments → ⚠️ Warning → 🚫 Enrollment Disabled
✅ Assignments Exist → ✓ Validation Passed → 👍 Enrollment Enabled
```

### Error Messages

- **"Course has no tasks. Add CourseRoundAssignments first."**
  → Go to Assignments page and create assignments

- **"Course required"**
  → Select a course from dropdown

- **"Students required"**
  → Select at least one student

## 🔍 Visual Indicators

### Assignments Page

```
┌─────────────────────────────────────┐
│ Assignment Management               │
├─────────────────────────────────────┤
│ Select Course: [Network Infra ▼]   │
│                [Create Assignment]  │
├─────────────────────────────────────┤
│ ✓ Week 1: Basic Networking          │
│   Deadline: Aug 1, 2026              │
│   Grade: 100 points                  │
│                                      │
│ ✓ Week 2: Advanced Config           │
│   Deadline: Aug 8, 2026              │
│   Grade: 100 points                  │
└─────────────────────────────────────┘
```

### Enrollment Page (With Assignments)

```
┌─────────────────────────────────────┐
│ Course: [Network Infra ▼]           │
│ 2 students selected                  │
│                  [Enroll Students]  │ ← Enabled
└─────────────────────────────────────┘
```

### Enrollment Page (Without Assignments)

```
┌─────────────────────────────────────┐
│ Course: [Network Infra ▼]           │
│ 2 students selected                  │
│ ⚠️ No assignments found.            │
│    Create assignments first.         │
│                  [Enroll Students]  │ ← Disabled
└─────────────────────────────────────┘
```

## 🎨 UI Location

### Navigation Menu

```
Controller Dashboard
├─ Dashboard
├─ Students
├─ Enroll Students
├─ Assignments         ← NEW!
├─ Statistics
├─ Assign Roles
└─ Cycles
```

## 💡 Tips

1. **Create assignments BEFORE enrolling students**
   - System enforces this rule

2. **Assignment deadline format**
   - Use datetime-local picker
   - Displays in user's local timezone

3. **Total grade**
   - Default is 100 points
   - Can be customized per assignment

4. **Assignment link**
   - Optional external resource URL
   - Opens in new tab

5. **Check before enrolling**
   - System automatically validates
   - Warning appears if no assignments

## 🔄 Workflow Summary

```
┌─────────────┐
│   Login     │
│ (Controller)│
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Assignments    │
│  Page           │
│                 │
│ 1. Select Course│
│ 2. Create       │
│    Assignments  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Enroll Page    │
│                 │
│ 1. Select Course│
│ 2. Check ✅     │
│ 3. Select       │
│    Students     │
│ 4. Enroll       │
└─────────────────┘
```

## 🎯 Expected Results

After enrollment:

- Each student gets submission placeholders
- One submission per assignment per student
- Students can view their assignments
- Assessors can grade submissions

## 📞 Troubleshooting

**Q: Enrollment button is disabled**
A: Check if the course has assignments. Go to Assignments page.

**Q: Assignment not showing**
A: Make sure correct course is selected in dropdown.

**Q: Can't see Assignments menu**
A: Only Controllers have access to this feature.

**Q: Error creating assignment**
A: Check all required fields (title, deadline, grade, course).

## ✅ Success Indicators

- ✅ Assignment created → Green toast notification
- ✅ Students enrolled → "Enrolled X student(s)" message
- ✅ Navigation working → Sidebar link active
- ✅ Validation working → Warning shows/hides correctly
