using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Settings.Commands.UpdateSetting;
using WanderVN.Application.Features.Settings.Queries.GetSetting;
using WanderVN.Application.Features.Settings.DTOs;

namespace WanderVN.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class SettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> GetSetting(string key)
    {
        var result = await _mediator.Send(new GetSettingQuery { Key = key });
        if (result == null)
            return NotFound(new ErrorResponse("Không tìm thấy cài đặt.", 404));

        return Ok(new ApiResponse<SettingResponseDto>(true, "Lấy thông tin cài đặt thành công", 200, result));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{key}")]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingRequest request)
    {
        var result = await _mediator.Send(new UpdateSettingCommand { Key = key, Value = request.Value });
        if (result)
            return Ok(new ApiResponse<string>(true, "Cập nhật cài đặt thành công", 200, request.Value));

        return BadRequest(new ErrorResponse("Cập nhật cài đặt thất bại", 400));
    }
}

public class UpdateSettingRequest
{
    public string Value { get; set; } = null!;
}
