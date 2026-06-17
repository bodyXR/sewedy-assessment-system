using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.CourseRoundAssignmentDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Repository.CourseRoundAssignmentRepository
{
    public class CourseRoundAssignmentRepo : GenericRepo<CourseRoundAssignment>, ICourseRoundAssignmentRepo
    {
        public CourseRoundAssignmentRepo(AppDbContext context) : base(context) { }

        // ─────────────────────────────────────────────────────────────
        // Shared projection
        // ─────────────────────────────────────────────────────────────
        private async Task<ICollection<CourseRoundAssignmentResDto>> Project(
            IQueryable<CourseRoundAssignment> query)
        {
            return await (
                from a in query
                join c in _context.Courses
                    on a.CourseId equals c.Id into cJoin
                from c in cJoin.DefaultIfEmpty()
                join acc in _context.Accounts
                    on a.InstructorId equals acc.Id into accJoin
                from acc in accJoin.DefaultIfEmpty()
                join m in _context.CourseMaterials
                    on a.CourseMaterialId equals m.Id into mJoin
                from m in mJoin.DefaultIfEmpty()
                join s in _context.Statuses
                    on a.StatusId equals s.Id into sJoin
                from s in sJoin.DefaultIfEmpty()
                select new CourseRoundAssignmentResDto
                {
                    Id              = a.Id,
                    Title           = a.Title,
                    Description     = a.Description,
                    AssignmentLink  = a.AssignmentLink,
                    Deadline        = a.Deadline,
                    TotalGrade      = a.TotalGrade,
                    CreatedAt       = a.CreatedAt,
                    CourseId        = a.CourseId,
                    CourseName      = c != null ? c.Title : null,
                    InstructorId    = a.InstructorId,
                    InstructorName  = acc != null ? acc.FullNameEn : null,
                    CourseMaterialId = a.CourseMaterialId,
                    TaskTitle       = m != null ? m.Title : null,
                    StatusId        = a.StatusId,
                    StatusName      = s != null ? s.StatusName : null
                }
            ).ToListAsync();
        }

        // ─────────────────────────────────────────────────────────────
        // Get all — optionally filtered by competency (courseId)
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<CourseRoundAssignmentResDto>> GetAll(long? courseId = null)
        {
            var query = _context.CourseRoundAssignments.AsQueryable();

            if (courseId.HasValue)
                query = query.Where(a => a.CourseId == courseId.Value);

            return await Project(query);
        }

        // ─────────────────────────────────────────────────────────────
        // Get by ID
        // ─────────────────────────────────────────────────────────────
        public async new Task<CourseRoundAssignmentResDto?> GetById(long id)
        {
            var query = _context.CourseRoundAssignments.Where(a => a.Id == id);
            var result = await Project(query);
            return result.FirstOrDefault();
        }

        // ─────────────────────────────────────────────────────────────
        // Create
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseRoundAssignmentResDto> Create(CourseRoundAssignmentReqDto request)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId);

            if (course is null)
                throw new InvalidOperationException(
                    $"Competency (Course) {request.CourseId} not found.");

            var instructor = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == request.InstructorId);

            if (instructor is null)
                throw new InvalidOperationException(
                    $"Instructor account {request.InstructorId} not found.");

            if (request.CourseMaterialId.HasValue)
            {
                var material = await _context.CourseMaterials
                    .FirstOrDefaultAsync(m => m.Id == request.CourseMaterialId.Value);

                if (material is null)
                    throw new InvalidOperationException(
                        $"Task (CourseMaterial) {request.CourseMaterialId} not found.");
            }

            var assignment = new CourseRoundAssignment
            {
                Title            = request.Title,
                Description      = request.Description,
                AssignmentLink   = request.AssignmentLink,
                Deadline         = request.Deadline,
                TotalGrade       = request.TotalGrade,
                CourseId         = request.CourseId,
                InstructorId     = request.InstructorId,
                CourseMaterialId = request.CourseMaterialId,
                CreatedAt        = DateTime.UtcNow,
                StatusId         = 1
            };

            await _context.CourseRoundAssignments.AddAsync(assignment);
            await _context.SaveChangesAsync();

            return (await GetById(assignment.Id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Update — partial, only non-null fields applied
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseRoundAssignmentResDto> Update(long id, CourseRoundAssignmentUpdateDto request)
        {
            var assignment = await _context.CourseRoundAssignments
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment is null)
                throw new InvalidOperationException($"Assignment {id} not found.");

            if (request.Title is not null)           assignment.Title           = request.Title;
            if (request.Description is not null)     assignment.Description     = request.Description;
            if (request.AssignmentLink is not null)  assignment.AssignmentLink  = request.AssignmentLink;
            if (request.Deadline.HasValue)           assignment.Deadline        = request.Deadline.Value;
            if (request.TotalGrade.HasValue)         assignment.TotalGrade      = request.TotalGrade.Value;
            if (request.StatusId.HasValue)           assignment.StatusId        = request.StatusId;
            if (request.CourseMaterialId.HasValue)   assignment.CourseMaterialId = request.CourseMaterialId;

            await _context.SaveChangesAsync();

            return (await GetById(id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Delete
        // ─────────────────────────────────────────────────────────────
        public async Task Delete(long id)
        {
            var assignment = await _context.CourseRoundAssignments
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment is null)
                throw new InvalidOperationException($"Assignment {id} not found.");

            _context.CourseRoundAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
        }
    }
}
