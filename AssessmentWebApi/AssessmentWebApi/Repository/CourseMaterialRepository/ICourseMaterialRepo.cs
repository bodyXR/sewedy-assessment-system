using AssessmentWebApi.Dto_s.CourseMaterialDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;

namespace AssessmentWebApi.Repository.CourseMaterialRepository
{
    public interface ICourseMaterialRepo : IGenericRepo<CourseMaterial>
    {
        /// <summary>Returns all tasks, optionally filtered by competency (courseId).</summary>
        Task<ICollection<CourseMaterialResDto>> GetAll(long? courseId = null);

        /// <summary>Returns a single task by ID.</summary>
        new Task<CourseMaterialResDto?> GetById(long id);

        /// <summary>Creates a new task linked to an assessment.</summary>
        Task<CourseMaterialResDto> Create(CourseMaterialReqDto request);

        /// <summary>Partially updates a task.</summary>
        Task<CourseMaterialResDto> Update(long id, CourseMaterialUpdateDto request);

        /// <summary>Deletes a task by ID.</summary>
        Task Delete(long id);
    }
}
