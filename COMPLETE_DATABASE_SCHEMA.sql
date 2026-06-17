-- ============================================================================
-- COMPLETE ASSESSMENT PLATFORM DATABASE SCHEMA
-- ============================================================================
-- This schema is designed to handle the complete assessment workflow:
-- 1. Controller creates cycles and assigns assessors/verifiers
-- 2. Controller enrolls students in competencies
-- 3. Assessor grades students on tasks (with 4 attempts: A, B, C, D)
-- 4. Verifier reviews and adds notes
-- 5. System tracks all historical data for analytics
-- ============================================================================

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Users table (All users: students, assessors, verifiers, controllers)
CREATE TABLE users (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name_en NVARCHAR(255) NOT NULL,
    full_name_ar NVARCHAR(255),
    role_type NVARCHAR(50) NOT NULL CHECK (role_type IN ('Student', 'Assessor', 'Verifier', 'Controller', 'Admin')),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role_type),
    INDEX idx_users_active (is_active)
);

-- Students table (additional student-specific data)
CREATE TABLE students (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL UNIQUE,
    student_number NVARCHAR(50) UNIQUE,
    class_name NVARCHAR(50), -- SW1, SW2, EE1, ME1, etc.
    enrollment_year INT,
    graduation_year INT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_students_class (class_name),
    INDEX idx_students_number (student_number)
);

-- ============================================================================
-- COMPETENCY & COURSE STRUCTURE
-- ============================================================================

-- Grades/Levels table
CREATE TABLE grades (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    grade_name NVARCHAR(100) NOT NULL UNIQUE, -- "Grade 10", "Grade 11", etc.
    grade_level INT NOT NULL,
    description NVARCHAR(MAX),
    
    INDEX idx_grades_level (grade_level)
);

-- Competencies/Courses table
CREATE TABLE competencies (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    code NVARCHAR(50) UNIQUE, -- "CS101", "ENG201", etc.
    grade_id BIGINT,
    duration_hours DECIMAL(5,2),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL,
    INDEX idx_competencies_grade (grade_id),
    INDEX idx_competencies_active (is_active),
    INDEX idx_competencies_code (code)
);

-- Tasks within a competency (each competency has multiple tasks)
CREATE TABLE competency_tasks (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    competency_id BIGINT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    task_order INT NOT NULL DEFAULT 1, -- Order of tasks
    max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    is_active BIT NOT NULL DEFAULT 1,
    
    FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE CASCADE,
    INDEX idx_tasks_competency (competency_id),
    INDEX idx_tasks_order (competency_id, task_order)
);

-- Subtasks within a task (each task has multiple subtasks)
CREATE TABLE competency_subtasks (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    task_id BIGINT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    subtask_order INT NOT NULL DEFAULT 1, -- Order of subtasks
    max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    is_active BIT NOT NULL DEFAULT 1,
    
    FOREIGN KEY (task_id) REFERENCES competency_tasks(id) ON DELETE CASCADE,
    INDEX idx_subtasks_task (task_id),
    INDEX idx_subtasks_order (task_id, subtask_order)
);

-- ============================================================================
-- ASSESSMENT CYCLES
-- ============================================================================

-- Course Rounds/Assessment Cycles
CREATE TABLE assessment_cycles (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    round_number INT NOT NULL,
    academic_year NVARCHAR(50), -- "2025-2026"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BIT NOT NULL DEFAULT 0,
    description NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by BIGINT, -- Controller user_id
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_cycles_active (is_active),
    INDEX idx_cycles_dates (start_date, end_date),
    INDEX idx_cycles_round (round_number)
);

-- Role assignments (Assessors and Verifiers assigned to cycles)
CREATE TABLE cycle_role_assignments (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    cycle_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_name NVARCHAR(50) NOT NULL CHECK (role_name IN ('Assessor', 'Verifier')),
    assigned_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    assigned_by BIGINT, -- Controller user_id
    
    FOREIGN KEY (cycle_id) REFERENCES assessment_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE NO ACTION,
    
    -- One role per user per cycle
    UNIQUE (cycle_id, user_id),
    INDEX idx_role_assignments_cycle (cycle_id),
    INDEX idx_role_assignments_user (user_id),
    INDEX idx_role_assignments_role (role_name)
);

