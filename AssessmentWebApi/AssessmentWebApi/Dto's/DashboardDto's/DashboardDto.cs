namespace AssessmentWebApi.Dto_s.DashboardDto_s
{
    // ─────────────────────────────────────────────────────────────────────
    // FULL DASHBOARD (original)
    // ─────────────────────────────────────────────────────────────────────

    public class DashboardResDto
    {
        public DashboardSummaryDto Summary { get; set; } = new();
        public List<AssessorProgressDto> AssessorProgress { get; set; } = new();
        public List<CompetencySubmissionDto> SubmissionsByCompetency { get; set; } = new();
        public OverallCompletionDto OverallCompletion { get; set; } = new();
    }

    public class DashboardSummaryDto
    {
        public int TotalStudents { get; set; }
        public int ResultsSubmitted { get; set; }
        public decimal CycleCompletionPercent { get; set; }
    }

    public class AssessorProgressDto
    {
        public long AssessorId { get; set; }
        public string AssessorName { get; set; } = null!;
        public string? CompetencyName { get; set; }
        public string? ClassName { get; set; }
        public int Submitted { get; set; }
        public int Total { get; set; }
        public decimal ProgressPercent => Total > 0 ? Math.Round((decimal)Submitted / Total * 100, 1) : 0;
    }

    public class CompetencySubmissionDto
    {
        public long CourseId { get; set; }
        public string CompetencyName { get; set; } = null!;
        public int Submitted { get; set; }
        public int Total { get; set; }
        public decimal ProgressPercent => Total > 0 ? Math.Round((decimal)Submitted / Total * 100, 1) : 0;
    }

    public class OverallCompletionDto
    {
        public int AssessedStudents { get; set; }
        public int TotalStudents { get; set; }
        public decimal CompletionPercent => TotalStudents > 0
            ? Math.Round((decimal)AssessedStudents / TotalStudents * 100, 1) : 0;
    }

    // ─────────────────────────────────────────────────────────────────────
    // STATISTICS PAGE — full response
    // ─────────────────────────────────────────────────────────────────────

    public class StatisticsResDto
    {
        public StatisticsSummaryDto Summary { get; set; } = new();
        public List<ScoreDistributionBucketDto> ScoreDistribution { get; set; } = new();
        public List<ClassProgressDto> ProgressByClass { get; set; } = new();
        public List<CompetencyBreakdownDto> CompetencyBreakdown { get; set; } = new();
        public List<AssessorPerformanceDto> AssessorPerformance { get; set; } = new();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Top 4 stat cards
    // ─────────────────────────────────────────────────────────────────────

    public class StatisticsSummaryDto
    {
        /// <summary>Total students in scope.</summary>
        public int TotalStudents { get; set; }

        /// <summary>Students who have at least one CompetencyResult.</summary>
        public int Assessed { get; set; }

        /// <summary>Students whose latest result has a Pass status.</summary>
        public int Approved { get; set; }

        /// <summary>Assessed / TotalStudents * 100.</summary>
        public decimal CompletionPercent => TotalStudents > 0
            ? Math.Round((decimal)Assessed / TotalStudents * 100, 1) : 0;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Score Distribution histogram
    // ─────────────────────────────────────────────────────────────────────

    public class ScoreDistributionBucketDto
    {
        /// <summary>Label shown on x-axis e.g. "0-49", "50-69".</summary>
        public string Label { get; set; } = null!;
        public int RangeMin { get; set; }
        public int RangeMax { get; set; }

        /// <summary>Number of students whose score % falls in this bucket.</summary>
        public int StudentCount { get; set; }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Progress by Class
    // ─────────────────────────────────────────────────────────────────────

    public class ClassProgressDto
    {
        public long ClassId { get; set; }
        public string ClassName { get; set; } = null!;
        public int Assessed { get; set; }
        public int Total { get; set; }
        public decimal ProgressPercent => Total > 0 ? Math.Round((decimal)Assessed / Total * 100, 1) : 0;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Competency Breakdown table
    // ─────────────────────────────────────────────────────────────────────

    public class CompetencyBreakdownDto
    {
        public long CourseId { get; set; }
        public string CompetencyName { get; set; } = null!;

        /// <summary>Total students enrolled in this competency.</summary>
        public int Students { get; set; }

        /// <summary>Students who have a CompetencyResult for this competency.</summary>
        public int Assessed { get; set; }

        /// <summary>Students with a Pass result.</summary>
        public int Approved { get; set; }

        /// <summary>Average score percentage across all results for this competency.</summary>
        public decimal? AvgScorePercent { get; set; }

        public decimal ProgressPercent => Students > 0 ? Math.Round((decimal)Assessed / Students * 100, 1) : 0;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Assessor Performance
    // ─────────────────────────────────────────────────────────────────────

    public class AssessorPerformanceDto
    {
        public long AssessorId { get; set; }
        public string AssessorName { get; set; } = null!;
        public string? CompetencyName { get; set; }
        public string? ClassName { get; set; }
        public int Submitted { get; set; }
        public int Total { get; set; }
        public decimal ProgressPercent => Total > 0 ? Math.Round((decimal)Submitted / Total * 100, 1) : 0;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Pass / Fail trend over cycles
    // ─────────────────────────────────────────────────────────────────────

    public class CycleTrendDto
    {
        public long CourseRoundId { get; set; }
        public decimal? RoundNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public int TotalStudents { get; set; }
        public int Assessed { get; set; }
        public int Passed { get; set; }
        public int Failed { get; set; }
        public decimal PassRate => Assessed > 0 ? Math.Round((decimal)Passed / Assessed * 100, 1) : 0;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Student result history (per student across cycles)
    // ─────────────────────────────────────────────────────────────────────

    public class StudentHistoryDto
    {
        public long StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public List<StudentCycleResultDto> Results { get; set; } = new();
    }

    public class StudentCycleResultDto
    {
        public long ResultId { get; set; }
        public long CourseId { get; set; }
        public string? CompetencyName { get; set; }
        public long CourseRoundId { get; set; }
        public decimal? RoundNumber { get; set; }
        public decimal? ScorePercent { get; set; }
        public string? ResultStatus { get; set; }
        public DateTime GradedAt { get; set; }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Not-yet-assessed students list
    // ─────────────────────────────────────────────────────────────────────

    public class PendingStudentDto
    {
        public long StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public string? ClassName { get; set; }
        public List<string> PendingCompetencies { get; set; } = new();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Pass rate by competency over time
    // ─────────────────────────────────────────────────────────────────────

    public class CompetencyPassRateDto
    {
        public long CourseId { get; set; }
        public string CompetencyName { get; set; } = null!;
        public int TotalAssessed { get; set; }
        public int TotalPassed { get; set; }
        public decimal PassRate => TotalAssessed > 0
            ? Math.Round((decimal)TotalPassed / TotalAssessed * 100, 1) : 0;
    }
}
