using AssessmentWebApi.Dto_s.CourseDto_s;
using AssessmentWebApi.Repository.CourseRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseRepo _repo;

        public CoursesController(ICourseRepo repo)
        {
            _repo = repo;
        }

        // GET /api/courses
        [HttpGet]
        public async Task<IActionResult> GetAllCourses()
        {
            var courses = await _repo.GetAllCourses();
            return Ok(courses);
        }

        // GET /api/courses/{id}
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var course = await _repo.GetById(id);
            if (course is null)
                return NotFound(new { message = $"Course {id} not found." });
            return Ok(course);
        }

        // GET /api/courses/filter/grade?grade=Software
        [HttpGet("filter/grade")]
        public async Task<IActionResult> FilterByGrade([FromQuery] string grade)
        {
            if (string.IsNullOrWhiteSpace(grade))
                return BadRequest(new { message = "grade query parameter is required." });

            var courses = await _repo.FilterByGrade(grade);

            if (!courses.Any())
                return NotFound(new { message = $"No assessment courses found for grade '{grade}'." });

            return Ok(courses);
        }

        // POST /api/courses
        // {
        //   "title": "Network Fundamentals",
        //   "description": "...",
        //   "durationHours": 35,
        //   "levelStatusId": 1
        // }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CourseReqDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { message = "Title is required." });

            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest(new { message = "Description is required." });

            try
            {
                var result = await _repo.Create(request);
                return StatusCode(201, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/courses/{id}
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] CourseUpdateDto request)
        {
            try
            {
                var result = await _repo.Update(id, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // DELETE /api/courses/{id}
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                await _repo.Delete(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
