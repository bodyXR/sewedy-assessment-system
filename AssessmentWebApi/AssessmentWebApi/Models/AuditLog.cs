using System;

namespace AssessmentWebApi.Models
{
    public class AuditLog
    {
        public long Id { get; set; }
        public long? UserId { get; set; }
        public string ActionType { get; set; } = null!;
        public string EntityType { get; set; } = null!;
        public long? EntityId { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
