using AssessmentWebApi.Dto_s.CourseRoundInstructorDto_s;

namespace AssessmentWebApi.Repository.CourseRoundInstructorRepository
{
    public interface ICourseRoundInstructorRepo
    {
        Task<IEnumerable<CourseRoundInstructorResponseDto>> GetAllAsync();
        Task<IEnumerable<CourseRoundInstructorResponseDto>> GetByCourseRoundAsync(long courseRoundId);
        Task<IEnumerable<CourseRoundInstructorResponseDto>> GetByInstructorAsync(long accountId);
        Task<CourseRoundInstructorResponseDto> CreateAsync(CourseRoundInstructorRequestDto request);
        Task<CourseRoundInstructorResponseDto?> UpdateRoleAsync(long id, long roleId);
        Task<bool> DeleteAsync(long id);
    }
}
