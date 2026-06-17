using AssessmentWebApi.Data;
using Microsoft.EntityFrameworkCore;

namespace Holistic_Training.Repository.GenericRepo
{
    public class GenericRepo<T> : IGenericRepo<T> where T : class
    {
        protected readonly AppDbContext _context;
        public GenericRepo(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddEntity(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
        }

        public async Task<ICollection<T>> GetAll()
        {
            return await _context.Set<T>().ToListAsync();
        }

        public async Task<T> GetById(long id)
        {
            return await _context.Set<T>().FindAsync(id);
        }

        public async Task RemoveEntity(long id)
        {
            var entity = await GetById(id);
            _context.Set<T>().Remove(entity);
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateEntity(T entity)
        {
            //var entity = await GetById(id);
            _context.Set<T>().Update(entity);
        }
    }
}
