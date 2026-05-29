using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using WanderVN.API.Middleware;
using WanderVN.API.Services;
using WanderVN.Application.Common;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Repositories;

using WanderVN.Infrastructure;

var builder = WebApplication.CreateBuilder(args);


builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPartnerPayoutRepository, PartnerPayoutRepository>();

// Truy cập HttpContext từ Application layer (ICurrentUserService)
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(WanderVN.Application.Common.Interfaces.IApplicationDbContext).Assembly));

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Thiếu cấu hình Jwt:Secret");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // dev only — bật true ở production
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            NameClaimType = System.Security.Claims.ClaimTypes.Email,
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();

// Cấu hình CORS động từ appsettings.json để hỗ trợ URL Frontend khi deploy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                             ?? new[] { "http://localhost:5173", "http://localhost:5174", "https://wander-vn-silk.vercel.app" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Dán JWT lấy từ /api/v1/auth/login. KHÔNG cần prefix 'Bearer '."
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Kích hoạt CORS Middleware
app.UseCors("AllowFrontend");

app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// ★ Authentication PHẢI đặt trước Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();