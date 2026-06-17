using AssessmentWebApi.Dto_s.CourseRoundInstructorDto_s;
using AssessmentWebApi.Repository.CourseRoundInstructorRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseRoundInstructorsController : ControllerBase
    {
        private readonly ICourseRoundInstructorRepo _repo;

        public CourseRoundInstructorsController(ICourseRoundInstructorRepo repo)
        {
            _repo = repo;
        }

        // GET /api/courseroundinstructors
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _repo.GetAllAsync();
            return Ok(result);
        }

        // GET /api/courseroundinstructors/courseround/{courseRoundId}
        [HttpGet("courseround/{courseRoundId}")]
        public async Task<IActionResult> GetByCourseRound(long courseRoundId)
        {
            var result = await _repo.GetByCourseRoundAsync(courseRoundId);
            return Ok(result);
        }

        // GET /api/courseroundinstructors/instructor/{accountId}
        [HttpGet("instructor/{accountId}")]
        public async Task<IActionResult> GetByInstructor(long accountId)
        {
            var result = await _repo.GetByInstructorAsync(accountId);
            return Ok(result);
        }

        // POST /api/courseroundinstructors
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CourseRoundInstructorRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _repo.CreateAsync(request);
                return StatusCode(201, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/courseroundinstructors/{id}/role
        // { "roleId": 5 }
        [HttpPut("{id:long}/role")]
        public async Task<IActionResult> UpdateRole(long id, [FromBody] UpdateRoleDto request)
        {
            try
            {
                var result = await _repo.UpdateRoleAsync(id, request.RoleId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/courseroundinstructors/{id}
        [HttpDelete("{id}")]        public async Task<IActionResult> Delete(long id)
        {
            var success = await _repo.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = $"Instructor assignment with ID {id} not found" });

            return NoContent();
        }
    }
}
