using AssessmentWebApi.Dto_s.CourseRoundDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;

namespace AssessmentWebApi.Repository.CourseRoundRepository
{
    public interface ICourseRoundRepo : IGenericRepo<CourseRound>
    {
        /// <summary>Returns all assessments, optionally filtered by competency (courseId).</summary>
        Task<ICollection<CourseRoundResDto>> GetAllRounds(long? courseId = null);

        /// <summary>Returns a single assessment by ID.</summary>
        Task<CourseRoundResDto?> GetRoundById(long id);

        /// <summary>Creates a new assessment under a competency.</summary>
        Task<CourseRoundResDto> CreateRound(CourseRoundReqDto request);

        /// <summary>Partially updates an assessment.</summary>
        Task<CourseRoundResDto> UpdateRound(long id, CourseRoundUpdateDto request);

        /// <summary>Deletes an assessment by ID.</summary>
        Task DeleteRound(long id);
    }
}
