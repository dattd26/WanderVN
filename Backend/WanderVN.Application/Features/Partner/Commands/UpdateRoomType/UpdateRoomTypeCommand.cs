using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.UpdateRoomType;

// Command định nghĩa yêu cầu chỉnh sửa và điều chỉnh số lượng phòng của hạng phòng di sản
public class UpdateRoomTypeCommand : IRequest<UpdateRoomTypeResponse>
{
    // Id của hạng phòng cần cập nhật, được bỏ qua khi binding từ Request Body
    [System.Text.Json.Serialization.JsonIgnore]
    public int RoomTypeId { get; set; }

    // Tên hạng phòng di sản mới
    public string Name { get; set; } = string.Empty;

    // Giá phòng cơ bản mỗi đêm
    public decimal BasePrice { get; set; }

    // Sức chứa tối đa của hạng phòng
    public int Capacity { get; set; }

    // Số lượng phòng khả dụng (dùng để thêm/bớt phòng tương ứng trong CSDL)
    public int TotalRooms { get; set; }
}

// Kết quả trả về sau khi cập nhật hạng phòng thành công
public class UpdateRoomTypeResponse
{
    // Trạng thái thành công hay thất bại của hành động cập nhật
    public bool Success { get; set; }

    // Thông điệp trả về từ hệ thống Backend
    public string Message { get; set; } = "Updated";
}
