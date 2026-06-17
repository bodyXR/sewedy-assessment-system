using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.CourseMaterialDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Repository.CourseMaterialRepository
{
    public class CourseMaterialRepo : GenericRepo<CourseMaterial>, ICourseMaterialRepo
    {
        public CourseMaterialRepo(AppDbContext context) : base(context) { }

        // ─────────────────────────────────────────────────────────────
        // Shared projection — two-step to avoid chained LEFT JOIN issues
        // ─────────────────────────────────────────────────────────────
        private async Task<ICollection<CourseMaterialResDto>> Project(
            IQueryable<CourseMaterial> query)
        {
            var rows = await (
                from m in query
                join c in _context.Courses
                    on m.CourseId equals c.Id into cJoin
                from c in cJoin.DefaultIfEmpty()
                join s in _context.Statuses
                    on m.StatusId equals s.Id into sJoin
                from s in sJoin.DefaultIfEmpty()
                select new CourseMaterialResDto
                {
                    Id                = m.Id,
                    Title             = m.Title,
                    Description       = m.Description,
                    Link              = m.Link,
                    CourseId          = m.CourseId,
                    CourseName        = c != null ? c.Title : null,
                    StatusId          = m.StatusId,
                    StatusName        = s != null ? s.StatusName : null,
                    WeekId            = m.WeekId,
                    ParentMaterialId  = m.ParentMaterialId
                }
            ).ToListAsync();

            return rows;
        }

        // ─────────────────────────────────────────────────────────────
        // Get all tasks — optionally filtered by competency (courseId)
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<CourseMaterialResDto>> GetAll(long? courseId = null)
        {
            var query = _context.CourseMaterials.AsQueryable();

            if (courseId.HasValue)
                query = query.Where(m => m.CourseId == courseId.Value);

            return await Project(query);
        }

        // ─────────────────────────────────────────────────────────────
        // Get by ID
        // ─────────────────────────────────────────────────────────────
        public async new Task<CourseMaterialResDto?> GetById(long id)
        {
            var query = _context.CourseMaterials.Where(m => m.Id == id);
            var result = await Project(query);
            return result.FirstOrDefault();
        }

        // ─────────────────────────────────────────────────────────────
        // Create
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseMaterialResDto> Create(CourseMaterialReqDto request)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId);

            if (course is null)
                throw new InvalidOperationException(
                    $"Competency (Course) {request.CourseId} not found.");

            var material = new CourseMaterial
            {
                Title              = request.Title,
                Description        = request.Description,
                Link               = request.Link,
                CourseId           = request.CourseId,
                WeekId             = request.WeekId,
                ParentMaterialId   = request.ParentMaterialId,
                CreatedByAccountId = request.CreatedByAccountId,
                StatusId           = 1
            };

            await _context.CourseMaterials.AddAsync(material);
            await _context.SaveChangesAsync();

            return (await GetById(material.Id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Update — partial, only non-null fields applied
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseMaterialResDto> Update(long id, CourseMaterialUpdateDto request)
        {
            var material = await _context.CourseMaterials
                .FirstOrDefaultAsync(m => m.Id == id);

            if (material is null)
                throw new InvalidOperationException($"Task (CourseMaterial) {id} not found.");

            if (request.Title is not null)       material.Title       = request.Title;
            if (request.Description is not null) material.Description = request.Description;
            if (request.Link is not null)        material.Link        = request.Link;
            if (request.WeekId.HasValue)         material.WeekId      = request.WeekId;
            if (request.ParentMaterialId.HasValue) material.ParentMaterialId = request.ParentMaterialId;
            if (request.StatusId.HasValue)       material.StatusId    = request.StatusId;

            await _context.SaveChangesAsync();

            return (await GetById(id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Delete
        // ─────────────────────────────────────────────────────────────
        public async Task Delete(long id)
        {
            var material = await _context.CourseMaterials
                .FirstOrDefaultAsync(m => m.Id == id);

            if (material is null)
                throw new InvalidOperationException($"Task (CourseMaterial) {id} not found.");

            _context.CourseMaterials.Remove(material);
            await _context.SaveChangesAsync();
        }
    }
}
