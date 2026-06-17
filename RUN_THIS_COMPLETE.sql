    -- ============================================================================
    -- COMPLETE DATABASE SETUP - RUN THIS FILE
    -- This file cleans existing objects and creates the complete schema
    -- ============================================================================

    -- CHANGE THIS to your database name
    USE [YourDatabaseName];
    GO

    PRINT '========================================';
    PRINT 'STEP 1: CLEANING EXISTING OBJECTS';
    PRINT '========================================';
    GO

    -- Drop Triggers
    IF OBJECT_ID('trg_calculate_percentage', 'TR') IS NOT NULL DROP TRIGGER trg_calculate_percentage;
    IF OBJECT_ID('trg_update_task_score', 'TR') IS NOT NULL DROP TRIGGER trg_update_task_score;
    IF OBJECT_ID('trg_update_attempt_score', 'TR') IS NOT NULL DROP TRIGGER trg_update_attempt_score;

    -- Drop Stored Procedures
    IF OBJECT_ID('sp_create_assessment_attempt', 'P') IS NOT NULL DROP PROCEDURE sp_create_assessment_attempt;
    IF OBJECT_ID('sp_get_next_attempt_letter', 'P') IS NOT NULL DROP PROCEDURE sp_get_next_attempt_letter;

    -- Drop Views
    IF OBJECT_ID('vw_student_assessment_status', 'V') IS NOT NULL DROP VIEW vw_student_assessment_status;
    IF OBJECT_ID('vw_assessor_workload', 'V') IS NOT NULL DROP VIEW vw_assessor_workload;
    IF OBJECT_ID('vw_competency_pass_rates', 'V') IS NOT NULL DROP VIEW vw_competency_pass_rates;

    -- Drop Tables (in reverse dependency order)
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

    PRINT 'Cleanup completed!';
    PRINT '';
    PRINT '========================================';
    PRINT 'STEP 2: CREATING NEW SCHEMA';
    PRINT '========================================';
    GO

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

    PRINT 'Created users table';

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

    PRINT 'Created students table';

    -- ============================================================================
    -- COMPETENCY & COURSE STRUCTURE
    -- ============================================================================

    -- Grades/Levels table
    CREATE TABLE grades (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        grade_name NVARCHAR(100) NOT NULL UNIQUE,
        grade_level INT NOT NULL,
        description NVARCHAR(MAX),
        
        INDEX idx_grades_level (grade_level)
    );

    PRINT 'Created grades table';

    -- Competencies/Courses table
    CREATE TABLE competencies (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        code NVARCHAR(50) UNIQUE,
        grade_id BIGINT,
        duration_hours DECIMAL(5,2),
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL,
        INDEX idx_competencies_grade (grade_id),
        INDEX idx_competencies_active (is_active),
        INDEX idx_competencies_code (code)
    );

    PRINT 'Created competencies table';

    -- Tasks within a competency
    CREATE TABLE competency_tasks (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        competency_id BIGINT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        task_order INT NOT NULL DEFAULT 1,
        max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        is_active BIT NOT NULL DEFAULT 1,
        
        FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE CASCADE,
        INDEX idx_tasks_competency (competency_id),
        INDEX idx_tasks_order (competency_id, task_order)
    );

    PRINT 'Created competency_tasks table';

    -- Subtasks within a task
    CREATE TABLE competency_subtasks (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        task_id BIGINT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        subtask_order INT NOT NULL DEFAULT 1,
        max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        is_active BIT NOT NULL DEFAULT 1,
        
        FOREIGN KEY (task_id) REFERENCES competency_tasks(id) ON DELETE CASCADE,
        INDEX idx_subtasks_task (task_id),
        INDEX idx_subtasks_order (task_id, subtask_order)
    );

    PRINT 'Created competency_subtasks table';

    -- ============================================================================
    -- ASSESSMENT CYCLES
    -- ============================================================================

    -- Course Rounds/Assessment Cycles
    CREATE TABLE assessment_cycles (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        round_number INT NOT NULL,
        academic_year NVARCHAR(50),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BIT NOT NULL DEFAULT 0,
        description NVARCHAR(MAX),
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        created_by BIGINT,
        
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_cycles_active (is_active),
        INDEX idx_cycles_dates (start_date, end_date),
        INDEX idx_cycles_round (round_number)
    );

    PRINT 'Created assessment_cycles table';

    -- Role assignments
    CREATE TABLE cycle_role_assignments (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        cycle_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        role_name NVARCHAR(50) NOT NULL CHECK (role_name IN ('Assessor', 'Verifier')),
        assigned_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        assigned_by BIGINT,
        
        FOREIGN KEY (cycle_id) REFERENCES assessment_cycles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE NO ACTION,
        
        UNIQUE (cycle_id, user_id),
        INDEX idx_role_assignments_cycle (cycle_id),
        INDEX idx_role_assignments_user (user_id),
        INDEX idx_role_assignments_role (role_name)
    );

    PRINT 'Created cycle_role_assignments table';

    -- ============================================================================
    -- STUDENT ENROLLMENTS
    -- ============================================================================

    -- Student enrollment in competencies for a specific cycle
    CREATE TABLE student_enrollments (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        student_id BIGINT NOT NULL,
        competency_id BIGINT NOT NULL,
        cycle_id BIGINT NOT NULL,
        enrolled_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        enrolled_by BIGINT,
        
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE NO ACTION,
        FOREIGN KEY (cycle_id) REFERENCES assessment_cycles(id) ON DELETE NO ACTION,
        FOREIGN KEY (enrolled_by) REFERENCES users(id) ON DELETE NO ACTION,
        
        UNIQUE (student_id, competency_id, cycle_id),
        INDEX idx_enrollments_student (student_id),
        INDEX idx_enrollments_competency (competency_id),
        INDEX idx_enrollments_cycle (cycle_id)
    );

    PRINT 'Created student_enrollments table';

    -- ============================================================================
    -- ASSESSMENTS & ATTEMPTS
    -- ============================================================================

    -- Assessment attempts
    CREATE TABLE assessment_attempts (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        enrollment_id BIGINT NOT NULL,
        attempt_letter CHAR(1) NOT NULL CHECK (attempt_letter IN ('A', 'B', 'C', 'D')),
        assessor_id BIGINT NOT NULL,
        
        status NVARCHAR(50) NOT NULL DEFAULT 'Not_Started' 
            CHECK (status IN ('Not_Started', 'In_Progress', 'Submitted', 'Passed', 'Not_Passed')),
        
        total_score DECIMAL(6,2),
        max_possible_score DECIMAL(6,2),
        percentage DECIMAL(5,2),
        
        started_at DATETIME2,
        submitted_at DATETIME2,
        graded_at DATETIME2,
        
        assessor_notes NVARCHAR(MAX),
        verifier_notes NVARCHAR(MAX),
        
        is_verified BIT NOT NULL DEFAULT 0,
        verified_by BIGINT,
        verified_at DATETIME2,
        
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (enrollment_id) REFERENCES student_enrollments(id) ON DELETE CASCADE,
        FOREIGN KEY (assessor_id) REFERENCES users(id) ON DELETE NO ACTION,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE NO ACTION,
        
        UNIQUE (enrollment_id, attempt_letter),
        INDEX idx_attempts_enrollment (enrollment_id),
        INDEX idx_attempts_assessor (assessor_id),
        INDEX idx_attempts_status (status),
        INDEX idx_attempts_letter (attempt_letter),
        INDEX idx_attempts_verification (is_verified)
    );

    PRINT 'Created assessment_attempts table';

    -- Task results for each attempt
    CREATE TABLE attempt_task_results (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        attempt_id BIGINT NOT NULL,
        task_id BIGINT NOT NULL,
        score DECIMAL(5,2),
        max_score DECIMAL(5,2) NOT NULL,
        is_passed BIT NOT NULL DEFAULT 0,
        notes NVARCHAR(MAX),
        
        FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES competency_tasks(id) ON DELETE NO ACTION,
        
        UNIQUE (attempt_id, task_id),
        INDEX idx_task_results_attempt (attempt_id),
        INDEX idx_task_results_task (task_id)
    );

    PRINT 'Created attempt_task_results table';

    -- Subtask results for each attempt
    CREATE TABLE attempt_subtask_results (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        task_result_id BIGINT NOT NULL,
        subtask_id BIGINT NOT NULL,
        score DECIMAL(5,2),
        max_score DECIMAL(5,2) NOT NULL,
        is_passed BIT NOT NULL DEFAULT 0,
        notes NVARCHAR(MAX),
        
        FOREIGN KEY (task_result_id) REFERENCES attempt_task_results(id) ON DELETE CASCADE,
        FOREIGN KEY (subtask_id) REFERENCES competency_subtasks(id) ON DELETE NO ACTION,
        
        UNIQUE (task_result_id, subtask_id),
        INDEX idx_subtask_results_task (task_result_id),
        INDEX idx_subtask_results_subtask (subtask_id)
    );

    PRINT 'Created attempt_subtask_results table';

    -- ============================================================================
    -- REPORTS & ANALYTICS
    -- ============================================================================

    -- Controller reports
    CREATE TABLE controller_reports (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        cycle_id BIGINT NOT NULL,
        report_type NVARCHAR(50) NOT NULL,
        title NVARCHAR(255) NOT NULL,
        content NVARCHAR(MAX),
        generated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        generated_by BIGINT,
        
        FOREIGN KEY (cycle_id) REFERENCES assessment_cycles(id) ON DELETE NO ACTION,
        FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE NO ACTION,
        INDEX idx_reports_cycle (cycle_id),
        INDEX idx_reports_type (report_type)
    );

    PRINT 'Created controller_reports table';

    -- ============================================================================
    -- AUDIT & HISTORY
    -- ============================================================================

    -- Audit log
    CREATE TABLE audit_log (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        user_id BIGINT,
        action_type NVARCHAR(100) NOT NULL,
        entity_type NVARCHAR(100) NOT NULL,
        entity_id BIGINT,
        old_value NVARCHAR(MAX),
        new_value NVARCHAR(MAX),
        ip_address NVARCHAR(50),
        user_agent NVARCHAR(500),
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,
        INDEX idx_audit_user (user_id),
        INDEX idx_audit_action (action_type),
        INDEX idx_audit_entity (entity_type, entity_id),
        INDEX idx_audit_date (created_at)
    );

    PRINT 'Created audit_log table';
    PRINT '';
    PRINT '========================================';
    PRINT 'STEP 3: CREATING VIEWS';
    PRINT '========================================';
    GO

    -- View: Current student assessment status
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
        
        (SELECT COUNT(*) 
        FROM assessment_attempts aa 
        WHERE aa.enrollment_id = se.id 
        AND aa.status = 'Passed') AS passed_attempts_count,
        
        (SELECT COUNT(*) 
        FROM assessment_attempts aa 
        WHERE aa.enrollment_id = se.id) AS total_attempts,
        
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
    PRINT 'Created vw_student_assessment_status view';

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
    PRINT 'Created vw_assessor_workload view';

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
    PRINT 'Created vw_competency_pass_rates view';
    PRINT '';
    PRINT '========================================';
    PRINT 'STEP 4: CREATING INDEXES';
    PRINT '========================================';

    -- Additional composite indexes for common queries
    CREATE INDEX idx_attempts_enrollment_letter ON assessment_attempts(enrollment_id, attempt_letter);
    CREATE INDEX idx_attempts_status_assessor ON assessment_attempts(status, assessor_id);
    CREATE INDEX idx_enrollments_cycle_competency ON student_enrollments(cycle_id, competency_id);
    CREATE INDEX idx_task_results_attempt_passed ON attempt_task_results(attempt_id, is_passed);

    PRINT 'Created additional indexes';
    PRINT '';
    PRINT '========================================';
    PRINT 'STEP 5: CREATING TRIGGERS';
    PRINT '========================================';
    GO

    -- Trigger: Auto-calculate percentage
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
    PRINT 'Created trg_calculate_percentage trigger';

    -- Trigger: Auto-update task result
    CREATE TRIGGER trg_update_task_score
    ON attempt_subtask_results
    AFTER INSERT, UPDATE, DELETE
    AS
    BEGIN
        SET NOCOUNT ON;
        
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
    PRINT 'Created trg_update_task_score trigger';

    -- Trigger: Auto-update attempt total
    CREATE TRIGGER trg_update_attempt_score
    ON attempt_task_results
    AFTER INSERT, UPDATE, DELETE
    AS
    BEGIN
        SET NOCOUNT ON;
        
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
    PRINT 'Created trg_update_attempt_score trigger';
    PRINT '';
    PRINT '========================================';
    PRINT 'STEP 6: CREATING STORED PROCEDURES';
    PRINT '========================================';
    GO

    -- Procedure: Create new assessment attempt (with validation)
    CREATE PROCEDURE sp_create_assessment_attempt
        @enrollment_id BIGINT,
        @attempt_letter CHAR(1),
        @assessor_id BIGINT
    AS
    BEGIN
        SET NOCOUNT ON;
        
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
        
        IF EXISTS (
            SELECT 1 FROM assessment_attempts 
            WHERE enrollment_id = @enrollment_id 
            AND attempt_letter = @attempt_letter
        )
        BEGIN
            RAISERROR('Attempt already exists', 16, 1);
            RETURN;
        END
        
        INSERT INTO assessment_attempts (enrollment_id, attempt_letter, assessor_id, status, started_at)
        VALUES (@enrollment_id, @attempt_letter, @assessor_id, 'In_Progress', GETDATE());
        
        SELECT SCOPE_IDENTITY() AS attempt_id;
    END;

    GO
    PRINT 'Created sp_create_assessment_attempt procedure';

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
            SELECT NULL AS next_attempt_letter;
    END;

    GO
    PRINT 'Created sp_get_next_attempt_letter procedure';
    PRINT '';
    PRINT '========================================';
    PRINT 'STEP 7: INSERTING SEED DATA';
    PRINT '========================================';

    -- Insert default users (only if they don't exist)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@assessment.com')
    BEGIN
        INSERT INTO users (email, password_hash, full_name_en, role_type) VALUES
        ('admin@assessment.com', 'HASHED_PASSWORD', 'System Admin', 'Admin'),
        ('controller@assessment.com', 'HASHED_PASSWORD', 'Main Controller', 'Controller');
        PRINT 'Inserted default admin users';
    END
    ELSE
    BEGIN
        PRINT 'Default users already exist, skipped';
    END

    -- Insert sample grades
    IF NOT EXISTS (SELECT 1 FROM grades)
    BEGIN
        INSERT INTO grades (grade_name, grade_level, description) VALUES
        ('Grade 10', 10, 'Tenth Grade'),
        ('Grade 11', 11, 'Eleventh Grade'),
        ('Grade 12', 12, 'Twelfth Grade');
        PRINT 'Inserted sample grades';
    END
    ELSE
    BEGIN
        PRINT 'Grades already exist, skipped';
    END

    GO

    PRINT '';
    PRINT '========================================';
    PRINT 'DATABASE SETUP COMPLETED SUCCESSFULLY!';
    PRINT '========================================';
    PRINT '';
    PRINT 'Summary:';
    PRINT '- 14 Tables created';
    PRINT '- 3 Views created';
    PRINT '- 3 Triggers created';
    PRINT '- 2 Stored Procedures created';
    PRINT '- Seed data inserted';
    PRINT '';
    PRINT 'Ready to use!';
    GO
