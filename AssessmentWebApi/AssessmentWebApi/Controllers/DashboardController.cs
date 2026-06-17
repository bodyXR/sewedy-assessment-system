using AssessmentWebApi.Repository.DashboardRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardRepo _repo;
        public DashboardController(IDashboardRepo repo) { _repo = repo; }

        // ── Original dashboard ───────────────────────────────────────

        /// <summary>Full dashboard in one call.</summary>
        [HttpGet]
        public async Task<IActionResult> GetDashboard(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetDashboard(courseRoundId, courseId, classId));

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetSummary(courseRoundId, courseId, classId));

        [HttpGet("assessor-progress")]
        public async Task<IActionResult> GetAssessorProgress(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetAssessorProgress(courseRoundId, courseId, classId));

        [HttpGet("submissions-by-competency")]
        public async Task<IActionResult> GetSubmissionsByCompetency(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetSubmissionsByCompetency(courseRoundId, courseId, classId));

        [HttpGet("overall-completion")]
        public async Task<IActionResult> GetOverallCompletion(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetOverallCompletion(courseRoundId, courseId, classId));

        // ── Statistics page ──────────────────────────────────────────

        /// <summary>Full statistics page in one call.</summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetStatistics(courseRoundId, courseId, classId));

        /// <summary>Top 4 stat cards: Total, Assessed, Approved, Completion %.</summary>
        [HttpGet("statistics/summary")]
        public async Task<IActionResult> GetStatisticsSummary(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetStatisticsSummary(courseRoundId, courseId, classId));

        /// <summary>Score distribution histogram buckets (0-49, 50-69, 70-79, 80-89, 90-100).</summary>
        [HttpGet("statistics/score-distribution")]
        public async Task<IActionResult> GetScoreDistribution(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetScoreDistribution(courseRoundId, courseId, classId));

        /// <summary>Progress by class — assessed/total per class.</summary>
        [HttpGet("statistics/progress-by-class")]
        public async Task<IActionResult> GetProgressByClass(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetProgressByClass(courseRoundId, courseId, classId));

        /// <summary>Competency breakdown table — students, assessed, approved, avg score, progress %.</summary>
        [HttpGet("statistics/competency-breakdown")]
        public async Task<IActionResult> GetCompetencyBreakdown(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetCompetencyBreakdown(courseRoundId, courseId, classId));

        /// <summary>Assessor performance — name, competency, class, submitted/total.</summary>
        [HttpGet("statistics/assessor-performance")]
        public async Task<IActionResult> GetAssessorPerformance(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetAssessorPerformance(courseRoundId, courseId, classId));

        // ── Extra analytics ──────────────────────────────────────────

        /// <summary>Pass/fail trend across all cycles for a competency — for line/bar charts.</summary>
        [HttpGet("analytics/cycle-trend")]
        public async Task<IActionResult> GetCycleTrend(
            [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetCycleTrend(courseId, classId));

        /// <summary>Full result history for a single student across all cycles and competencies.</summary>
        [HttpGet("analytics/student-history/{studentId:long}")]
        public async Task<IActionResult> GetStudentHistory(long studentId, [FromQuery] long? courseId)
        {
            var result = await _repo.GetStudentHistory(studentId, courseId);
            if (result is null) return NotFound(new { message = $"Student {studentId} not found." });
            return Ok(result);
        }

        /// <summary>Students not yet assessed — with which competencies are still pending.</summary>
        [HttpGet("analytics/pending-students")]
        public async Task<IActionResult> GetPendingStudents(
            [FromQuery] long? courseRoundId, [FromQuery] long? courseId, [FromQuery] long? classId)
            => Ok(await _repo.GetPendingStudents(courseRoundId, courseId, classId));

        /// <summary>Pass rate per competency — total assessed vs total passed.</summary>
        [HttpGet("analytics/competency-pass-rates")]
        public async Task<IActionResult> GetCompetencyPassRates(
            [FromQuery] long? courseRoundId, [FromQuery] long? classId)
            => Ok(await _repo.GetCompetencyPassRates(courseRoundId, classId));
    }
}
