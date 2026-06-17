using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.AccountDto_s;
using AssessmentWebApi.Dto_s.StudentDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Repository.StudentRepository
{
    public class StudentRepo : GenericRepo<Account>, IStudentRepo
    {
        public StudentRepo(AppDbContext context) : base(context) { }

        // ─────────────────────────────────────────────────────────────
        // Base query — scoped to Student role with Assessment business entity
        // ─────────────────────────────────────────────────────────────
        private IQueryable<Account> StudentQuery() =>
            _context.Accounts
                .Where(a => a.Role != null &&
                            a.Role.RoleName == "Student" &&
                            a.Role.BusinessEntity == "Assessment")
                .Include(a => a.Role)
                .Include(a => a.Status)
                .Include(a => a.StudentExtension);

        private static StudentResDto MapToDto(
            Account a,
            IEnumerable<StudentCompetencyDto>? competencies = null) => new()
        {
            Id           = a.Id,
            NationalId   = a.NationalId,
            Email        = a.Email,
            Phone        = a.Phone,
            FullNameEn   = a.FullNameEn,
            FullNameAr   = a.FullNameAr,
            Status       = a.Status?.StatusName,
            ClassId      = a.StudentExtension?.ClassId,
            IsLeader     = a.StudentExtension?.IsLeader,
            IsActive     = a.IsActive,
            CreatedAt    = a.CreatedAt,
            Competencies = competencies?.ToList() ?? new List<StudentCompetencyDto>()
        };

        // ─────────────────────────────────────────────────────────────
        // Competency lookup — uses a proper join, no nested subqueries
        // ─────────────────────────────────────────────────────────────
        private async Task<Dictionary<long, List<StudentCompetencyDto>>> BuildCompetencyLookup(
            IEnumerable<long> studentIds)
        {
            var idList = studentIds.ToList();

            var rows = await (
                from sub  in _context.CourseRoundAssignmentSubmissions
                join asgn in _context.CourseRoundAssignments
                    on sub.AssignmentId equals asgn.Id
                join c    in _context.Courses
                    on asgn.CourseId equals c.Id
                where idList.Contains(sub.StudentId)
                select new
                {
                    sub.StudentId,
                    CourseId    = c.Id,
                    CourseTitle = c.Title
                }
            ).Distinct().ToListAsync();

            return rows
                .GroupBy(r => r.StudentId)
                .ToDictionary(
                    g => g.Key,
                    g => g.DistinctBy(r => r.CourseId)
                          .Select(r => new StudentCompetencyDto
                          {
                              CourseId       = r.CourseId,
                              CompetencyName = r.CourseTitle
                          })
                          .ToList()
                );
        }

        // ─────────────────────────────────────────────────────────────
        // 1. Get all students
        // ─────────────────────────────────────────────────────────────
        public async new Task<ICollection<AccountResDto>> GetAll()
        {
            return await _context.Accounts
                .Where(a => a.Role != null &&
                            a.Role.RoleName == "Student" &&
                            a.Role.BusinessEntity == "Assessment")
                .Include(a => a.Role)
                .Include(a => a.Status)
                .Select(a => new AccountResDto
                {
                    Id         = a.Id,
                    NationalId = a.NationalId,
                    Email      = a.Email,
                    Phone      = a.Phone,
                    FullNameEn = a.FullNameEn,
                    FullNameAr = a.FullNameAr,
                    Status     = a.Status.StatusName
                })
                .ToListAsync();
        }

        // ─────────────────────────────────────────────────────────────
        // 2. Get student by ID
        // ─────────────────────────────────────────────────────────────
        public async new Task<StudentResDto?> GetById(long id)
        {
            var account = await StudentQuery()
                .FirstOrDefaultAsync(a => a.Id == id);

            if (account is null) return null;

            var lookup = await BuildCompetencyLookup(new[] { account.Id });
            lookup.TryGetValue(account.Id, out var competencies);
            return MapToDto(account, competencies);
        }

        // ─────────────────────────────────────────────────────────────
        // 3. Filter by class
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<StudentResDto>> FilterByClass(string className)
        {
            var classRecord = await _context.TblClasses
                .FirstOrDefaultAsync(c => c.ClassName.ToLower() == className.ToLower());

            if (classRecord is null) return new List<StudentResDto>();

            var students = await StudentQuery()
                .Where(a => a.StudentExtension != null &&
                            a.StudentExtension.ClassId == classRecord.Id)
                .ToListAsync();

            if (!students.Any()) return new List<StudentResDto>();

            var lookup = await BuildCompetencyLookup(students.Select(s => s.Id));
            return students.Select(a => { lookup.TryGetValue(a.Id, out var c); return MapToDto(a, c); }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // 4. Filter by competency (Course title or ID)
        // Chain: Course → CourseRoundAssignment → CourseRoundAssignmentSubmission → Student
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<StudentResDto>> FilterByCompetency(string competency)
        {
            bool isId = long.TryParse(competency, out long courseId);

            var courseIds = await _context.Courses
                .Where(c => isId
                    ? c.Id == courseId
                    : c.Title.ToLower().Contains(competency.ToLower()))
                .Select(c => c.Id)
                .ToListAsync();

            if (!courseIds.Any()) return new List<StudentResDto>();

            var studentIds = await (
                from sub  in _context.CourseRoundAssignmentSubmissions
                join asgn in _context.CourseRoundAssignments on sub.AssignmentId equals asgn.Id
                where courseIds.Contains(asgn.CourseId)
                select sub.StudentId
            ).Distinct().ToListAsync();

            if (!studentIds.Any()) return new List<StudentResDto>();

            var students = await StudentQuery()
                .Where(a => studentIds.Contains(a.Id))
                .ToListAsync();

            var lookup = await BuildCompetencyLookup(studentIds);
            return students.Select(a => { lookup.TryGetValue(a.Id, out var c); return MapToDto(a, c); }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // 5. Get students assigned to an assessor
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<StudentResDto>> GetByAssessor(long assessorAccountId)
        {
            var studentIds = await (
                from sub  in _context.CourseRoundAssignmentSubmissions
                join asgn in _context.CourseRoundAssignments on sub.AssignmentId equals asgn.Id
                where asgn.InstructorId == assessorAccountId
                select sub.StudentId
            ).Distinct().ToListAsync();

            if (!studentIds.Any()) return new List<StudentResDto>();

            var students = await StudentQuery()
                .Where(a => studentIds.Contains(a.Id))
                .ToListAsync();

            var lookup = await BuildCompetencyLookup(studentIds);
            return students.Select(a => { lookup.TryGetValue(a.Id, out var c); return MapToDto(a, c); }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // 6. Filter by trial — CourseRound.StatusId matches status name
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<StudentResDto>> FilterByTrial(string trialStatusName)
        {
            var trialStatus = await _context.Statuses
                .FirstOrDefaultAsync(s => s.StatusName.ToLower() == trialStatusName.ToLower());

            if (trialStatus is null) return new List<StudentResDto>();

            // Get courses that have at least one round with this status
            var courseIds = await _context.CourseRounds
                .Where(cr => cr.StatusId == trialStatus.Id)
                .Select(cr => cr.CourseId)
                .Distinct()
                .ToListAsync();

            if (!courseIds.Any()) return new List<StudentResDto>();

            var studentIds = await (
                from sub  in _context.CourseRoundAssignmentSubmissions
                join asgn in _context.CourseRoundAssignments on sub.AssignmentId equals asgn.Id
                where courseIds.Contains(asgn.CourseId)
                select sub.StudentId
            ).Distinct().ToListAsync();

            if (!studentIds.Any()) return new List<StudentResDto>();

            var students = await StudentQuery()
                .Where(a => studentIds.Contains(a.Id))
                .ToListAsync();

            var lookup = await BuildCompetencyLookup(studentIds);
            return students.Select(a => { lookup.TryGetValue(a.Id, out var c); return MapToDto(a, c); }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // 7. Filter by assessment status (passed / not passed)
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<StudentResDto>> GetByStatus(string status)
        {
            var statusRecord = await _context.Statuses
                .FirstOrDefaultAsync(s => s.StatusName.ToLower() == status.ToLower());

            long statusId = statusRecord is not null
                ? statusRecord.Id
                : status.ToLower() == "passed" ? 70 : 71;

            var students = await StudentQuery()
                .Where(a => a.StatusId == statusId)
                .ToListAsync();

            if (!students.Any()) return new List<StudentResDto>();

            var lookup = await BuildCompetencyLookup(students.Select(s => s.Id));
            return students.Select(a => { lookup.TryGetValue(a.Id, out var c); return MapToDto(a, c); }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // 8. Enroll students into a competency
        // ─────────────────────────────────────────────────────────────
        public async Task<EnrollStudentResDto> EnrollStudents(EnrollStudentReqDto request)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId);

            if (course is null)
                throw new InvalidOperationException($"Course {request.CourseId} was not found.");

            var tasks = await _context.CourseRoundAssignments
                .Where(a => a.CourseId == request.CourseId)
                .ToListAsync();

            if (!tasks.Any())
                throw new InvalidOperationException(
                    $"Course {request.CourseId} has no tasks. Add CourseRoundAssignments first.");

            var pendingStatus = await _context.Statuses
                .FirstOrDefaultAsync(s => s.StatusName.ToLower() == "pending");
            long pendingStatusId = pendingStatus?.Id ?? 1;

            var studentAccounts = await _context.Accounts
                .Where(a => request.StudentIds.Contains(a.Id) &&
                            a.Role != null &&
                            a.Role.RoleName == "Student" &&
                            a.Role.BusinessEntity == "Assessment")
                .Include(a => a.Role)
                .ToListAsync();

            var foundIds    = studentAccounts.Select(a => a.Id).ToHashSet();
            var notFoundIds = request.StudentIds.Where(id => !foundIds.Contains(id)).ToList();

            var taskIds = tasks.Select(t => t.Id).ToList();
            var existing = await _context.CourseRoundAssignmentSubmissions
                .Where(s => foundIds.Contains(s.StudentId) && taskIds.Contains(s.AssignmentId))
                .Select(s => new { s.StudentId, s.AssignmentId })
                .ToListAsync();

            var existingByStudent = existing
                .GroupBy(s => s.StudentId)
                .ToDictionary(g => g.Key, g => g.Select(s => s.AssignmentId).ToHashSet());

            var enrolled        = new List<EnrolledStudentSummary>();
            var alreadyEnrolled = new List<EnrolledStudentSummary>();

            foreach (var student in studentAccounts)
            {
                existingByStudent.TryGetValue(student.Id, out var existingTaskIds);
                existingTaskIds ??= new HashSet<long>();

                var missingTasks = tasks.Where(t => !existingTaskIds.Contains(t.Id)).ToList();

                if (!missingTasks.Any())
                {
                    alreadyEnrolled.Add(new EnrolledStudentSummary
                    {
                        StudentId     = student.Id,
                        FullNameEn    = student.FullNameEn,
                        FullNameAr    = student.FullNameAr,
                        TasksAssigned = 0
                    });
                    continue;
                }

                var newSubmissions = missingTasks.Select(task => new CourseRoundAssignmentSubmission
                {
                    AssignmentId   = task.Id,
                    StudentId      = student.Id,
                    SubmissionLink = string.Empty,
                    SubmittedAt    = DateTime.UtcNow,
                    StatusId       = pendingStatusId
                }).ToList();

                await _context.CourseRoundAssignmentSubmissions.AddRangeAsync(newSubmissions);

                enrolled.Add(new EnrolledStudentSummary
                {
                    StudentId     = student.Id,
                    FullNameEn    = student.FullNameEn,
                    FullNameAr    = student.FullNameAr,
                    TasksAssigned = newSubmissions.Count
                });
            }

            await _context.SaveChangesAsync();

            return new EnrollStudentResDto
            {
                CourseId        = course.Id,
                CompetencyName  = course.Title,
                Enrolled        = enrolled,
                AlreadyEnrolled = alreadyEnrolled,
                NotFound        = notFoundIds
            };
        }

        // ─────────────────────────────────────────────────────────────
        // 9. Combined filter: class + competency + status
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<StudentResDto>> FilterByClassCompetencyStatus(
            string? className, string? competency, string? status)
        {
            long? classId = null;
            if (!string.IsNullOrWhiteSpace(className))
            {
                var classRecord = await _context.TblClasses
                    .FirstOrDefaultAsync(c => c.ClassName.ToLower() == className.ToLower());
                if (classRecord is null) return new List<StudentResDto>();
                classId = classRecord.Id;
            }

            HashSet<long>? competencyStudentIds = null;
            if (!string.IsNullOrWhiteSpace(competency))
            {
                bool isId = long.TryParse(competency, out long courseId);

                var courseIds = await _context.Courses
                    .Where(c => isId
                        ? c.Id == courseId
                        : c.Title.ToLower().Contains(competency.ToLower()))
                    .Select(c => c.Id)
                    .ToListAsync();

                if (!courseIds.Any()) return new List<StudentResDto>();

                var ids = await (
                    from sub  in _context.CourseRoundAssignmentSubmissions
                    join asgn in _context.CourseRoundAssignments on sub.AssignmentId equals asgn.Id
                    where courseIds.Contains(asgn.CourseId)
                    select sub.StudentId
                ).Distinct().ToListAsync();

                if (!ids.Any()) return new List<StudentResDto>();
                competencyStudentIds = ids.ToHashSet();
            }

            long? statusId = null;
            if (!string.IsNullOrWhiteSpace(status))
            {
                var statusRecord = await _context.Statuses
                    .FirstOrDefaultAsync(s => s.StatusName.ToLower() == status.ToLower());
                statusId = statusRecord is not null
                    ? statusRecord.Id
                    : status.ToLower() == "passed" ? 70 : 71;
            }

            var query = StudentQuery();
            if (classId.HasValue)
                query = query.Where(a => a.StudentExtension != null &&
                                         a.StudentExtension.ClassId == classId.Value);
            if (competencyStudentIds is not null)
                query = query.Where(a => competencyStudentIds.Contains(a.Id));
            if (statusId.HasValue)
                query = query.Where(a => a.StatusId == statusId.Value);

            var students = await query.ToListAsync();
            if (!students.Any()) return new List<StudentResDto>();

            var lookup = await BuildCompetencyLookup(students.Select(s => s.Id));
            return students.Select(a => { lookup.TryGetValue(a.Id, out var c); return MapToDto(a, c); }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // 10. Filter by grade and/or class
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<StudentResDto>> FilterByGradeAndClass(
            string? grade, string? className)
        {
            List<long>? classIdsFromGrade = null;
            if (!string.IsNullOrWhiteSpace(grade))
            {
                bool isGradeId = long.TryParse(grade, out long gradeId);
                var matchingGradeIds = await _context.Grades
                    .Where(g => isGradeId
                        ? g.Id == gradeId
                        : g.GradeName.ToLower().Contains(grade.ToLower()))
                    .Select(g => g.Id)
                    .ToListAsync();

                if (!matchingGradeIds.Any()) return new List<StudentResDto>();

                classIdsFromGrade = await _context.TblClasses
                    .Where(c => matchingGradeIds.Contains(c.GradeId))
                    .Select(c => c.Id)
                    .ToListAsync();

                if (!classIdsFromGrade.Any()) return new List<StudentResDto>();
            }

            long? specificClassId = null;
            if (!string.IsNullOrWhiteSpace(className))
            {
                var classRecord = await _context.TblClasses
                    .FirstOrDefaultAsync(c => c.ClassName.ToLower() == className.ToLower());
                if (classRecord is null) return new List<StudentResDto>();
                specificClassId = classRecord.Id;
            }

            var query = StudentQuery().Where(a => a.StudentExtension != null);

            if (classIdsFromGrade is not null)
                query = query.Where(a => a.StudentExtension!.ClassId != null &&
                                         classIdsFromGrade.Contains(a.StudentExtension.ClassId.Value));
            if (specificClassId.HasValue)
                query = query.Where(a => a.StudentExtension!.ClassId == specificClassId.Value);

            var students = await query.ToListAsync();
            if (!students.Any()) return new List<StudentResDto>();

            var lookup = await BuildCompetencyLookup(students.Select(s => s.Id));
            return students.Select(a => { lookup.TryGetValue(a.Id, out var c); return MapToDto(a, c); }).ToList();
        }
    }
}
