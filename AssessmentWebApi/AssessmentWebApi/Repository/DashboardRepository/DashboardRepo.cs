using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.DashboardDto_s;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Repository.DashboardRepository
{
    public class DashboardRepo : IDashboardRepo
    {
        private readonly AppDbContext _context;
        public DashboardRepo(AppDbContext context) { _context = context; }

        // ─────────────────────────────────────────────────────────────
        // Shared helpers
        // ─────────────────────────────────────────────────────────────
        private async Task<List<long>> GetScopedStudentIds(long? courseRoundId, long? courseId, long? classId)
        {
            var q = _context.Accounts.Where(a => a.Role != null &&
                                                  a.Role.RoleName == "Student" &&
                                                  a.Role.BusinessEntity == "Assessment");
            if (classId.HasValue)
                q = q.Where(a => a.StudentExtension != null && a.StudentExtension.ClassId == classId.Value);
            var ids = await q.Select(a => a.Id).ToListAsync();

            if (courseRoundId.HasValue || courseId.HasValue)
            {
                var subQ = _context.CourseRoundAssignmentSubmissions.AsQueryable();
                if (courseId.HasValue)
                    subQ = subQ.Where(s => s.Assignment.CourseId == courseId.Value);
                if (courseRoundId.HasValue)
                    subQ = subQ.Where(s => _context.CompetencyResults
                        .Any(cr => cr.StudentId == s.StudentId && cr.CourseRoundId == courseRoundId.Value));
                var enrolled = await subQ.Select(s => s.StudentId).Distinct().ToListAsync();
                ids = ids.Intersect(enrolled).ToList();
            }
            return ids;
        }

        private async Task<List<long>> GetAssessedStudentIds(long? courseRoundId, long? courseId, long? classId)
        {
            var q = _context.CompetencyResults.AsQueryable();
            if (courseRoundId.HasValue) q = q.Where(r => r.CourseRoundId == courseRoundId.Value);
            if (courseId.HasValue)      q = q.Where(r => r.CourseId == courseId.Value);
            if (classId.HasValue)
                q = q.Where(r => _context.Accounts.Any(a =>
                    a.Id == r.StudentId && a.StudentExtension != null &&
                    a.StudentExtension.ClassId == classId.Value));
            return await q.Select(r => r.StudentId).Distinct().ToListAsync();
        }

        private async Task<List<long>> GetApprovedStudentIds(long? courseRoundId, long? courseId, long? classId)
        {
            // "Approved" = result status name contains "pass" (case-insensitive)
            var q = _context.CompetencyResults
                .Where(r => r.ResultStatus.StatusName.ToLower().Contains("pass"));
            if (courseRoundId.HasValue) q = q.Where(r => r.CourseRoundId == courseRoundId.Value);
            if (courseId.HasValue)      q = q.Where(r => r.CourseId == courseId.Value);
            if (classId.HasValue)
                q = q.Where(r => _context.Accounts.Any(a =>
                    a.Id == r.StudentId && a.StudentExtension != null &&
                    a.StudentExtension.ClassId == classId.Value));
            return await q.Select(r => r.StudentId).Distinct().ToListAsync();
        }

        // ─────────────────────────────────────────────────────────────
        // Original dashboard
        // ─────────────────────────────────────────────────────────────
        public async Task<DashboardSummaryDto> GetSummary(long? courseRoundId, long? courseId, long? classId)
        {
            var total    = await GetScopedStudentIds(courseRoundId, courseId, classId);
            var assessed = await GetAssessedStudentIds(courseRoundId, courseId, classId);
            int t = total.Count;
            int a = assessed.Intersect(total).Count();
            return new DashboardSummaryDto
            {
                TotalStudents          = t,
                ResultsSubmitted       = a,
                CycleCompletionPercent = t > 0 ? Math.Round((decimal)a / t * 100, 1) : 0
            };
        }

        public async Task<List<AssessorProgressDto>> GetAssessorProgress(long? courseRoundId, long? courseId, long? classId)
        {
            var rq = _context.CompetencyResults.AsQueryable();
            if (courseRoundId.HasValue) rq = rq.Where(r => r.CourseRoundId == courseRoundId.Value);
            if (courseId.HasValue)      rq = rq.Where(r => r.CourseId == courseId.Value);

            var submitted = await (
                from r in rq
                join assessor in _context.Accounts on r.AssessorId equals assessor.Id
                join course in _context.Courses on r.CourseId equals course.Id
                group r by new { r.AssessorId, assessor.FullNameEn, r.CourseId, course.Title } into g
                select new { g.Key.AssessorId, g.Key.FullNameEn, g.Key.CourseId, g.Key.Title,
                             Submitted = g.Select(x => x.StudentId).Distinct().Count() }
            ).ToListAsync();

            var sq = _context.CourseRoundAssignmentSubmissions.AsQueryable();
            if (courseId.HasValue) sq = sq.Where(s => s.Assignment.CourseId == courseId.Value);
            var studentQ = _context.Accounts.Where(a => a.Role != null &&
                                                           a.Role.RoleName == "Student" &&
                                                           a.Role.BusinessEntity == "Assessment");
            if (classId.HasValue) studentQ = studentQ.Where(a => a.StudentExtension != null && a.StudentExtension.ClassId == classId.Value);
            var sIds = await studentQ.Select(a => a.Id).ToListAsync();
            var totalPerCourse = await (
                from s in sq where sIds.Contains(s.StudentId)
                group s by s.Assignment.CourseId into g
                select new { CourseId = g.Key, Total = g.Select(x => x.StudentId).Distinct().Count() }
            ).ToListAsync();
            var totalMap = totalPerCourse.ToDictionary(x => x.CourseId, x => x.Total);

            var classMap = await (
                from r in rq
                join a in _context.Accounts on r.StudentId equals a.Id
                join ext in _context.StudentExtensions on a.Id equals ext.AccountId into extJ
                from ext in extJ.DefaultIfEmpty()
                join cls in _context.TblClasses on ext.ClassId equals cls.Id into clsJ
                from cls in clsJ.DefaultIfEmpty()
                group new { cls.ClassName } by r.AssessorId into g
                select new { AssessorId = g.Key, ClassName = g.Select(x => x.ClassName).FirstOrDefault() }
            ).ToListAsync();
            var classNameMap = classMap.Where(x => x.ClassName != null).ToDictionary(x => x.AssessorId, x => x.ClassName);

            return submitted.Select(s => new AssessorProgressDto
            {
                AssessorId     = s.AssessorId, AssessorName = s.FullNameEn,
                CompetencyName = s.Title,
                ClassName      = classNameMap.TryGetValue(s.AssessorId, out var cn) ? cn : null,
                Submitted      = s.Submitted,
                Total          = totalMap.TryGetValue(s.CourseId, out var t) ? t : 0
            }).ToList();
        }

        public async Task<List<CompetencySubmissionDto>> GetSubmissionsByCompetency(long? courseRoundId, long? courseId, long? classId)
        {
            var studentQ = _context.Accounts.Where(a => a.Role != null &&
                                                         a.Role.RoleName == "Student" &&
                                                         a.Role.BusinessEntity == "Assessment");
            if (classId.HasValue) studentQ = studentQ.Where(a => a.StudentExtension != null && a.StudentExtension.ClassId == classId.Value);
            var sIds = await studentQ.Select(a => a.Id).ToListAsync();

            var rq = _context.CompetencyResults.AsQueryable();
            if (courseRoundId.HasValue) rq = rq.Where(r => r.CourseRoundId == courseRoundId.Value);
            if (courseId.HasValue)      rq = rq.Where(r => r.CourseId == courseId.Value);

            var submittedPerCourse = await (
                from r in rq where sIds.Contains(r.StudentId)
                join course in _context.Courses on r.CourseId equals course.Id
                group r by new { r.CourseId, course.Title } into g
                select new { g.Key.CourseId, g.Key.Title, Submitted = g.Select(x => x.StudentId).Distinct().Count() }
            ).ToListAsync();

            var subQ = _context.CourseRoundAssignmentSubmissions.Where(s => sIds.Contains(s.StudentId));
            if (courseId.HasValue) subQ = subQ.Where(s => s.Assignment.CourseId == courseId.Value);
            var totalPerCourse = await (
                from s in subQ
                join course in _context.Courses on s.Assignment.CourseId equals course.Id
                group s by new { CourseId = s.Assignment.CourseId, course.Title } into g
                select new { g.Key.CourseId, g.Key.Title, Total = g.Select(x => x.StudentId).Distinct().Count() }
            ).ToListAsync();
            var totalMap = totalPerCourse.ToDictionary(x => x.CourseId, x => (x.Total, x.Title));
            var submittedMap = submittedPerCourse.ToDictionary(x => x.CourseId, x => x.Submitted);
            var allIds = totalMap.Keys.Union(submittedMap.Keys).Distinct();

            return allIds.Select(cid => new CompetencySubmissionDto
            {
                CourseId       = cid,
                CompetencyName = totalMap.TryGetValue(cid, out var t) ? t.Title : "Unknown",
                Submitted      = submittedMap.TryGetValue(cid, out var s) ? s : 0,
                Total          = totalMap.TryGetValue(cid, out var tt) ? tt.Total : 0
            }).ToList();
        }

        public async Task<OverallCompletionDto> GetOverallCompletion(long? courseRoundId, long? courseId, long? classId)
        {
            var total    = await GetScopedStudentIds(courseRoundId, courseId, classId);
            var assessed = await GetAssessedStudentIds(courseRoundId, courseId, classId);
            return new OverallCompletionDto
            {
                TotalStudents    = total.Count,
                AssessedStudents = assessed.Intersect(total).Count()
            };
        }

        public async Task<DashboardResDto> GetDashboard(long? courseRoundId, long? courseId, long? classId)
        {
            return new DashboardResDto
            {
                Summary                 = await GetSummary(courseRoundId, courseId, classId),
                AssessorProgress        = await GetAssessorProgress(courseRoundId, courseId, classId),
                SubmissionsByCompetency = await GetSubmissionsByCompetency(courseRoundId, courseId, classId),
                OverallCompletion       = await GetOverallCompletion(courseRoundId, courseId, classId)
            };
        }

        // ─────────────────────────────────────────────────────────────
        // Statistics summary (4 cards)
        // ─────────────────────────────────────────────────────────────
        public async Task<StatisticsSummaryDto> GetStatisticsSummary(long? courseRoundId, long? courseId, long? classId)
        {
            var total    = await GetScopedStudentIds(courseRoundId, courseId, classId);
            var assessed = await GetAssessedStudentIds(courseRoundId, courseId, classId);
            var approved = await GetApprovedStudentIds(courseRoundId, courseId, classId);
            return new StatisticsSummaryDto
            {
                TotalStudents = total.Count,
                Assessed      = assessed.Intersect(total).Count(),
                Approved      = approved.Intersect(total).Count()
            };
        }

        // ─────────────────────────────────────────────────────────────
        // Score Distribution histogram
        // ─────────────────────────────────────────────────────────────
        public async Task<List<ScoreDistributionBucketDto>> GetScoreDistribution(long? courseRoundId, long? courseId, long? classId)
        {
            var studentIds = await GetScopedStudentIds(courseRoundId, courseId, classId);

            var rq = _context.CompetencyResults
                .Where(r => studentIds.Contains(r.StudentId) &&
                            r.TotalScore != null && r.MaxScore != null && r.MaxScore > 0);
            if (courseRoundId.HasValue) rq = rq.Where(r => r.CourseRoundId == courseRoundId.Value);
            if (courseId.HasValue)      rq = rq.Where(r => r.CourseId == courseId.Value);

            var scores = await rq
                .Select(r => Math.Round(r.TotalScore!.Value / r.MaxScore!.Value * 100, 1))
                .ToListAsync();

            var buckets = new[]
            {
                new ScoreDistributionBucketDto { Label = "0-49",   RangeMin = 0,  RangeMax = 49  },
                new ScoreDistributionBucketDto { Label = "50-69",  RangeMin = 50, RangeMax = 69  },
                new ScoreDistributionBucketDto { Label = "70-79",  RangeMin = 70, RangeMax = 79  },
                new ScoreDistributionBucketDto { Label = "80-89",  RangeMin = 80, RangeMax = 89  },
                new ScoreDistributionBucketDto { Label = "90-100", RangeMin = 90, RangeMax = 100 }
            };

            foreach (var b in buckets)
                b.StudentCount = scores.Count(s => s >= b.RangeMin && s <= b.RangeMax);

            return buckets.ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // Progress by Class
        // ─────────────────────────────────────────────────────────────
        public async Task<List<ClassProgressDto>> GetProgressByClass(long? courseRoundId, long? courseId, long? classId)
        {
            var classQ = _context.TblClasses.AsQueryable();
            if (classId.HasValue) classQ = classQ.Where(c => c.Id == classId.Value);
            var classes = await classQ.Select(c => new { c.Id, c.ClassName }).ToListAsync();

            var result = new List<ClassProgressDto>();
            foreach (var cls in classes)
            {
                var total = await _context.Accounts
                    .Where(a => a.Role != null &&
                                a.Role.RoleName == "Student" &&
                                a.Role.BusinessEntity == "Assessment" &&
                                a.StudentExtension != null &&
                                a.StudentExtension.ClassId == cls.Id)
                    .CountAsync();

                var rq = _context.CompetencyResults
                    .Where(r => _context.Accounts.Any(a =>
                        a.Id == r.StudentId && a.StudentExtension != null &&
                        a.StudentExtension.ClassId == cls.Id));
                if (courseRoundId.HasValue) rq = rq.Where(r => r.CourseRoundId == courseRoundId.Value);
                if (courseId.HasValue)      rq = rq.Where(r => r.CourseId == courseId.Value);
                var assessed = await rq.Select(r => r.StudentId).Distinct().CountAsync();

                if (total > 0)
                    result.Add(new ClassProgressDto
                    {
                        ClassId   = cls.Id,
                        ClassName = cls.ClassName,
                        Total     = total,
                        Assessed  = assessed
                    });
            }
            return result;
        }

        // ─────────────────────────────────────────────────────────────
        // Competency Breakdown table
        // ─────────────────────────────────────────────────────────────
        public async Task<List<CompetencyBreakdownDto>> GetCompetencyBreakdown(long? courseRoundId, long? courseId, long? classId)
        {
            var studentIds = await GetScopedStudentIds(courseRoundId, courseId, classId);

            var courseQ = _context.Courses.Where(c => c.BusinessEntity == "Assessment");
            if (courseId.HasValue) courseQ = courseQ.Where(c => c.Id == courseId.Value);
            var courses = await courseQ.Select(c => new { c.Id, c.Title }).ToListAsync();

            var rq = _context.CompetencyResults.Where(r => studentIds.Contains(r.StudentId));
            if (courseRoundId.HasValue) rq = rq.Where(r => r.CourseRoundId == courseRoundId.Value);

            var results = await rq.Select(r => new
            {
                r.CourseId, r.StudentId,
                IsPassed = r.ResultStatus.StatusName.ToLower().Contains("pass"),
                ScorePct = r.TotalScore != null && r.MaxScore != null && r.MaxScore > 0
                    ? (decimal?)(r.TotalScore.Value / r.MaxScore.Value * 100) : null
            }).ToListAsync();

            // Enrolled per course (have at least one submission)
            var subQ = _context.CourseRoundAssignmentSubmissions
                .Where(s => studentIds.Contains(s.StudentId));
            if (courseId.HasValue) subQ = subQ.Where(s => s.Assignment.CourseId == courseId.Value);
            var enrolledPerCourse = await subQ
                .GroupBy(s => s.Assignment.CourseId)
                .Select(g => new { CourseId = g.Key, Count = g.Select(x => x.StudentId).Distinct().Count() })
                .ToListAsync();
            var enrolledMap = enrolledPerCourse.ToDictionary(x => x.CourseId, x => x.Count);

            return courses.Select(c =>
            {
                var cResults = results.Where(r => r.CourseId == c.Id).ToList();
                var assessed = cResults.Select(r => r.StudentId).Distinct().Count();
                var approved = cResults.Where(r => r.IsPassed).Select(r => r.StudentId).Distinct().Count();
                var scores   = cResults.Where(r => r.ScorePct.HasValue).Select(r => r.ScorePct!.Value).ToList();
                return new CompetencyBreakdownDto
                {
                    CourseId       = c.Id,
                    CompetencyName = c.Title,
                    Students       = enrolledMap.TryGetValue(c.Id, out var e) ? e : 0,
                    Assessed       = assessed,
                    Approved       = approved,
                    AvgScorePercent = scores.Any() ? Math.Round(scores.Average(), 1) : null
                };
            }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // Assessor Performance
        // ─────────────────────────────────────────────────────────────
        public async Task<List<AssessorPerformanceDto>> GetAssessorPerformance(long? courseRoundId, long? courseId, long? classId)
        {
            var rq = _context.CompetencyResults.AsQueryable();
            if (courseRoundId.HasValue) rq = rq.Where(r => r.CourseRoundId == courseRoundId.Value);
            if (courseId.HasValue)      rq = rq.Where(r => r.CourseId == courseId.Value);
            if (classId.HasValue)
                rq = rq.Where(r => _context.Accounts.Any(a =>
                    a.Id == r.StudentId && a.StudentExtension != null &&
                    a.StudentExtension.ClassId == classId.Value));

            var submitted = await (
                from r in rq
                join assessor in _context.Accounts on r.AssessorId equals assessor.Id
                join course in _context.Courses on r.CourseId equals course.Id
                join student in _context.Accounts on r.StudentId equals student.Id
                join ext in _context.StudentExtensions on student.Id equals ext.AccountId into extJ
                from ext in extJ.DefaultIfEmpty()
                join cls in _context.TblClasses on ext.ClassId equals cls.Id into clsJ
                from cls in clsJ.DefaultIfEmpty()
                group new { r, ClassName = cls.ClassName } by new { r.AssessorId, assessor.FullNameEn, r.CourseId, course.Title } into g
                select new
                {
                    g.Key.AssessorId, g.Key.FullNameEn, g.Key.CourseId, g.Key.Title,
                    Submitted = g.Select(x => x.r.StudentId).Distinct().Count(),
                    ClassName = g.Select(x => x.ClassName).FirstOrDefault()
                }
            ).ToListAsync();

            var studentQ = _context.Accounts.Where(a => a.Role != null &&
                                                           a.Role.RoleName == "Student" &&
                                                           a.Role.BusinessEntity == "Assessment");
            if (classId.HasValue) studentQ = studentQ.Where(a => a.StudentExtension != null && a.StudentExtension.ClassId == classId.Value);
            var sIds = await studentQ.Select(a => a.Id).ToListAsync();
            var subQ = _context.CourseRoundAssignmentSubmissions.Where(s => sIds.Contains(s.StudentId));
            if (courseId.HasValue) subQ = subQ.Where(s => s.Assignment.CourseId == courseId.Value);
            var totalMap = await subQ
                .GroupBy(s => s.Assignment.CourseId)
                .Select(g => new { CourseId = g.Key, Total = g.Select(x => x.StudentId).Distinct().Count() })
                .ToDictionaryAsync(x => x.CourseId, x => x.Total);

            return submitted.Select(s => new AssessorPerformanceDto
            {
                AssessorId     = s.AssessorId, AssessorName = s.FullNameEn,
                CompetencyName = s.Title, ClassName = s.ClassName,
                Submitted      = s.Submitted,
                Total          = totalMap.TryGetValue(s.CourseId, out var t) ? t : 0
            }).ToList();
        }

        public async Task<StatisticsResDto> GetStatistics(long? courseRoundId, long? courseId, long? classId)
        {
            return new StatisticsResDto
            {
                Summary              = await GetStatisticsSummary(courseRoundId, courseId, classId),
                ScoreDistribution    = await GetScoreDistribution(courseRoundId, courseId, classId),
                ProgressByClass      = await GetProgressByClass(courseRoundId, courseId, classId),
                CompetencyBreakdown  = await GetCompetencyBreakdown(courseRoundId, courseId, classId),
                AssessorPerformance  = await GetAssessorPerformance(courseRoundId, courseId, classId)
            };
        }

        // ─────────────────────────────────────────────────────────────
        // Cycle trend — pass/fail per round over time
        // ─────────────────────────────────────────────────────────────
        public async Task<List<CycleTrendDto>> GetCycleTrend(long? courseId, long? classId)
        {
            var studentIds = await GetScopedStudentIds(null, courseId, classId);

            var rounds = await _context.CourseRounds
                .Where(cr => !courseId.HasValue ||
                    _context.CompetencyResults.Any(r => r.CourseRoundId == cr.Id && r.CourseId == courseId.Value))
                .OrderBy(cr => cr.StartDate)
                .Select(cr => new { cr.Id, cr.RoundNumber, cr.StartDate })
                .ToListAsync();

            var results = await _context.CompetencyResults
                .Where(r => studentIds.Contains(r.StudentId))
                .Select(r => new
                {
                    r.CourseRoundId, r.StudentId,
                    IsPassed = r.ResultStatus.StatusName.ToLower().Contains("pass")
                }).ToListAsync();

            return rounds.Select(round =>
            {
                var rResults = results.Where(r => r.CourseRoundId == round.Id).ToList();
                var assessed = rResults.Select(r => r.StudentId).Distinct().Count();
                var passed   = rResults.Where(r => r.IsPassed).Select(r => r.StudentId).Distinct().Count();
                return new CycleTrendDto
                {
                    CourseRoundId = round.Id,
                    RoundNumber   = round.RoundNumber,
                    StartDate     = round.StartDate,
                    TotalStudents = studentIds.Count,
                    Assessed      = assessed,
                    Passed        = passed,
                    Failed        = assessed - passed
                };
            }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // Student history across cycles
        // ─────────────────────────────────────────────────────────────
        public async Task<StudentHistoryDto?> GetStudentHistory(long studentId, long? courseId)
        {
            var student = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == studentId);
            if (student is null) return null;

            var rq = _context.CompetencyResults.Where(r => r.StudentId == studentId);
            if (courseId.HasValue) rq = rq.Where(r => r.CourseId == courseId.Value);

            var results = await (
                from r in rq
                join course in _context.Courses on r.CourseId equals course.Id
                join round in _context.CourseRounds on r.CourseRoundId equals round.Id
                join status in _context.Statuses on r.ResultStatusId equals status.Id
                orderby r.GradedAt
                select new StudentCycleResultDto
                {
                    ResultId       = r.Id,
                    CourseId       = r.CourseId,
                    CompetencyName = course.Title,
                    CourseRoundId  = r.CourseRoundId,
                    RoundNumber    = round.RoundNumber,
                    ScorePercent   = r.TotalScore != null && r.MaxScore != null && r.MaxScore > 0
                        ? Math.Round(r.TotalScore.Value / r.MaxScore.Value * 100, 1) : null,
                    ResultStatus   = status.StatusName,
                    GradedAt       = r.GradedAt
                }
            ).ToListAsync();

            return new StudentHistoryDto
            {
                StudentId   = studentId,
                StudentName = student.FullNameEn,
                Results     = results
            };
        }

        // ─────────────────────────────────────────────────────────────
        // Pending students — not yet assessed
        // ─────────────────────────────────────────────────────────────
        public async Task<List<PendingStudentDto>> GetPendingStudents(long? courseRoundId, long? courseId, long? classId)
        {
            var allStudentIds = await GetScopedStudentIds(courseRoundId, courseId, classId);
            var assessedIds   = await GetAssessedStudentIds(courseRoundId, courseId, classId);
            var pendingIds    = allStudentIds.Except(assessedIds).ToList();

            if (!pendingIds.Any()) return new List<PendingStudentDto>();

            var students = await (
                from a in _context.Accounts
                where pendingIds.Contains(a.Id)
                join ext in _context.StudentExtensions on a.Id equals ext.AccountId into extJ
                from ext in extJ.DefaultIfEmpty()
                join cls in _context.TblClasses on ext.ClassId equals cls.Id into clsJ
                from cls in clsJ.DefaultIfEmpty()
                select new { a.Id, a.FullNameEn, ClassName = cls != null ? cls.ClassName : null }
            ).ToListAsync();

            // Which competencies are they missing results for?
            var courseQ = _context.Courses.Where(c => c.BusinessEntity == "Assessment");
            if (courseId.HasValue) courseQ = courseQ.Where(c => c.Id == courseId.Value);
            var competencies = await courseQ.Select(c => new { c.Id, c.Title }).ToListAsync();

            var existingResults = await _context.CompetencyResults
                .Where(r => pendingIds.Contains(r.StudentId))
                .Select(r => new { r.StudentId, r.CourseId })
                .ToListAsync();

            return students.Select(s =>
            {
                var done    = existingResults.Where(r => r.StudentId == s.Id).Select(r => r.CourseId).ToHashSet();
                var pending = competencies.Where(c => !done.Contains(c.Id)).Select(c => c.Title).ToList();
                return new PendingStudentDto
                {
                    StudentId           = s.Id,
                    StudentName         = s.FullNameEn,
                    ClassName           = s.ClassName,
                    PendingCompetencies = pending
                };
            }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // Pass rate by competency
        // ─────────────────────────────────────────────────────────────
        public async Task<List<CompetencyPassRateDto>> GetCompetencyPassRates(long? courseRoundId, long? classId)
        {
            var rq = _context.CompetencyResults.AsQueryable();
            if (courseRoundId.HasValue) rq = rq.Where(r => r.CourseRoundId == courseRoundId.Value);
            if (classId.HasValue)
                rq = rq.Where(r => _context.Accounts.Any(a =>
                    a.Id == r.StudentId && a.StudentExtension != null &&
                    a.StudentExtension.ClassId == classId.Value));

            return await (
                from r in rq
                join course in _context.Courses on r.CourseId equals course.Id
                group r by new { r.CourseId, course.Title } into g
                select new CompetencyPassRateDto
                {
                    CourseId        = g.Key.CourseId,
                    CompetencyName  = g.Key.Title,
                    TotalAssessed   = g.Select(x => x.StudentId).Distinct().Count(),
                    TotalPassed     = g.Where(x => x.ResultStatus.StatusName.ToLower().Contains("pass"))
                                       .Select(x => x.StudentId).Distinct().Count()
                }
            ).ToListAsync();
        }
    }
}
