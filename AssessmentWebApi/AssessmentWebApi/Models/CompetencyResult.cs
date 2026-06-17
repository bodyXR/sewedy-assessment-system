using System;

namespace AssessmentWebApi.Models;

public partial class CompetencyResult
{
    public long Id { get; set; }

    public long StudentId { get; set; }

    public long CourseId { get; set; }

    public long CourseRoundId { get; set; }

    /// <summary>Sum of grades the student received across all submissions in this cycle.</summary>
    public decimal? TotalScore { get; set; }

    /// <summary>Sum of TotalGrade across all assignments in this cycle (the maximum possible).</summary>
    public decimal? MaxScore { get; set; }

    /// <summary>Pass / Not Pass — set by the assessor. 80% threshold recommended.</summary>
    public long ResultStatusId { get; set; }

    /// <summary>The assessor who finalized this result.</summary>
    public long AssessorId { get; set; }

    public string? Notes { get; set; }

    public DateTime GradedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Account Student { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
    public virtual CourseRound CourseRound { get; set; } = null!;
    public virtual Status ResultStatus { get; set; } = null!;
    public virtual Account Assessor { get; set; } = null!;
}
