using AssessmentWebApi.Dto_s.CourseDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;

namespace AssessmentWebApi.Repository.CourseRepository
{
    public interface ICourseRepo : IGenericRepo<Course>
    {
        /// <summary>Returns all assessment courses (BusinessEntity = 'assessment').</summary>
        Task<ICollection<CourseResDto>> GetAllCourses();

        /// <summary>Returns a single course by ID.</summary>
        new Task<CourseResDto?> GetById(long id);

        /// <summary>Filters assessment courses by grade name or grade ID.</summary>
        Task<ICollection<CourseResDto>> FilterByGrade(string grade);

        /// <summary>Creates a new course.</summary>
        Task<CourseResDto> Create(CourseReqDto request);

        /// <summary>Partially updates a course.</summary>
        Task<CourseResDto> Update(long id, CourseUpdateDto request);

        /// <summary>Deletes a course by ID.</summary>
        Task Delete(long id);
    }
}
