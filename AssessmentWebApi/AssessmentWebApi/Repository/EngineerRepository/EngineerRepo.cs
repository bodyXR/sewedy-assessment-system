using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.EngineerDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Repository.EngineerRepository
{
    public class EngineerRepo : GenericRepo<Account>, IEngineerRepo
    {
        public EngineerRepo(AppDbContext context) : base(context) { }

        public async Task<ICollection<EngineerResDto>> GetAllEngineers()
        {
            return await _context.Accounts
                .Include(a => a.Role)
                .Include(a => a.Status)
                .Where(a =>
                    a.RoleId == null ||
                    (a.Role != null && a.Role.BusinessEntity == "Assessment" &&
                     (a.Role.RoleName == "Assessor" || a.Role.RoleName == "Verifier")))
                .Select(a => new EngineerResDto
                {
                    Id         = a.Id,
                    NationalId = a.NationalId,
                    Email      = a.Email,
                    Phone      = a.Phone,
                    FullNameEn = a.FullNameEn,
                    FullNameAr = a.FullNameAr,
                    Status     = a.Status.StatusName,
                    RoleName   = a.Role != null ? a.Role.RoleName : "Awaiting role assignment",
                    IsActive   = a.IsActive,
                    CreatedAt  = a.CreatedAt
                })
                .ToListAsync();
        }
    }
}
