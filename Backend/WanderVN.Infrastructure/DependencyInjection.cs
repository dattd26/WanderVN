using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Models;
using WanderVN.Application.Features.Bookings.Commands.CreateFlightBooking;
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

        // Cấu hình & đăng ký dịch vụ gửi email tự động xác nhận
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        services.AddTransient<IEmailService, EmailService>();

        // Cấu hình & đăng ký Cloudinary - lưu trữ ảnh khách sạn, phòng, avatar
        services.Configure<CloudinarySettings>(configuration.GetSection("Cloudinary"));
        services.AddSingleton<IMediaStorageService, CloudinaryMediaStorageService>();

        // Cấu hình cache Redis cho kết quả tìm kiếm chuyến bay Duffel
        services.Configure<FlightSearchCacheSettings>(configuration.GetSection("FlightSearchCache"));
        var redisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrWhiteSpace(redisConnection))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = configuration["FlightSearchCache:RedisInstanceName"] ?? "WanderVN:";
            });
            services.AddScoped<IFlightSearchCacheService, FlightSearchCacheService>();
        }
        else
        {
            services.AddScoped<IFlightSearchCacheService, NoOpFlightSearchCacheService>();
        }

        // Đăng ký Duffel Service với HttpClient
        services.AddHttpClient<IDuffelService, DuffelService>(c =>
        {
            c.BaseAddress = new Uri(configuration["Duffel:BaseUrl"] ?? "https://api.duffel.com/");
            var apiKey = configuration["Duffel:AccessToken"] ?? string.Empty;
            c.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
            c.DefaultRequestHeaders.Add("Duffel-Version", "v2");
        });

        // Đăng ký Nominatim Geocoding Service (OpenStreetMap miễn phí)
        services.Configure<NominatimSettings>(configuration.GetSection("Nominatim"));
        services.AddHttpClient<IGeocodingService, NominatimGeocodingService>(c =>
        {
            c.BaseAddress = new Uri(configuration["Nominatim:BaseUrl"] ?? "https://nominatim.openstreetmap.org/");
            // Nominatim TOS BẮT BUỘC User-Agent định danh, vi phạm sẽ bị block IP
            var userAgent = configuration["Nominatim:UserAgent"] ?? "WanderVN/1.0 (dev@wandervn.local)";
            c.DefaultRequestHeaders.UserAgent.ParseAdd(userAgent);
        });

        // Đăng ký VNPay Service
        services.AddScoped<IVNPayService, VNPayService>();

        // Đăng ký ZaloPay Service với HttpClient
        services.AddHttpClient<IZaloPayService, ZaloPayService>();

        // Đăng ký VietQR Service với HttpClient
        services.AddHttpClient<IVietQRService, VietQRService>(c =>
        {
            c.BaseAddress = new Uri(configuration["VietQR:BaseUrl"] ?? "https://api.vietqr.io/");
            c.DefaultRequestHeaders.Add("x-client-id", configuration["VietQR:ClientId"] ?? "");
            c.DefaultRequestHeaders.Add("x-api-key", configuration["VietQR:ApiKey"] ?? "");
        });

        services.AddScoped<IHotelRepository, HotelRepository>();
        services.AddScoped<IHomeRepository, HomeRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPropertyTypeRepository, PropertyTypeRepository>();
        services.AddScoped<ISearchAutocompleteRepository, SearchAutocompleteRepository>();
        services.AddScoped<IPartnerRepository, PartnerRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IAirportRepository, AirportRepository>();
        services.AddScoped<IFlightBookingDataPersister, FlightBookingDataPersister>();

        // Register ChatBot Service
        services.AddScoped<IChatLogsRepository, ChatLogsRepository>();
        services.AddScoped<ISearchRepository, SearchRepository>();
        services.AddScoped<IHotelsRepository, HotelsRepository>();
        services.AddHttpClient<IChatbotService, ChatbotService>(c =>
        {
            c.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
            c.Timeout = TimeSpan.FromSeconds(30);
        });

        // Đăng ký Background Service đối soát và tạo Payout tự động
        services.AddHostedService<BookingSettlementBackgroundService>();
        services.AddHostedService<UnpaidBookingExpirationBackgroundService>();

        return services;
    }
}
