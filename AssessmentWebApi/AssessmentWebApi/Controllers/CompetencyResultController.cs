using AssessmentWebApi.Dto_s.CompetencyResultDto_s;
using AssessmentWebApi.Repository.CompetencyResultRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompetencyResultController : ControllerBase
    {
        private readonly ICompetencyResultRepo _repo;

        public CompetencyResultController(ICompetencyResultRepo repo)
        {
            _repo = repo;
        }

        // GET /api/competencyresult
        // GET /api/competencyresult?studentId=5
        // GET /api/competencyresult?courseId=3
        // GET /api/competencyresult?courseRoundId=10
        // GET /api/competencyresult?studentId=5&courseId=3          ← student history in one competency
        // GET /api/competencyresult?courseId=3&courseRoundId=10     ← all students in one cycle
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] long? studentId,
            [FromQuery] long? courseId,
            [FromQuery] long? courseRoundId)
        {
            var results = await _repo.GetAll(studentId, courseId, courseRoundId);
            return Ok(results);
        }

        // GET /api/competencyresult/{id}
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _repo.GetById(id);
            if (result is null)
                return NotFound(new { message = $"CompetencyResult {id} not found." });
            return Ok(result);
        }

        // POST /api/competencyresult
        // {
        //   "studentId": 5,
        //   "courseId": 3,
        //   "courseRoundId": 10,
        //   "resultStatusId": 38,       ← Pass status ID
        //   "assessorId": 101,
        //   "notes": "Strong performance in all tasks.",
        //   "totalScore": null,         ← omit to auto-calculate from submissions
        //   "maxScore": null            ← omit to auto-calculate from assignments
        // }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CompetencyResultReqDto request)
        {
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

        // PUT /api/competencyresult/{id}
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] CompetencyResultUpdateDto request)
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

        // DELETE /api/competencyresult/{id}
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
