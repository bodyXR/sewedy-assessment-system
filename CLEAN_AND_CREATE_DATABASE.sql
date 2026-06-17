-- ============================================================================
-- CLEAN DATABASE SCRIPT
-- This script drops all existing objects and recreates the database
-- Run this first to ensure a clean slate
-- ============================================================================

USE master;
GO

-- Uncomment the next 3 lines if you want to drop and recreate the entire database
-- DROP DATABASE IF EXISTS AssessmentDB;
-- CREATE DATABASE AssessmentDB;
-- GO

-- Use your existing database
-- CHANGE THIS to your database name
USE [YourDatabaseName]; 
GO

PRINT 'Starting database cleanup...';
GO

-- ============================================================================
-- DROP ALL OBJECTS IN REVERSE ORDER
-- ============================================================================

-- Drop Triggers
PRINT 'Dropping triggers...';
IF OBJECT_ID('trg_calculate_percentage', 'TR') IS NOT NULL DROP TRIGGER trg_calculate_percentage;
IF OBJECT_ID('trg_update_task_score', 'TR') IS NOT NULL DROP TRIGGER trg_update_task_score;
IF OBJECT_ID('trg_update_attempt_score', 'TR') IS NOT NULL DROP TRIGGER trg_update_attempt_score;
GO

-- Drop Stored Procedures
PRINT 'Dropping stored procedures...';
IF OBJECT_ID('sp_create_assessment_attempt', 'P') IS NOT NULL DROP PROCEDURE sp_create_assessment_attempt;
IF OBJECT_ID('sp_get_next_attempt_letter', 'P') IS NOT NULL DROP PROCEDURE sp_get_next_attempt_letter;
GO

-- Drop Views
PRINT 'Dropping views...';
IF OBJECT_ID('vw_student_assessment_status', 'V') IS NOT NULL DROP VIEW vw_student_assessment_status;
IF OBJECT_ID('vw_assessor_workload', 'V') IS NOT NULL DROP VIEW vw_assessor_workload;
IF OBJECT_ID('vw_competency_pass_rates', 'V') IS NOT NULL DROP VIEW vw_competency_pass_rates;
GO

-- Drop Tables (in reverse dependency order)
PRINT 'Dropping tables...';
IF OBJECT_ID('audit_log', 'U') IS NOT NULL DROP TABLE audit_log;
IF OBJECT_ID('controller_reports', 'U') IS NOT NULL DROP TABLE controller_reports;
IF OBJECT_ID('attempt_subtask_results', 'U') IS NOT NULL DROP TABLE attempt_subtask_results;
IF OBJECT_ID('attempt_task_results', 'U') IS NOT NULL DROP TABLE attempt_task_results;
IF OBJECT_ID('assessment_attempts', 'U') IS NOT NULL DROP TABLE assessment_attempts;
IF OBJECT_ID('student_enrollments', 'U') IS NOT NULL DROP TABLE student_enrollments;
IF OBJECT_ID('cycle_role_assignments', 'U') IS NOT NULL DROP TABLE cycle_role_assignments;
IF OBJECT_ID('assessment_cycles', 'U') IS NOT NULL DROP TABLE assessment_cycles;
IF OBJECT_ID('competency_subtasks', 'U') IS NOT NULL DROP TABLE competency_subtasks;
IF OBJECT_ID('competency_tasks', 'U') IS NOT NULL DROP TABLE competency_tasks;
IF OBJECT_ID('competencies', 'U') IS NOT NULL DROP TABLE competencies;
IF OBJECT_ID('grades', 'U') IS NOT NULL DROP TABLE grades;
IF OBJECT_ID('students', 'U') IS NOT NULL DROP TABLE students;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
GO

PRINT 'Database cleanup completed!';
PRINT 'Ready to run COMPLETE_DATABASE_SCHEMA.sql';
GO
