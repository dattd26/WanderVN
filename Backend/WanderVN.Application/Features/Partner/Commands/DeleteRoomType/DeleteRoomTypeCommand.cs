using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.DeleteRoomType;

// Command định nghĩa yêu cầu xóa hạng phòng di sản
public class DeleteRoomTypeCommand : IRequest<DeleteRoomTypeResponse>
{
    // Id của hạng phòng cần xóa, được bỏ qua khi binding từ Request Body do trích xuất từ Route URL
    [System.Text.Json.Serialization.JsonIgnore]
    public int RoomTypeId { get; set; }
}

// Kết quả trả về sau khi xóa hạng phòng thành công
public class DeleteRoomTypeResponse
{
    // Trạng thái thành công hay thất bại của hành động xóa
    public bool Success { get; set; }

    // Thông điệp kết quả trả về từ Backend
    public string Message { get; set; } = "Deleted";
}
