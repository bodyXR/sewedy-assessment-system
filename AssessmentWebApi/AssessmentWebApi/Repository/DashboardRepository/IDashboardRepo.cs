using AssessmentWebApi.Dto_s.DashboardDto_s;

namespace AssessmentWebApi.Repository.DashboardRepository
{
    public interface IDashboardRepo
    {
        // ── Original dashboard ──────────────────────────────────────
        Task<DashboardResDto> GetDashboard(long? courseRoundId, long? courseId, long? classId);
        Task<DashboardSummaryDto> GetSummary(long? courseRoundId, long? courseId, long? classId);
        Task<List<AssessorProgressDto>> GetAssessorProgress(long? courseRoundId, long? courseId, long? classId);
        Task<List<CompetencySubmissionDto>> GetSubmissionsByCompetency(long? courseRoundId, long? courseId, long? classId);
        Task<OverallCompletionDto> GetOverallCompletion(long? courseRoundId, long? courseId, long? classId);

        // ── Statistics page ─────────────────────────────────────────
        Task<StatisticsResDto> GetStatistics(long? courseRoundId, long? courseId, long? classId);
        Task<StatisticsSummaryDto> GetStatisticsSummary(long? courseRoundId, long? courseId, long? classId);
        Task<List<ScoreDistributionBucketDto>> GetScoreDistribution(long? courseRoundId, long? courseId, long? classId);
        Task<List<ClassProgressDto>> GetProgressByClass(long? courseRoundId, long? courseId, long? classId);
        Task<List<CompetencyBreakdownDto>> GetCompetencyBreakdown(long? courseRoundId, long? courseId, long? classId);
        Task<List<AssessorPerformanceDto>> GetAssessorPerformance(long? courseRoundId, long? courseId, long? classId);

        // ── Extra analytics ─────────────────────────────────────────
        Task<List<CycleTrendDto>> GetCycleTrend(long? courseId, long? classId);
        Task<StudentHistoryDto?> GetStudentHistory(long studentId, long? courseId);
        Task<List<PendingStudentDto>> GetPendingStudents(long? courseRoundId, long? courseId, long? classId);
        Task<List<CompetencyPassRateDto>> GetCompetencyPassRates(long? courseRoundId, long? classId);
    }
}
