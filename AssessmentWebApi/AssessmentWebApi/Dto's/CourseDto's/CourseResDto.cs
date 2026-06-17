namespace AssessmentWebApi.Dto_s.CourseDto_s
{
    public class CourseResDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public long? DurationHours { get; set; }
        public long? LevelStatusId { get; set; }
        public string? LevelName { get; set; }
        public string? BusinessEntity { get; set; }
    }

    public class CourseReqDto
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public long? DurationHours { get; set; }
        public long? LevelStatusId { get; set; }

        /// <summary>Business entity tag — set to 'Assessment' for this project.</summary>
        public string? BusinessEntity { get; set; }
    }

    public class CourseUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public long? DurationHours { get; set; }
        public long? LevelStatusId { get; set; }
        public string? BusinessEntity { get; set; }
    }
}
