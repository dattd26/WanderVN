using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;
using WanderVN.Infrastructure.Repositories;

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

        return services;
    }
}
