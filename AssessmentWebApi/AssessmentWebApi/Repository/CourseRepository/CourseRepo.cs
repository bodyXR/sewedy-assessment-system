using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.CourseDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Repository.CourseRepository
{
    public class CourseRepo : GenericRepo<Course>, ICourseRepo
    {
        public CourseRepo(AppDbContext context) : base(context) { }

        // ─────────────────────────────────────────────────────────────
        // Shared projection
        // ─────────────────────────────────────────────────────────────
        private async Task<ICollection<CourseResDto>> Project(IQueryable<Course> query)
        {
            return await (
                from c in query
                join s in _context.Statuses
                    on c.LevelStatusId equals s.Id into sJoin
                from s in sJoin.DefaultIfEmpty()
                select new CourseResDto
                {
                    Id             = c.Id,
                    Title          = c.Title,
                    Description    = c.Description,
                    DurationHours  = c.DurationHours,
                    LevelStatusId  = c.LevelStatusId,
                    LevelName      = s != null ? s.StatusName : null,
                    BusinessEntity = c.BusinessEntity
                }
            ).ToListAsync();
        }

        // ─────────────────────────────────────────────────────────────
        // Get all courses scoped to Assessment
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<CourseResDto>> GetAllCourses()
        {
            var query = _context.Courses
                .Where(c => c.BusinessEntity == "Assessment");

            return await Project(query);
        }

        // ─────────────────────────────────────────────────────────────
        // Get by ID
        // ─────────────────────────────────────────────────────────────
        public async new Task<CourseResDto?> GetById(long id)
        {
            var query = _context.Courses.Where(c => c.Id == id);
            var result = await Project(query);
            return result.FirstOrDefault();
        }

        // ─────────────────────────────────────────────────────────────
        // Filter by grade
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<CourseResDto>> FilterByGrade(string grade)
        {
            return await GetAllCourses();
        }

        // ─────────────────────────────────────────────────────────────
        // Create
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseResDto> Create(CourseReqDto request)
        {
            if (request.LevelStatusId.HasValue)
            {
                var status = await _context.Statuses
                    .FirstOrDefaultAsync(s => s.Id == request.LevelStatusId.Value);

                if (status is null)
                    throw new InvalidOperationException(
                        $"Status {request.LevelStatusId} not found.");
            }

            var course = new Course
            {
                Title          = request.Title,
                Description    = request.Description,
                DurationHours  = request.DurationHours,
                LevelStatusId  = request.LevelStatusId,
                BusinessEntity = request.BusinessEntity ?? "Assessment"
            };

            await _context.Courses.AddAsync(course);
            await _context.SaveChangesAsync();

            return (await GetById(course.Id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Update — partial, only non-null fields applied
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseResDto> Update(long id, CourseUpdateDto request)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course is null)
                throw new InvalidOperationException($"Course {id} not found.");

            if (request.Title is not null)          course.Title          = request.Title;
            if (request.Description is not null)    course.Description    = request.Description;
            if (request.DurationHours.HasValue)     course.DurationHours  = request.DurationHours;
            if (request.LevelStatusId.HasValue)     course.LevelStatusId  = request.LevelStatusId;
            if (request.BusinessEntity is not null) course.BusinessEntity = request.BusinessEntity;

            await _context.SaveChangesAsync();

            return (await GetById(id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Delete
        // ─────────────────────────────────────────────────────────────
        public async Task Delete(long id)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course is null)
                throw new InvalidOperationException($"Course {id} not found.");

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
        }
    }
}
