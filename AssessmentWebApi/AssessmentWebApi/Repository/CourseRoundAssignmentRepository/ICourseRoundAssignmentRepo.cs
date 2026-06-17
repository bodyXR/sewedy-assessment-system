using AssessmentWebApi.Dto_s.CourseRoundAssignmentDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;

namespace AssessmentWebApi.Repository.CourseRoundAssignmentRepository
{
    public interface ICourseRoundAssignmentRepo : IGenericRepo<CourseRoundAssignment>
    {
        /// <summary>Returns all assignments, optionally filtered by competency (courseId).</summary>
        Task<ICollection<CourseRoundAssignmentResDto>> GetAll(long? courseId = null);

        /// <summary>Returns a single assignment by ID.</summary>
        new Task<CourseRoundAssignmentResDto?> GetById(long id);

        /// <summary>Creates a new assignment linked to a competency (Course).</summary>
        Task<CourseRoundAssignmentResDto> Create(CourseRoundAssignmentReqDto request);

        /// <summary>Partially updates an assignment.</summary>
        Task<CourseRoundAssignmentResDto> Update(long id, CourseRoundAssignmentUpdateDto request);

        /// <summary>Deletes an assignment by ID.</summary>
        Task Delete(long id);
    }
}
