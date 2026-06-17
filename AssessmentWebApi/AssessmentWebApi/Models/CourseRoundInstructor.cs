using System;
using System.Collections.Generic;

namespace AssessmentWebApi.Models;

public partial class CourseRoundInstructor
{
    public long Id { get; set; }

    public long CourseRoundId { get; set; }

    public long InstructorAccountId { get; set; }

    /// <summary>Role assigned to this instructor for this cycle — Assessor or Verifier.</summary>
    public long? RoleId { get; set; }

    public DateOnly AssignedDate { get; set; }

    public virtual Account InstructorAccount { get; set; } = null!;

    public virtual Role? Role { get; set; }
}
