namespace AssessmentWebApi.Dto_s.CourseMaterialDto_s
{
    /// <summary>Task response DTO.</summary>
    public class CourseMaterialResDto
    {
        public long Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Link { get; set; }
        public long? CourseId { get; set; }
        public string? CourseName { get; set; }
        public long? StatusId { get; set; }
        public string? StatusName { get; set; }
        public long? WeekId { get; set; }
        public long? ParentMaterialId { get; set; }
    }

    /// <summary>Request body for creating a task.</summary>
    public class CourseMaterialReqDto
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Link { get; set; }

        /// <summary>The competency (Course) this task belongs to.</summary>
        public long CourseId { get; set; }

        public long? WeekId { get; set; }
        public long? ParentMaterialId { get; set; }
        public long? CreatedByAccountId { get; set; }
    }

    /// <summary>Request body for updating a task (all fields optional).</summary>
    public class CourseMaterialUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Link { get; set; }
        public long? WeekId { get; set; }
        public long? ParentMaterialId { get; set; }
        public long? StatusId { get; set; }
    }
}
