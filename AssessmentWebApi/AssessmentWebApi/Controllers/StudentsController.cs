using AssessmentWebApi.Dto_s.StudentDto_s;
using AssessmentWebApi.Repository.StudentRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentRepo _repo;

        public StudentsController(IStudentRepo repo)
        {
            _repo = repo;
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/students
        // Returns all students (basic info DTO).
        // ─────────────────────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _repo.GetAll();
            return Ok(students);
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/students/{id}
        // Returns a single student by account ID.
        // ─────────────────────────────────────────────────────────────
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetStudentById(long id)
        {
            var student = await _repo.GetById(id);

            if (student is null)
                return NotFound(new { message = $"Student with ID {id} was not found." });

            return Ok(student);
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/students/filter/class?className=SW1
        // Filters students by class name.
        // ─────────────────────────────────────────────────────────────
        [HttpGet("filter/class")]
        public async Task<IActionResult> FilterByClass([FromQuery] string className)
        {
            if (string.IsNullOrWhiteSpace(className))
                return BadRequest(new { message = "className query parameter is required." });

            var students = await _repo.FilterByClass(className);
            return Ok(students);
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/students/filter/competency?competency=NetworkInfra
        // GET /api/students/filter/competency?competency=5   (by course ID)
        // Filters students by competency (Course with BusinessEntity='assessment').
        // ─────────────────────────────────────────────────────────────
        [HttpGet("filter/competency")]
        public async Task<IActionResult> FilterByCompetency([FromQuery] string competency)
        {
            if (string.IsNullOrWhiteSpace(competency))
                return BadRequest(new { message = "competency query parameter is required." });

            var students = await _repo.FilterByCompetency(competency);

            if (!students.Any())
                return NotFound(new
                {
                    message = "No students found for the given competency.",
                    hint = "Make sure: (1) a Course with BusinessEntity='assessment' matches the title/ID, " +
                           "(2) that Course has at least one CourseRound, " +
                           "(3) students have CourseRoundAssignmentSubmissions in that round."
                });

            return Ok(students);
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/students/filter/assessor/{assessorId}
        // Returns students assigned to a specific assessor (instructor).
        // ─────────────────────────────────────────────────────────────
        [HttpGet("filter/assessor/{assessorId:long}")]
        public async Task<IActionResult> GetByAssessor(long assessorId)
        {
            var students = await _repo.GetByAssessor(assessorId);
            return Ok(students);
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/students/filter/trial?trialStatus=Trial
        // Filters students by the trial status of their course round.
        // ─────────────────────────────────────────────────────────────
        [HttpGet("filter/trial")]
        public async Task<IActionResult> FilterByTrial([FromQuery] string trialStatus)
        {
            if (string.IsNullOrWhiteSpace(trialStatus))
                return BadRequest(new { message = "trialStatus query parameter is required." });

            var students = await _repo.FilterByTrial(trialStatus);
            return Ok(students);
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/students/filter/status?status=passed
        // Filters students by assessment status (passed / not passed).
        // ─────────────────────────────────────────────────────────────
        [HttpGet("filter/status")]
        public async Task<IActionResult> FilterByStatus([FromQuery] string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return BadRequest(new { message = "status query parameter is required." });

            var students = await _repo.GetByStatus(status);
            return Ok(students);
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/students/filter?className=SW1&competency=Network&status=passed
        // Combined filter — all three params are optional.
        // Mix and match any combination:
        //   ?className=SW1
        //   ?competency=Network&status=passed
        //   ?className=SW1&competency=Network&status=passed
        // ─────────────────────────────────────────────────────────────
        [HttpGet("filter")]
        public async Task<IActionResult> FilterCombined(
            [FromQuery] string? className,
            [FromQuery] string? competency,
            [FromQuery] string? status)
        {
            if (string.IsNullOrWhiteSpace(className) &&
                string.IsNullOrWhiteSpace(competency) &&
                string.IsNullOrWhiteSpace(status))
                return BadRequest(new
                {
                    message = "Provide at least one filter: className, competency, or status."
                });

            var students = await _repo.FilterByClassCompetencyStatus(className, competency, status);
            return Ok(students);
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/students/filter/grade-class?grade=Software&className=SW1
        // Filter students by grade and/or class — both are optional.
        // Examples:
        //   ?grade=Software          → all students in that grade
        //   ?className=SW1           → all students in that class
        //   ?grade=Software&className=SW1 → students in that grade AND class
        // ─────────────────────────────────────────────────────────────
        [HttpGet("filter/grade-class")]
        public async Task<IActionResult> FilterByGradeAndClass(
            [FromQuery] string? grade,
            [FromQuery] string? className)
        {
            if (string.IsNullOrWhiteSpace(grade) && string.IsNullOrWhiteSpace(className))
                return BadRequest(new { message = "Provide at least one of: grade, className." });

            var students = await _repo.FilterByGradeAndClass(grade, className);
            return Ok(students);
        }

        // ─────────────────────────────────────────────────────────────
        // POST /api/students/enroll
        // Enrolls one or more students into a competency (Course).
        //
        // Body example:
        // {
        //   "courseId": 3,
        //   "courseRoundId": 7,        ← optional; omit to use latest active round
        //   "studentIds": [101, 102, 103]
        // }
        //
        // The system creates a pending submission placeholder for every
        // task (CourseRoundAssignment) in the round per student.
        // Already-enrolled students are reported but not duplicated.
        // ─────────────────────────────────────────────────────────────
        [HttpPost("enroll")]
        public async Task<IActionResult> EnrollStudents([FromBody] EnrollStudentReqDto request)
        {
            if (request.StudentIds is null || !request.StudentIds.Any())
                return BadRequest(new { message = "At least one studentId is required." });

            try
            {
                var result = await _repo.EnrollStudents(request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
