namespace WanderVN.API.Common.Responses
{
    public class ErrorResponse
    {
        public bool Success { get; set; } = false;

        public string Message { get; set; }

        public int StatusCode { get; set; }

        public object? Errors { get; set; }

        public ErrorResponse(string message, int statusCode, object? errors = null)
        {
            Message = message;
            StatusCode = statusCode;
            Errors = errors;
        }
    }
}