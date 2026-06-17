using AssessmentWebApi.Dto_s.CourseRoundAssignmentDto_s;
using AssessmentWebApi.Repository.CourseRoundAssignmentRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseRoundAssignmentController : ControllerBase
    {
        private readonly ICourseRoundAssignmentRepo _repo;

        public CourseRoundAssignmentController(ICourseRoundAssignmentRepo repo)
        {
            _repo = repo;
        }

        // GET /api/courseroundassignment
        // GET /api/courseroundassignment?courseId=3
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] long? courseId)
        {
            var assignments = await _repo.GetAll(courseId);
            return Ok(assignments);
        }

        // GET /api/courseroundassignment/{id}
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var assignment = await _repo.GetById(id);
            if (assignment is null)
                return NotFound(new { message = $"Assignment {id} not found." });
            return Ok(assignment);
        }

        // POST /api/courseroundassignment
        // {
        //   "title": "Network Design Task",
        //   "description": "...",
        //   "assignmentLink": "https://...",
        //   "deadline": "2026-08-01T00:00:00",
        //   "totalGrade": 100,
        //   "courseId": 3,
        //   "instructorId": 101,
        //   "courseMaterialId": 5
        // }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CourseRoundAssignmentReqDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { message = "Title is required." });

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

        // PUT /api/courseroundassignment/{id}
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] CourseRoundAssignmentUpdateDto request)
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

        // DELETE /api/courseroundassignment/{id}
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
