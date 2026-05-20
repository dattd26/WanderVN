using WanderVN.API.Middleware;
using WanderVN.Application.Common;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Repositories;

using WanderVN.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddScoped<IAuthRepository, AuthRepository>();

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(WanderVN.Application.Common.Interfaces.IApplicationDbContext).Assembly));

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Kích hoạt CORS Middleware
app.UseCors("AllowFrontend");

app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();