-- ============================================================================
-- STUDENT ENROLLMENTS
-- ============================================================================

-- Student enrollment in competencies for a specific cycle
CREATE TABLE student_enrollments (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    student_id BIGINT NOT NULL, -- references students.id
    competency_id BIGINT NOT NULL,
    cycle_id BIGINT NOT NULL,
    enrolled_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    enrolled_by BIGINT, -- Controller user_id
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE NO ACTION,
    FOREIGN KEY (cycle_id) REFERENCES assessment_cycles(id) ON DELETE NO ACTION,
    FOREIGN KEY (enrolled_by) REFERENCES users(id) ON DELETE NO ACTION,
    
    -- One enrollment per student per competency per cycle
    UNIQUE (student_id, competency_id, cycle_id),
    INDEX idx_enrollments_student (student_id),
    INDEX idx_enrollments_competency (competency_id),
    INDEX idx_enrollments_cycle (cycle_id)
);

-- ============================================================================
-- ASSESSMENTS & ATTEMPTS
-- ============================================================================

-- Assessment attempts (A, B, C, D - up to 4 attempts per enrollment)
CREATE TABLE assessment_attempts (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    enrollment_id BIGINT NOT NULL,
    attempt_letter CHAR(1) NOT NULL CHECK (attempt_letter IN ('A', 'B', 'C', 'D')),
    assessor_id BIGINT NOT NULL, -- references users.id (must have Assessor role)
    
    -- Status: 'Not_Started', 'In_Progress', 'Submitted', 'Passed', 'Not_Passed'
    status NVARCHAR(50) NOT NULL DEFAULT 'Not_Started' 
        CHECK (status IN ('Not_Started', 'In_Progress', 'Submitted', 'Passed', 'Not_Passed')),
    
    -- Scores
    total_score DECIMAL(6,2), -- Sum of all subtask scores
    max_possible_score DECIMAL(6,2), -- Sum of all max scores
    percentage DECIMAL(5,2), -- Calculated: (total_score / max_possible_score) * 100
    
    -- Dates
    started_at DATETIME2,
    submitted_at DATETIME2,
    graded_at DATETIME2,
    
    -- Notes
    assessor_notes NVARCHAR(MAX),
    verifier_notes NVARCHAR(MAX),
    
    -- Verification
    is_verified BIT NOT NULL DEFAULT 0,
    verified_by BIGINT, -- Verifier user_id
    verified_at DATETIME2,
    
    -- Metadata
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (enrollment_id) REFERENCES student_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (assessor_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE NO ACTION,
    
    -- One attempt per enrollment per letter
    UNIQUE (enrollment_id, attempt_letter),
    INDEX idx_attempts_enrollment (enrollment_id),
    INDEX idx_attempts_assessor (assessor_id),
    INDEX idx_attempts_status (status),
    INDEX idx_attempts_letter (attempt_letter),
    INDEX idx_attempts_verification (is_verified)
);

-- Task results for each attempt (stores score for each task)
CREATE TABLE attempt_task_results (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    attempt_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    score DECIMAL(5,2), -- Score earned for this task
    max_score DECIMAL(5,2) NOT NULL, -- Max possible for this task
    is_passed BIT NOT NULL DEFAULT 0, -- Must pass each task individually
    notes NVARCHAR(MAX),
    
    FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES competency_tasks(id) ON DELETE NO ACTION,
    
    -- One result per attempt per task
    UNIQUE (attempt_id, task_id),
    INDEX idx_task_results_attempt (attempt_id),
    INDEX idx_task_results_task (task_id)
);

-- Subtask results for each attempt (stores score for each subtask)
CREATE TABLE attempt_subtask_results (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    task_result_id BIGINT NOT NULL,
    subtask_id BIGINT NOT NULL,
    score DECIMAL(5,2), -- Score earned for this subtask
    max_score DECIMAL(5,2) NOT NULL, -- Max possible for this subtask
    is_passed BIT NOT NULL DEFAULT 0, -- Must pass each subtask
    notes NVARCHAR(MAX),
    
    FOREIGN KEY (task_result_id) REFERENCES attempt_task_results(id) ON DELETE CASCADE,
    FOREIGN KEY (subtask_id) REFERENCES competency_subtasks(id) ON DELETE NO ACTION,
    
    -- One result per task result per subtask
    UNIQUE (task_result_id, subtask_id),
    INDEX idx_subtask_results_task (task_result_id),
    INDEX idx_subtask_results_subtask (subtask_id)
);

-- ============================================================================
-- REPORTS & ANALYTICS
-- ============================================================================

-- Controller reports generated from verified assessments
CREATE TABLE controller_reports (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    cycle_id BIGINT NOT NULL,
    report_type NVARCHAR(50) NOT NULL, -- 'Cycle_Summary', 'Student_Performance', 'Competency_Analysis'
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX), -- JSON or text content
    generated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    generated_by BIGINT, -- Controller user_id
    
    FOREIGN KEY (cycle_id) REFERENCES assessment_cycles(id) ON DELETE NO ACTION,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE NO ACTION,
    INDEX idx_reports_cycle (cycle_id),
    INDEX idx_reports_type (report_type)
);

