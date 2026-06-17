using AssessmentWebApi.Repository.EngineerRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EngineersController : ControllerBase
    {
        private readonly IEngineerRepo _repo;

        public EngineersController(IEngineerRepo repo)
        {
            _repo = repo;
        }

        // GET /api/engineers
        [HttpGet]
        public async Task<IActionResult> GetAllEngineers()
        {
            var engineers = await _repo.GetAllEngineers();
            return Ok(engineers);
        }
    }
}
