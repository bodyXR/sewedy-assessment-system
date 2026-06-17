using System;
using System.Collections.Generic;

namespace AssessmentWebApi.Models;

public partial class Week
{
    public string? WeekTitle { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? BusinessEntityName { get; set; }

    public long Id { get; set; }
}
