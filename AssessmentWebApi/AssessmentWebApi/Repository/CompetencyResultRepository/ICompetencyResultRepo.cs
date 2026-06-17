using AssessmentWebApi.Dto_s.CompetencyResultDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;

namespace AssessmentWebApi.Repository.CompetencyResultRepository
{
    public interface ICompetencyResultRepo : IGenericRepo<CompetencyResult>
    {
        /// <summary>Returns all results, optionally filtered by student, course, or round.</summary>
        Task<ICollection<CompetencyResultResDto>> GetAll(long? studentId = null, long? courseId = null, long? courseRoundId = null);

        /// <summary>Returns a single result by ID.</summary>
        new Task<CompetencyResultResDto?> GetById(long id);

        /// <summary>
        /// Creates a result. If TotalScore/MaxScore are not provided,
        /// auto-calculates them from CourseRoundAssignmentSubmissions.
        /// </summary>
        Task<CompetencyResultResDto> Create(CompetencyResultReqDto request);

        /// <summary>Partially updates a result.</summary>
        Task<CompetencyResultResDto> Update(long id, CompetencyResultUpdateDto request);

        /// <summary>Deletes a result by ID.</summary>
        Task Delete(long id);
    }
}
