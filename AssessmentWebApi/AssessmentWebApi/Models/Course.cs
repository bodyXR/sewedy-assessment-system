using System;
using System.Collections.Generic;

namespace AssessmentWebApi.Models;

public partial class Course
{
    public long Id { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public long? LevelStatusId { get; set; }

    public long? DurationHours { get; set; }

    public string? BusinessEntity { get; set; }

    public virtual Status? LevelStatus { get; set; }

    public virtual ICollection<CourseMaterial> CourseMaterials { get; set; } = new List<CourseMaterial>();

    public virtual ICollection<CourseRoundAssignment> CourseRoundAssignments { get; set; } = new List<CourseRoundAssignment>();
}
