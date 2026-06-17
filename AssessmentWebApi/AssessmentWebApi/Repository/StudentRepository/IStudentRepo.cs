using AssessmentWebApi.Dto_s.AccountDto_s;
using AssessmentWebApi.Dto_s.StudentDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;
namespace AssessmentWebApi.Repository.StudentRepository
{
    public interface IStudentRepo : IGenericRepo<Account>
    {
        /// <summary>Returns all students with basic info.</summary>
        new Task<ICollection<AccountResDto>> GetAll();

        /// <summary>Returns a single student by their account ID.</summary>
        new Task<StudentResDto?> GetById(long id);

        /// <summary>Filters students by class name (case-insensitive).</summary>
        Task<ICollection<StudentResDto>> FilterByClass(string className);

        /// <summary>
        /// Filters students by competency (Course title). A competency maps to a Course;
        /// students are found via: Course → CourseRound (assessment cycle)
        /// → CourseRoundAssignment (task) → CourseRoundAssignmentSubmission (student submission).
        /// Accepts either the course title (partial, case-insensitive) or a numeric course ID.
        /// </summary>
        Task<ICollection<StudentResDto>> FilterByCompetency(string competency);

        /// <summary>
        /// Returns students assigned to a specific assessor (instructor) via
        /// CourseRoundInstructor → CourseRound → CourseRoundAssignmentSubmission.
        /// </summary>
        Task<ICollection<StudentResDto>> GetByAssessor(long assessorAccountId);

        /// <summary>
        /// Filters students by trial status on their CourseRound
        /// (CourseRound.TrialStatusId maps to a Status record).
        /// </summary>
        Task<ICollection<StudentResDto>> FilterByTrial(string trialStatusName);

        /// <summary>
        /// Filters students by assessment status name — "passed" or "not passed".
        /// Status IDs 70 = Passed, 71 = Not Passed.
        /// </summary>
        Task<ICollection<StudentResDto>> GetByStatus(string status);

        /// <summary>
        /// Enrolls one or more students into a competency (Course) by finding the
        /// active CourseRound and creating pending submission placeholders for every
        /// task (CourseRoundAssignment) in that round.
        /// </summary>
        Task<EnrollStudentResDto> EnrollStudents(EnrollStudentReqDto request);

        /// <summary>
        /// Combined filter: class name + competency (course title/ID) + status (passed/not passed).
        /// All three parameters are optional — omit any to skip that filter.
        /// </summary>
        Task<ICollection<StudentResDto>> FilterByClassCompetencyStatus(
            string? className,
            string? competency,
            string? status);

        /// <summary>
        /// Filters students by grade name/ID and/or class name.
        /// Both parameters are optional — pass either one or both.
        /// Grade → TblClass → StudentExtension → Account.
        /// </summary>
        Task<ICollection<StudentResDto>> FilterByGradeAndClass(
            string? grade,
            string? className);
    }
}
