using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.AddRoomType;

// Command định nghĩa yêu cầu thêm hạng phòng mới
public class AddRoomTypeCommand : IRequest<AddRoomTypeResponse>
{
    // Id khách sạn được trích xuất từ Route URL và bỏ qua khi binding từ Request Body
    [System.Text.Json.Serialization.JsonIgnore]
    public int HotelId { get; set; }

    // Tên hạng phòng di sản mới (Ví dụ: Executive Suite)
    public string Name { get; set; } = string.Empty;

    // Giá phòng cơ bản mỗi đêm
    public decimal BasePrice { get; set; }

    // Sức chứa khách tối đa của phòng
    public int Capacity { get; set; }

    // Tổng số lượng phòng thuộc loại này khả dụng trong hệ thống
    public int TotalRooms { get; set; }

    // Mô tả ngắn gọn về tiện ích và cấu trúc hạng phòng
    public string? Description { get; set; }
}

// Kết quả trả về sau khi thêm hạng phòng thành công
public class AddRoomTypeResponse
{
    // Id của hạng phòng vừa được tạo mới trong cơ sở dữ liệu
    public int RoomTypeId { get; set; }

    // Trạng thái xử lý hạng phòng
    public string Status { get; set; } = "Created";
}
