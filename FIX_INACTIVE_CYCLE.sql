-- Fix for inactive cycle issue
-- The assessor is assigned to cycle ID 2, but it has statusId = 0 (inactive)
-- This script will activate the cycle

-- Check current status
SELECT Id, CourseId, RoundNumber, StatusId, StartDate, EndDate 
FROM CourseRounds 
WHERE Id = 2;

-- Activate the cycle (set StatusId to 1)
UPDATE CourseRounds 
SET StatusId = 1 
WHERE Id = 2;

-- Verify the update
SELECT Id, CourseId, RoundNumber, StatusId, StartDate, EndDate 
FROM CourseRounds 
WHERE Id = 2;

-- Optional: Check all cycles for this course
SELECT Id, CourseId, RoundNumber, StatusId, StartDate, EndDate 
FROM CourseRounds 
WHERE CourseId = (SELECT CourseId FROM CourseRounds WHERE Id = 2);
