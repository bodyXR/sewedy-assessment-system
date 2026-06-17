-- ============================================================================
-- INSERT RESULT STATUSES FOR ASSESSMENT SYSTEM
-- ============================================================================
-- This script will insert the Pass and Not Pass statuses needed for assessment results
-- Run this in your database to fix the "Status 39 not found" error
-- ============================================================================

-- First, let's check what statuses currently exist
SELECT * FROM Statuses ORDER BY Id;

-- ============================================================================
-- INSERT PASS AND NOT PASS STATUSES
-- ============================================================================
-- This will let the database auto-generate IDs

-- Insert Pass status if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM Statuses WHERE StatusName = 'Pass')
BEGIN
    INSERT INTO Statuses (StatusName, Description) 
    VALUES ('Pass', 'Assessment result passed');
    PRINT 'Pass status inserted successfully';
END
ELSE
BEGIN
    PRINT 'Pass status already exists';
END

-- Insert Not Pass status if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM Statuses WHERE StatusName = 'Not Pass')
BEGIN
    INSERT INTO Statuses (StatusName, Description) 
    VALUES ('Not Pass', 'Assessment result not passed');
    PRINT 'Not Pass status inserted successfully';
END
ELSE
BEGIN
    PRINT 'Not Pass status already exists';
END

-- ============================================================================
-- VERIFY THE INSERTS
-- ============================================================================
PRINT '====================================';
PRINT 'Pass/Fail Status IDs (USE THESE IN YOUR CODE):';
PRINT '====================================';
SELECT Id, StatusName, Description FROM Statuses WHERE StatusName IN ('Pass', 'Not Pass');

-- ============================================================================
-- AFTER RUNNING THIS SCRIPT:
-- ============================================================================
-- Run this query to get the status IDs you should use in your code:
-- SELECT Id, StatusName FROM Statuses WHERE StatusName IN ('Pass', 'Not Pass');
-- ============================================================================