-- ============================================================================
-- AUDIT & HISTORY
-- ============================================================================

-- Audit log for all critical actions
CREATE TABLE audit_log (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT,
    action_type NVARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'GRADE', 'VERIFY'
    entity_type NVARCHAR(100) NOT NULL, -- 'Assessment', 'Enrollment', 'Cycle', etc.
    entity_id BIGINT,
    old_value NVARCHAR(MAX), -- JSON of previous state
    new_value NVARCHAR(MAX), -- JSON of new state
    ip_address NVARCHAR(50),
    user_agent NVARCHAR(500),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_date (created_at)
);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Current student assessment status
GO
CREATE VIEW vw_student_assessment_status AS
SELECT 
    s.id AS student_id,
    s.student_number,
    u.full_name_en AS student_name,
    s.class_name,
    c.id AS competency_id,
    c.title AS competency_title,
    ac.id AS cycle_id,
    ac.round_number,
    se.id AS enrollment_id,
    
    -- Latest attempt info
    (SELECT TOP 1 attempt_letter 
     FROM assessment_attempts aa 
     WHERE aa.enrollment_id = se.id 
     ORDER BY attempt_letter DESC) AS latest_attempt,
    
    (SELECT TOP 1 status 
     FROM assessment_attempts aa 
     WHERE aa.enrollment_id = se.id 
     ORDER BY attempt_letter DESC) AS current_status,
    
    (SELECT TOP 1 percentage 
     FROM assessment_attempts aa 
     WHERE aa.enrollment_id = se.id 
     ORDER BY attempt_letter DESC) AS current_percentage,
    
    -- Passed attempts count
    (SELECT COUNT(*) 
     FROM assessment_attempts aa 
     WHERE aa.enrollment_id = se.id 
     AND aa.status = 'Passed') AS passed_attempts_count,
    
    -- Total attempts count
    (SELECT COUNT(*) 
     FROM assessment_attempts aa 
     WHERE aa.enrollment_id = se.id) AS total_attempts,
    
    -- Verification status
    (SELECT TOP 1 is_verified 
     FROM assessment_attempts aa 
     WHERE aa.enrollment_id = se.id 
     ORDER BY attempt_letter DESC) AS is_verified

FROM students s
INNER JOIN users u ON s.user_id = u.id
INNER JOIN student_enrollments se ON s.id = se.student_id
INNER JOIN competencies c ON se.competency_id = c.id
INNER JOIN assessment_cycles ac ON se.cycle_id = ac.id;

GO

-- View: Assessor workload
CREATE VIEW vw_assessor_workload AS
SELECT 
    u.id AS assessor_id,
    u.full_name_en AS assessor_name,
    ac.id AS cycle_id,
    ac.round_number,
    COUNT(DISTINCT aa.id) AS total_assessments,
    SUM(CASE WHEN aa.status = 'Passed' THEN 1 ELSE 0 END) AS passed_count,
    SUM(CASE WHEN aa.status = 'Not_Passed' THEN 1 ELSE 0 END) AS failed_count,
    SUM(CASE WHEN aa.status IN ('Not_Started', 'In_Progress') THEN 1 ELSE 0 END) AS pending_count

