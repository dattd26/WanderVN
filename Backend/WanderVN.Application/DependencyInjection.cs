using Microsoft.Extensions.DependencyInjection;
using WanderVN.Application.Mappings;

namespace WanderVN.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register AutoMapper
        services.AddAutoMapper(typeof(UserMappingProfile).Assembly);

        return services;
    }
}
