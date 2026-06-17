namespace Holistic_Training.Repository.GenericRepo
{
    public interface IGenericRepo<T> where T : class 
    {
        public Task<ICollection<T>> GetAll();
        public Task AddEntity(T entity);
        public Task<T> GetById(long id);
        public Task UpdateEntity(T entity);
        public Task RemoveEntity(long id);
        public Task Save();
    }
}
