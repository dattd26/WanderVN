using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Partner.Commands.SubmitHotel;
using WanderVN.Application.Features.Partner.Commands.UploadHotelImage;
using WanderVN.Application.Features.Partner.Queries.GetMyHotels;

using WanderVN.Application.Features.Partner.Commands.AddRoomType;
using WanderVN.Application.Features.Partner.Commands.DeleteRoomType;
using WanderVN.Application.Features.Partner.Commands.UpdateRoomType;
using WanderVN.Application.Features.Partner.Commands.ToggleRoomBlock;
using WanderVN.Application.Features.Partner.Queries.GetHotelBookings;

namespace WanderVN.API.Controllers;

/// <summary>
/// Các endpoint dành riêng cho Partner (chủ cơ sở lưu trú) onboard và quản lý khách sạn.
/// Toàn bộ endpoint yêu cầu JWT hợp lệ và role "Partner".
/// </summary>
[Route("api/v1/partner")]
[ApiController]
[Authorize(Roles = "Partner")]
public class PartnerController : ControllerBase
{
    private readonly IMediator _mediator;

    public PartnerController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET: api/v1/partner/hotels — Danh sách khách sạn của đối tác (Dashboard).
    /// Hỗ trợ query string ?status=0 (Pending) | 1 (Approved) | 2 (Rejected).
    /// </summary>
    [HttpGet("hotels")]
    public async Task<IActionResult> GetMyHotels([FromQuery] int? status)
    {
        var query = new GetMyHotelsQuery { Status = status };
        var result = await _mediator.Send(query);
        return Ok(new ApiResponse<object>(true, "Lấy danh sách thành công.", 200, result));
    }

    /// <summary>
    /// POST: api/v1/partner/hotels — Submit khách sạn mới ở trạng thái Pending, chờ admin duyệt.
    /// </summary>
    [HttpPost("hotels")]
    public async Task<IActionResult> SubmitHotel([FromBody] SubmitHotelCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new ApiResponse<SubmitHotelResponse>(true, "Khách sạn đã được gửi và đang chờ duyệt.", 200, result));
    }

    /// <summary>
    /// POST: api/v1/partner/hotels/{hotelId}/images — Upload ảnh khách sạn lên Cloudinary
    /// và lưu metadata vào DB. Form-data field: <c>file</c> (file), <c>isPrimary</c> (bool, optional).
    /// </summary>
    [HttpPost("hotels/{hotelId:int}/images")]
    [RequestSizeLimit(10_000_000)] // 10MB / ảnh
    public async Task<IActionResult> UploadHotelImage(
        [FromRoute] int hotelId,
        [FromForm] IFormFile file,
        [FromForm] bool isPrimary = false)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Vui lòng chọn file ảnh để upload.");

        // Mở stream từ IFormFile và pass xuống MediatR — using để dispose sau khi handler xong
        await using var stream = file.OpenReadStream();

        var command = new UploadHotelImageCommand
        {
            HotelId = hotelId,
            FileStream = stream,
            FileName = file.FileName,
            IsPrimary = isPrimary
        };

        var result = await _mediator.Send(command);
        return Ok(new ApiResponse<UploadHotelImageResponse>(true, "Tải ảnh khách sạn thành công.", 200, result));
    }

    /// <summary>
    /// POST: api/v1/partner/hotels/{hotelId}/room-types — Thêm hạng phòng mới cho khách sạn của đối tác.
    /// </summary>
    [HttpPost("hotels/{hotelId:int}/room-types")]
    public async Task<IActionResult> AddRoomType(
        [FromRoute] int hotelId,
        [FromBody] AddRoomTypeCommand command)
    {
        command.HotelId = hotelId;
        var result = await _mediator.Send(command);
        return Ok(new ApiResponse<AddRoomTypeResponse>(true, "Thêm hạng phòng thành công.", 200, result));
    }

    /// <summary>
    /// DELETE: api/v1/partner/hotels/{hotelId}/room-types/{roomTypeId} — Xóa hạng phòng của khách sạn đối tác.
    /// </summary>
    [HttpDelete("hotels/{hotelId:int}/room-types/{roomTypeId:int}")]
    public async Task<IActionResult> DeleteRoomType(
        [FromRoute] int hotelId,
        [FromRoute] int roomTypeId)
    {
        var command = new DeleteRoomTypeCommand { RoomTypeId = roomTypeId };
        var result = await _mediator.Send(command);
        if (!result.Success)
            return BadRequest(new ErrorResponse(result.Message, 400));
        return Ok(new ApiResponse<DeleteRoomTypeResponse>(true, "Xóa hạng phòng thành công.", 200, result));
    }

    /// <summary>
    /// PUT: api/v1/partner/hotels/{hotelId}/room-types/{roomTypeId} — Cập nhật hạng phòng của khách sạn đối tác.
    /// </summary>
    [HttpPut("hotels/{hotelId:int}/room-types/{roomTypeId:int}")]
    public async Task<IActionResult> UpdateRoomType(
        [FromRoute] int hotelId,
        [FromRoute] int roomTypeId,
        [FromBody] UpdateRoomTypeCommand command)
    {
        command.RoomTypeId = roomTypeId;
        var result = await _mediator.Send(command);
        if (!result.Success)
            return BadRequest(new ErrorResponse(result.Message, 400));
        return Ok(new ApiResponse<UpdateRoomTypeResponse>(true, "Cập nhật hạng phòng thành công.", 200, result));
    }

    /// <summary>
    /// POST: api/v1/partner/hotels/{hotelId}/room-types/{roomTypeId}/toggle-block — Chặn hoặc gỡ chặn phòng khả dụng theo ngày cụ thể.
    /// </summary>
    [HttpPost("hotels/{hotelId:int}/room-types/{roomTypeId:int}/toggle-block")]
    public async Task<IActionResult> ToggleRoomBlock(
        [FromRoute] int hotelId,
        [FromRoute] int roomTypeId,
        [FromBody] ToggleRoomBlockCommand command)
    {
        command.RoomTypeId = roomTypeId;
        var result = await _mediator.Send(command);
        if (!result.Success)
            return BadRequest(new ErrorResponse(result.Message, 400));
        return Ok(new ApiResponse<ToggleRoomBlockResponse>(true, result.Message, 200, result));
    }

    /// <summary>
    /// GET: api/v1/partner/hotels/{hotelId}/bookings — Lấy danh sách đặt phòng của khách sạn dành cho Partner.
    /// </summary>
    [HttpGet("hotels/{hotelId:int}/bookings")]
    public async Task<IActionResult> GetHotelBookings([FromRoute] int hotelId)
    {
        var query = new GetHotelBookingsQuery { HotelId = hotelId };
        var result = await _mediator.Send(query);
        return Ok(new ApiResponse<object>(true, "Lấy danh sách đặt phòng thành công.", 200, result));
    }
}
