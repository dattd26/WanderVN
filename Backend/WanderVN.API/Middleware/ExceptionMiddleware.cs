using System.Net;
using System.Text.Json;
using System.Text.Encodings.Web;
using WanderVN.API.Common.Responses;

namespace WanderVN.API.Middleware
{
    public class ExceptionMiddleware
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Encoder = JavaScriptEncoder.Create(System.Text.Unicode.UnicodeRanges.All)
        };

        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(
            RequestDelegate next,
            ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                if (ex is ArgumentException || ex is UnauthorizedAccessException || ex is KeyNotFoundException)
                {
                    _logger.LogWarning("Business exception: {Message}", ex.Message);
                }
                else
                {
                    _logger.LogError(ex, "Unhandled system exception: {Message}", ex.Message);
                }

                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(
            HttpContext context,
            Exception exception)
        {
            context.Response.ContentType = "application/json; charset=utf-8";

            var statusCode = exception switch
            {
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                ArgumentException => (int)HttpStatusCode.BadRequest,
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                _ => (int)HttpStatusCode.InternalServerError
            };

            context.Response.StatusCode = statusCode;

            var message = statusCode == (int)HttpStatusCode.InternalServerError
                ? "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
                : exception.Message;

            var response = new ErrorResponse(
                message,
                statusCode
            );

            var jsonResponse = JsonSerializer.Serialize(response, JsonOptions);

            await context.Response.WriteAsync(jsonResponse);
        }
    }
}