using AssessmentWebApi.Dto_s.EngineerDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;

namespace AssessmentWebApi.Repository.EngineerRepository
{
    public interface IEngineerRepo : IGenericRepo<Account>
    {
        /// <summary>Returns all accounts with Role = "Engineer".</summary>
        Task<ICollection<EngineerResDto>> GetAllEngineers();
    }
}