FROM users u
INNER JOIN cycle_role_assignments cra ON u.id = cra.user_id AND cra.role_name = 'Assessor'
INNER JOIN assessment_cycles ac ON cra.cycle_id = ac.id
LEFT JOIN assessment_attempts aa ON u.id = aa.assessor_id AND aa.enrollment_id IN (
    SELECT id FROM student_enrollments WHERE cycle_id = ac.id
)
GROUP BY u.id, u.full_name_en, ac.id, ac.round_number;

GO

-- View: Competency pass rates
CREATE VIEW vw_competency_pass_rates AS
SELECT 
    c.id AS competency_id,
    c.title AS competency_title,
    ac.id AS cycle_id,
    ac.round_number,
    COUNT(DISTINCT se.student_id) AS total_students,
    SUM(CASE WHEN aa.status = 'Passed' THEN 1 ELSE 0 END) AS passed_count,
    CAST(SUM(CASE WHEN aa.status = 'Passed' THEN 1 ELSE 0 END) AS FLOAT) / 
        NULLIF(COUNT(DISTINCT se.student_id), 0) * 100 AS pass_rate_percentage

FROM competencies c
INNER JOIN student_enrollments se ON c.id = se.competency_id
INNER JOIN assessment_cycles ac ON se.cycle_id = ac.id
LEFT JOIN assessment_attempts aa ON se.id = aa.enrollment_id
GROUP BY c.id, c.title, ac.id, ac.round_number;

GO

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_attempts_enrollment_letter ON assessment_attempts(enrollment_id, attempt_letter);
CREATE INDEX idx_attempts_status_assessor ON assessment_attempts(status, assessor_id);
CREATE INDEX idx_enrollments_cycle_competency ON student_enrollments(cycle_id, competency_id);
CREATE INDEX idx_task_results_attempt_passed ON attempt_task_results(attempt_id, is_passed);

-- ============================================================================
-- TRIGGERS FOR AUTO-CALCULATION
-- ============================================================================

GO
-- Trigger: Auto-calculate percentage when total_score is updated
CREATE TRIGGER trg_calculate_percentage
ON assessment_attempts
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE aa
    SET percentage = CASE 
        WHEN aa.max_possible_score > 0 
        THEN (aa.total_score / aa.max_possible_score) * 100 
        ELSE 0 
    END,
    updated_at = GETDATE()
    FROM assessment_attempts aa
    INNER JOIN inserted i ON aa.id = i.id
    WHERE aa.total_score IS NOT NULL 
    AND aa.max_possible_score IS NOT NULL;
END;

GO

-- Trigger: Auto-update task result when subtask results change
CREATE TRIGGER trg_update_task_score
ON attempt_subtask_results
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update task scores based on subtasks
    UPDATE atr
    SET score = (
        SELECT ISNULL(SUM(score), 0)
        FROM attempt_subtask_results
        WHERE task_result_id = atr.id
    ),
    is_passed = CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM attempt_subtask_results 
            WHERE task_result_id = atr.id 
            AND is_passed = 0
        ) AND EXISTS (
            SELECT 1 FROM attempt_subtask_results 
            WHERE task_result_id = atr.id
        ) THEN 1
        ELSE 0
    END
    FROM attempt_task_results atr
    WHERE atr.id IN (
        SELECT DISTINCT task_result_id FROM inserted
        UNION
        SELECT DISTINCT task_result_id FROM deleted
    );
END;

GO

-- Trigger: Auto-update attempt total when task results change
CREATE TRIGGER trg_update_attempt_score
ON attempt_task_results
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update attempt total scores
    UPDATE aa
    SET total_score = (
        SELECT ISNULL(SUM(score), 0)
        FROM attempt_task_results
        WHERE attempt_id = aa.id
    ),
    max_possible_score = (
        SELECT ISNULL(SUM(max_score), 0)
        FROM attempt_task_results
        WHERE attempt_id = aa.id
    ),
    status = CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM attempt_task_results 
            WHERE attempt_id = aa.id 
            AND is_passed = 0
        ) AND EXISTS (
            SELECT 1 FROM attempt_task_results 
            WHERE attempt_id = aa.id
        ) THEN 'Passed'
        WHEN EXISTS (
            SELECT 1 FROM attempt_task_results 
            WHERE attempt_id = aa.id 
            AND is_passed = 0
        ) THEN 'Not_Passed'
        ELSE aa.status
    END,
    updated_at = GETDATE()
    FROM assessment_attempts aa
    WHERE aa.id IN (
        SELECT DISTINCT attempt_id FROM inserted
        UNION
        SELECT DISTINCT attempt_id FROM deleted
    );
