using AssessmentWebApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        // ============================================================================
        // CONTROLLER REPORTS ENDPOINTS
        // ============================================================================

        /// <summary>Get all controller reports</summary>
        /// <param name="cycleId">Optional: filter by assessment cycle</param>
        [HttpGet("controller-reports")]
        public async Task<IActionResult> GetControllerReports([FromQuery] long? cycleId)
        {
            var query = _context.ControllerReports.AsQueryable();

            if (cycleId.HasValue)
                query = query.Where(r => r.CycleId == cycleId.Value);

            var reports = await query
                .OrderByDescending(r => r.GeneratedAt)
                .Select(r => new
                {
                    id = r.Id,
                    cycleId = r.CycleId,
                    reportType = r.ReportType,
                    title = r.Title,
                    content = r.Content,
                    generatedAt = r.GeneratedAt,
                    generatedBy = r.GeneratedBy
                })
                .ToListAsync();

            return Ok(reports);
        }

        /// <summary>Get controller report by ID</summary>
        [HttpGet("controller-reports/{id}")]
        public async Task<IActionResult> GetControllerReportById(long id)
        {
            var report = await _context.ControllerReports
                .Where(r => r.Id == id)
                .Select(r => new
                {
                    id = r.Id,
                    cycleId = r.CycleId,
                    reportType = r.ReportType,
                    title = r.Title,
                    content = r.Content,
                    generatedAt = r.GeneratedAt,
                    generatedBy = r.GeneratedBy
                })
                .FirstOrDefaultAsync();

            if (report == null)
                return NotFound(new { message = $"Report {id} not found" });

            return Ok(report);
        }

        /// <summary>Create a new controller report (sent by verifier)</summary>
        [HttpPost("controller-reports")]
        public async Task<IActionResult> CreateControllerReport([FromBody] CreateControllerReportRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Content))
                return BadRequest(new { message = "Title and content are required" });

            var report = new ControllerReport
            {
                CycleId = request.CycleId,
                ReportType = request.ReportType ?? "Verifier Monitoring",
                Title = request.Title,
                Content = request.Content,
                GeneratedAt = DateTime.UtcNow,
                GeneratedBy = request.GeneratedBy
            };

            _context.ControllerReports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = report.Id,
                cycleId = report.CycleId,
                reportType = report.ReportType,
                title = report.Title,
                content = report.Content,
                generatedAt = report.GeneratedAt,
                generatedBy = report.GeneratedBy
            });
        }

        // ============================================================================
        // AUDIT LOG / ACTIVITY LOG ENDPOINTS
        // ============================================================================

        /// <summary>Get activity log (audit log)</summary>
        /// <param name="cycleId">Optional: filter by assessment cycle (indirectly via entity_id)</param>
        /// <param name="entityType">Optional: filter by entity type (e.g., "Assessment", "Student")</param>
        /// <param name="actionType">Optional: filter by action type (e.g., "Submit", "Approve")</param>
        /// <param name="limit">Max number of records to return (default 100)</param>
        [HttpGet("activity-log")]
        public async Task<IActionResult> GetActivityLog(
            [FromQuery] long? cycleId,
            [FromQuery] string? entityType,
            [FromQuery] string? actionType,
            [FromQuery] int limit = 100)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(entityType))
                query = query.Where(a => a.EntityType == entityType);

            if (!string.IsNullOrWhiteSpace(actionType))
                query = query.Where(a => a.ActionType == actionType);

            var activities = await query
                .OrderByDescending(a => a.CreatedAt)
                .Take(limit)
                .Select(a => new
                {
                    id = a.Id,
                    userId = a.UserId,
                    actionType = a.ActionType,
                    entityType = a.EntityType,
                    entityId = a.EntityId,
                    oldValue = a.OldValue,
                    newValue = a.NewValue,
                    ipAddress = a.IpAddress,
                    userAgent = a.UserAgent,
                    createdAt = a.CreatedAt
                })
                .ToListAsync();

            return Ok(activities);
        }

        /// <summary>Create activity log entry</summary>
        [HttpPost("activity-log")]
        public async Task<IActionResult> CreateActivityLog([FromBody] CreateActivityLogRequest request)
        {
            var log = new AuditLog
            {
                UserId = request.UserId,
                ActionType = request.ActionType,
                EntityType = request.EntityType,
                EntityId = request.EntityId,
                OldValue = request.OldValue,
                NewValue = request.NewValue,
                IpAddress = request.IpAddress,
                UserAgent = request.UserAgent,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new { id = log.Id, createdAt = log.CreatedAt });
        }
    }

    // ============================================================================
    // REQUEST DTOs
    // ============================================================================

    public class CreateControllerReportRequest
    {
        public long CycleId { get; set; }
        public string? ReportType { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public long? GeneratedBy { get; set; }
    }

    public class CreateActivityLogRequest
    {
        public long? UserId { get; set; }
        public string ActionType { get; set; } = null!;
        public string EntityType { get; set; } = null!;
        public long? EntityId { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
