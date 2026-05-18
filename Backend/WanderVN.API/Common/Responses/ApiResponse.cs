namespace WanderVN.API.Common.Responses
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }

        public string Message { get; set; }

        public int StatusCode { get; set; }

        public T? Data { get; set; }

        public ApiResponse(bool success, string message, int statusCode, T? data)
        {
            Success = success;
            Message = message;
            StatusCode = statusCode;
            Data = data;
        }
    }
}