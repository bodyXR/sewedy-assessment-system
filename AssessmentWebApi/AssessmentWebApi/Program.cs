using AssessmentWebApi.Data;
using AssessmentWebApi.Repository.AuthRepository;
using AssessmentWebApi.Repository.CourseMaterialRepository;
using AssessmentWebApi.Repository.CourseRepository;
using AssessmentWebApi.Repository.CompetencyResultRepository;
using AssessmentWebApi.Repository.CourseRoundAssignmentRepository;
using AssessmentWebApi.Repository.CourseRoundInstructorRepository;
using AssessmentWebApi.Repository.DashboardRepository;
using AssessmentWebApi.Repository.CourseRoundRepository;
using AssessmentWebApi.Repository.EngineerRepository;
using AssessmentWebApi.Repository.StudentRepository;
using Holistic_Training.Repository.GenericRepo;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
                  "http://localhost:3000",
                  "http://assessmentproject.runasp.net")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	try
	{
		var context = services.GetRequiredService<AppDbContext>(); // Replace with your DbContext name
		context.Database.Migrate(); // This automatically executes missing migrations on MonsterASP
	}
	catch (Exception ex)
	{
		var logger = services.GetRequiredService<ILogger<Program>>();
		logger.LogError(ex, "An error occurred while migrating the database.");
	}
}

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Generic repository
builder.Services.AddScoped(typeof(IGenericRepo<>), typeof(GenericRepo<>));

// Feature repositories
builder.Services.AddScoped<IStudentRepo,        StudentRepo>();
builder.Services.AddScoped<IEngineerRepo,       EngineerRepo>();
builder.Services.AddScoped<ICourseRepo,         CourseRepo>();
builder.Services.AddScoped<IAuthRepo,           AuthRepo>();
builder.Services.AddScoped<ICourseMaterialRepo,           CourseMaterialRepo>();
builder.Services.AddScoped<ICourseRoundRepo,              CourseRoundRepo>();
builder.Services.AddScoped<ICourseRoundAssignmentRepo,    CourseRoundAssignmentRepo>();
builder.Services.AddScoped<ICourseRoundInstructorRepo,    CourseRoundInstructorRepo>();
builder.Services.AddScoped<ICompetencyResultRepo,         CompetencyResultRepo>();
builder.Services.AddScoped<IDashboardRepo,                DashboardRepo>();

builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler =
        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// Show full exception details to help diagnose 500 errors
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (error != null)
        {
            await context.Response.WriteAsJsonAsync(new
            {
                message = error.Error.Message,
                inner   = error.Error.InnerException?.Message,
                type    = error.Error.GetType().Name
            });
        }
    });
});

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();
