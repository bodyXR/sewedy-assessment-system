using AssessmentWebApi.Dto_s.CourseRoundDto_s;
using AssessmentWebApi.Repository.CourseRoundRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseRoundController : ControllerBase
    {
        private readonly ICourseRoundRepo _repo;

        public CourseRoundController(ICourseRoundRepo repo)
        {
            _repo = repo;
        }

        // GET /api/courseround
        // GET /api/courseround?courseId=3
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] long? courseId)
        {
            var rounds = await _repo.GetAllRounds(courseId);
            return Ok(rounds);
        }

        // GET /api/courseround/{id}
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var round = await _repo.GetRoundById(id);
            if (round is null)
                return NotFound(new { message = $"Assessment {id} not found." });
            return Ok(round);
        }

        // POST /api/courseround
        // {
        //   "courseId": 3,
        //   "roundNumber": 1,
        //   "startDate": "2026-09-01",
        //   "endDate": "2027-01-15",
        //   "maxStudents": 30,
        //   "statusId": 1
        // }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CourseRoundReqDto request)
        {
            try
            {
                var result = await _repo.CreateRound(request);
                return StatusCode(201, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/courseround/{id}
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] CourseRoundUpdateDto request)
        {
            try
            {
                var result = await _repo.UpdateRound(id, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // DELETE /api/courseround/{id}
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                await _repo.DeleteRound(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
