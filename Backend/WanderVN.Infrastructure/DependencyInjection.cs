using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;
using WanderVN.Infrastructure.Repositories;
using WanderVN.Infrastructure.Services;

namespace WanderVN.Infrastructure;

/// <summary>
/// Lớp tĩnh cung cấp các phương thức mở rộng để đăng ký các dịch vụ thuộc tầng Infrastructure vào DI Container.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Đăng ký các dịch vụ của tầng Infrastructure bao gồm DbContext, Repositories và Unit of Work.
    /// </summary>
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<WanderVNDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<WanderVNDbContext>());
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Đăng ký Duffel Service với HttpClient
        services.AddHttpClient<IDuffelService, DuffelService>(c =>
        {
            c.BaseAddress = new Uri(configuration["Duffel:BaseUrl"] ?? "https://api.duffel.com/");
            var apiKey = configuration["Duffel:AccessToken"] ?? string.Empty;
            c.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
            c.DefaultRequestHeaders.Add("Duffel-Version", "v2");
        });

        services.AddScoped<IHotelRepository, HotelRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}