END;

GO

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Create new assessment attempt (with validation)
CREATE PROCEDURE sp_create_assessment_attempt
    @enrollment_id BIGINT,
    @attempt_letter CHAR(1),
    @assessor_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate: Check if previous attempt must be completed first
    IF @attempt_letter != 'A'
    BEGIN
        DECLARE @prev_letter CHAR(1) = CHAR(ASCII(@attempt_letter) - 1);
        
        IF NOT EXISTS (
            SELECT 1 FROM assessment_attempts 
            WHERE enrollment_id = @enrollment_id 
            AND attempt_letter = @prev_letter
            AND status IN ('Passed', 'Not_Passed')
        )
        BEGIN
            RAISERROR('Previous attempt must be completed first', 16, 1);
            RETURN;
        END
    END
    
    -- Validate: Check if attempt already exists
    IF EXISTS (
        SELECT 1 FROM assessment_attempts 
        WHERE enrollment_id = @enrollment_id 
        AND attempt_letter = @attempt_letter
    )
    BEGIN
        RAISERROR('Attempt already exists', 16, 1);
        RETURN;
    END
    
    -- Create attempt
    INSERT INTO assessment_attempts (enrollment_id, attempt_letter, assessor_id, status, started_at)
    VALUES (@enrollment_id, @attempt_letter, @assessor_id, 'In_Progress', GETDATE());
    
    SELECT SCOPE_IDENTITY() AS attempt_id;
END;

GO

-- Procedure: Get student's next available attempt
CREATE PROCEDURE sp_get_next_attempt_letter
    @enrollment_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @last_attempt CHAR(1);
    
    SELECT TOP 1 @last_attempt = attempt_letter
    FROM assessment_attempts
    WHERE enrollment_id = @enrollment_id
    AND status IN ('Passed', 'Not_Passed')
    ORDER BY attempt_letter DESC;
    
    IF @last_attempt IS NULL
        SELECT 'A' AS next_attempt_letter;
    ELSE IF @last_attempt = 'A'
        SELECT 'B' AS next_attempt_letter;
    ELSE IF @last_attempt = 'B'
        SELECT 'C' AS next_attempt_letter;
    ELSE IF @last_attempt = 'C'
        SELECT 'D' AS next_attempt_letter;
    ELSE
        SELECT NULL AS next_attempt_letter; -- No more attempts
END;

GO

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Insert default roles
INSERT INTO users (email, password_hash, full_name_en, role_type) VALUES
('admin@assessment.com', 'HASHED_PASSWORD', 'System Admin', 'Admin'),
('controller@assessment.com', 'HASHED_PASSWORD', 'Main Controller', 'Controller');

-- Insert sample grades
INSERT INTO grades (grade_name, grade_level, description) VALUES
('Grade 10', 10, 'Tenth Grade'),
('Grade 11', 11, 'Eleventh Grade'),
('Grade 12', 12, 'Twelfth Grade');

GO

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- This schema provides:
-- ✅ Complete user management (students, assessors, verifiers, controllers)
-- ✅ Competency structure with tasks and subtasks
-- ✅ Assessment cycles with role assignments
-- ✅ Student enrollments
-- ✅ Assessment attempts (A, B, C, D) with sequential validation
-- ✅ Hierarchical grading (subtasks → tasks → attempts)
-- ✅ Verifier review system
-- ✅ Auto-calculation of scores and pass/fail
-- ✅ Complete audit trail
-- ✅ Performance-optimized indexes
-- ✅ Views for common analytics queries
-- ✅ Stored procedures for business logic
-- ============================================================================
