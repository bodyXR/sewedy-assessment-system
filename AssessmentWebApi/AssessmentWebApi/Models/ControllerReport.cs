using System;

namespace AssessmentWebApi.Models
{
    public class ControllerReport
    {
        public long Id { get; set; }
        public long CycleId { get; set; }
        public string ReportType { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string? Content { get; set; }
        public DateTime GeneratedAt { get; set; }
        public long? GeneratedBy { get; set; }
    }
}
