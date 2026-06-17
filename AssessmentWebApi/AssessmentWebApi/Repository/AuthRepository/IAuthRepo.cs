using AssessmentWebApi.Dto_s.AuthDto_s;

namespace AssessmentWebApi.Repository.AuthRepository
{
    public interface IAuthRepo
    {
        /// <summary>
        /// Validates credentials and returns a session token.
        /// Works for engineers (null role) and Control.
        /// Engineers get RoleName = "Awaiting role assignment" until Control assigns them.
        /// </summary>
        Task<LoginResDto> Login(LoginReqDto request);

        /// <summary>
        /// Registers a new engineer account with no role.
        /// Role (Assessor / Verifier) is assigned later by Control via CourseRoundInstructor.
        /// </summary>
        Task<LoginResDto> SignupEngineer(SignupReqDto request);

        /// <summary>
        /// Registers a new Control account with the Control role pre-assigned.
        /// </summary>
        Task<LoginResDto> SignupControl(SignupReqDto request);
    }
}
