using AssessmentWebApi.Dto_s.CourseMaterialDto_s;
using AssessmentWebApi.Repository.CourseMaterialRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseMaterialController : ControllerBase
    {
        private readonly ICourseMaterialRepo _repo;

        public CourseMaterialController(ICourseMaterialRepo repo)
        {
            _repo = repo;
        }

        // GET /api/coursematerial
        // GET /api/coursematerial?courseId=3
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] long? courseId)
        {
            var materials = await _repo.GetAll(courseId);
            return Ok(materials);
        }

        // GET /api/coursematerial/{id}
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var material = await _repo.GetById(id);
            if (material is null)
                return NotFound(new { message = $"Task {id} not found." });
            return Ok(material);
        }

        // POST /api/coursematerial
        // {
        //   "title": "Network Cabling",
        //   "description": "...",
        //   "link": "https://...",
        //   "courseId": 3,
        //   "weekId": 2,
        //   "createdByAccountId": 101
        // }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CourseMaterialReqDto request)
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

        // PUT /api/coursematerial/{id}
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] CourseMaterialUpdateDto request)
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

        // DELETE /api/coursematerial/{id}
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
