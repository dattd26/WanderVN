using System.Text.Json.Serialization;

namespace WanderVN.Application.DTOs.Response;

public class GeminiRequest
{
    [JsonPropertyName("contents")]
    public List<Content> Contents { get; set; } = new();
    
    [JsonPropertyName("systemInstruction")]
    public SystemInstruction? SystemInstruction { get; set; }
}

public class Content
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = "user";
    
    [JsonPropertyName("parts")]
    public List<Part> Parts { get; set; } = new();
}

public class Part
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
}

public class SystemInstruction
{
    [JsonPropertyName("parts")]
    public List<Part> Parts { get; set; } = new();
}

public class GeminiResponse
{
    [JsonPropertyName("candidates")]
    public List<Candidate>? Candidates { get; set; }
    
    [JsonPropertyName("usageMetadata")]
    public UsageMetadata? UsageMetadata { get; set; }
}

public class Candidate
{
    [JsonPropertyName("content")]
    public Content? Content { get; set; }
    
    [JsonPropertyName("finishReason")]
    public string? FinishReason { get; set; }
    
    [JsonPropertyName("safetyRatings")]
    public List<SafetyRating>? SafetyRatings { get; set; }
}

public class SafetyRating
{
    [JsonPropertyName("category")]
    public string? Category { get; set; }
    
    [JsonPropertyName("probability")]
    public string? Probability { get; set; }
}

public class UsageMetadata
{
    [JsonPropertyName("promptTokenCount")]
    public int PromptTokenCount { get; set; }
    
    [JsonPropertyName("candidatesTokenCount")]
    public int CandidatesTokenCount { get; set; }
    
    [JsonPropertyName("totalTokenCount")]
    public int TotalTokenCount { get; set; }
}
